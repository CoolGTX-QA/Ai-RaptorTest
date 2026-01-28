import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InviteRequest {
  workspaceId: string;
  workspaceName: string;
  email: string;
  role: string;
  inviterId: string;
  inviterName: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    // Get auth header to verify the user is authenticated
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      throw new Error("Not authenticated");
    }

    // Create admin client to bypass RLS
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Create user client to verify permissions
    const supabaseUser = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      throw new Error("Not authenticated");
    }

    const { workspaceId, workspaceName, email, role, inviterId, inviterName }: InviteRequest = await req.json();

    // Validate required fields
    if (!workspaceId || !email || !role) {
      throw new Error("Missing required fields: workspaceId, email, role");
    }

    // Verify the user has manager+ access to this workspace
    const { data: hasAccess } = await supabaseAdmin.rpc('has_workspace_access', {
      p_workspace_id: workspaceId,
      p_user_id: user.id,
      p_min_role: 'manager'
    });

    if (!hasAccess) {
      throw new Error("You don't have permission to invite members to this workspace");
    }

    // Check if user already exists in profiles
    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    if (existingProfile) {
      // Check if already a member
      const { data: existingMember } = await supabaseAdmin
        .from("workspace_members")
        .select("id")
        .eq("workspace_id", workspaceId)
        .eq("user_id", existingProfile.id)
        .maybeSingle();

      if (existingMember) {
        throw new Error("This user is already a member of this workspace");
      }

      // Add user as member directly
      const { error: memberError } = await supabaseAdmin
        .from("workspace_members")
        .insert({
          workspace_id: workspaceId,
          user_id: existingProfile.id,
          role: role,
          invited_by: inviterId,
          accepted_at: new Date().toISOString(),
        });

      if (memberError) {
        console.error("Error adding member:", memberError);
        throw new Error("Failed to add member");
      }

      // Log activity
      await supabaseAdmin.from("activity_logs").insert({
        user_id: inviterId,
        action_type: "create",
        entity_type: "member",
        entity_id: existingProfile.id,
        entity_name: existingProfile.full_name || email,
        workspace_id: workspaceId,
        details: { action: "added", role, email: email.toLowerCase() },
      });

      return new Response(JSON.stringify({ 
        success: true, 
        message: "Member added directly",
        memberAdded: true 
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Check for existing pending invite
    const { data: existingInvite } = await supabaseAdmin
      .from("workspace_invites")
      .select("id")
      .eq("workspace_id", workspaceId)
      .eq("email", email.toLowerCase())
      .is("accepted_at", null)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (existingInvite) {
      throw new Error("An invitation has already been sent to this email");
    }

    // Create invite record using admin client (bypasses RLS)
    const { data: inviteData, error: inviteError } = await supabaseAdmin
      .from("workspace_invites")
      .insert({
        workspace_id: workspaceId,
        email: email.toLowerCase(),
        role: role,
        invited_by: inviterId,
      })
      .select()
      .single();

    if (inviteError) {
      console.error("Error creating invite:", inviteError);
      throw new Error("Failed to create invitation");
    }

    // Log activity
    await supabaseAdmin.from("activity_logs").insert({
      user_id: inviterId,
      action_type: "create",
      entity_type: "member",
      entity_name: email.toLowerCase(),
      workspace_id: workspaceId,
      details: { action: "invited", role, email: email.toLowerCase() },
    });

    // Build the acceptance URL
    const baseUrl = Deno.env.get("SITE_URL") || req.headers.get("origin") || "https://ai-raptortest.lovable.app";
    const acceptUrl = `${baseUrl}/accept-invite?token=${inviteData.id}`;

    // Send email using Resend API
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "TMT Platform <onboarding@resend.dev>",
        to: [email],
        subject: `You've been invited to join ${workspaceName}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Workspace Invitation</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">🎉 You're Invited!</h1>
            </div>
            
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none;">
              <p style="font-size: 16px; margin-bottom: 20px;">
                Hi there! 👋
              </p>
              
              <p style="font-size: 16px; margin-bottom: 20px;">
                <strong>${inviterName || "Someone"}</strong> has invited you to join the workspace <strong>"${workspaceName}"</strong> on the Test Management Tool platform.
              </p>
              
              <p style="font-size: 14px; color: #6b7280; margin-bottom: 20px;">
                You've been assigned the role of <strong style="color: #7c3aed;">${role}</strong>.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${acceptUrl}" 
                   style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Accept Invitation
                </a>
              </div>
              
              <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
                If you don't have an account yet, you'll be able to create one after clicking the button above.
              </p>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              
              <p style="font-size: 12px; color: #9ca3af; text-align: center;">
                This invitation will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.
              </p>
              
              <p style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 10px;">
                Can't click the button? Copy and paste this link:<br>
                <a href="${acceptUrl}" style="color: #667eea; word-break: break-all;">${acceptUrl}</a>
              </p>
            </div>
          </body>
          </html>
        `,
      }),
    });

    const responseData = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("Resend API error:", responseData);
      // Invite was created, but email failed - still return success with warning
      return new Response(JSON.stringify({ 
        success: true, 
        message: "Invitation created but email delivery may have failed",
        emailSent: false,
        inviteId: inviteData.id
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log("Invitation email sent successfully:", responseData);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Invitation sent successfully",
      emailSent: true,
      inviteId: inviteData.id,
      ...responseData 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-invite function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
