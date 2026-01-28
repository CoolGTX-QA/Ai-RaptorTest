import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  action: "store" | "check";
  api_key?: string;
  integration_id?: string;
  workspace_id: string;
  integration_type: string;
  config?: Record<string, string>;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const encryptionKey = Deno.env.get("INTEGRATION_ENCRYPTION_KEY");
    
    if (!encryptionKey) {
      console.error("INTEGRATION_ENCRYPTION_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get the authorization header to verify the user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the user token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: RequestBody = await req.json();
    const { action, api_key, integration_id, workspace_id, integration_type, config } = body;

    // Verify user has admin access to the workspace
    const { data: member, error: memberError } = await supabaseAdmin
      .from("workspace_members")
      .select("role")
      .eq("workspace_id", workspace_id)
      .eq("user_id", user.id)
      .not("accepted_at", "is", null)
      .single();

    if (memberError || !member || member.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "You must be a workspace admin to manage integrations" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "store") {
      if (!api_key) {
        return new Response(
          JSON.stringify({ error: "API key is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Use pgcrypto AES encryption via database function
      const { data: encryptedData, error: encryptError } = await supabaseAdmin.rpc(
        "encrypt_api_key",
        {
          p_api_key: api_key,
          p_encryption_key: encryptionKey,
        }
      );

      if (encryptError) {
        console.error("Encryption error:", encryptError);
        return new Response(
          JSON.stringify({ error: "Failed to encrypt API key" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check if integration already exists
      const { data: existing } = await supabaseAdmin
        .from("workspace_integrations")
        .select("id")
        .eq("workspace_id", workspace_id)
        .eq("integration_type", integration_type)
        .maybeSingle();

      // Prepare safe config without sensitive keys
      const safeConfig = config ? { ...config } : {};
      delete safeConfig.api_key;
      delete safeConfig.api_token;

      if (existing) {
        // Update existing integration
        const { error: updateError } = await supabaseAdmin
          .from("workspace_integrations")
          .update({
            api_key_encrypted: encryptedData,
            config: safeConfig,
            is_active: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);

        if (updateError) {
          console.error("Error updating integration:", updateError);
          return new Response(
            JSON.stringify({ error: "Failed to update integration" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ success: true, integration_id: existing.id }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else {
        // Create new integration
        const { data: newIntegration, error: insertError } = await supabaseAdmin
          .from("workspace_integrations")
          .insert({
            workspace_id,
            integration_type,
            api_key_encrypted: encryptedData,
            config: safeConfig,
            is_active: true,
            connected_by: user.id,
          })
          .select("id")
          .single();

        if (insertError) {
          console.error("Error creating integration:", insertError);
          return new Response(
            JSON.stringify({ error: "Failed to create integration" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ success: true, integration_id: newIntegration.id }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    if (action === "check") {
      // Check if an integration has a stored API key (without returning the key)
      const { data: integration, error: checkError } = await supabaseAdmin
        .from("workspace_integrations")
        .select("id, api_key_encrypted, is_active")
        .eq("workspace_id", workspace_id)
        .eq("integration_type", integration_type)
        .maybeSingle();

      if (checkError) {
        return new Response(
          JSON.stringify({ error: "Failed to check integration" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          hasKey: !!integration?.api_key_encrypted,
          isActive: integration?.is_active ?? false,
          integrationId: integration?.id,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in manage-integration-keys:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
