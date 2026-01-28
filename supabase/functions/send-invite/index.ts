import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InviteRequest {
  inviteId: string;
  email: string;
  workspaceName: string;
  inviterName: string;
  role: string;
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

    const { inviteId, email, workspaceName, inviterName, role }: InviteRequest = await req.json();

    // Validate required fields
    if (!inviteId || !email || !workspaceName) {
      throw new Error("Missing required fields");
    }

    // Build the acceptance URL
    const baseUrl = Deno.env.get("SITE_URL") || req.headers.get("origin") || "https://ai-raptortest.lovable.app";
    const acceptUrl = `${baseUrl}/accept-invite?token=${inviteId}`;

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
      throw new Error(responseData.message || "Failed to send email");
    }

    console.log("Invitation email sent successfully:", responseData);

    return new Response(JSON.stringify({ success: true, ...responseData }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
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
