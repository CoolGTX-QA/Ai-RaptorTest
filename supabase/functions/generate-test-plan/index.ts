import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { baseUrl, apis, urls } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    if (!baseUrl) throw new Error("baseUrl is required");

    const apiContext = apis?.length
      ? `\n\nBackend APIs configured:\n${apis.map((a: any) => `- ${a.api_name}: ${a.endpoint_url} (auth: ${a.auth_type})`).join("\n")}`
      : "";

    const urlContext = urls?.length
      ? `\n\nFrontend URLs to test:\n${urls.map((u: any) => `- ${u.url_name}: ${u.start_url}${u.extra_instructions ? ` (${u.extra_instructions})` : ""}`).join("\n")}`
      : "";

    const systemPrompt = `You are an expert QA automation engineer. Given a web application URL and optional context about its APIs and pages, generate a comprehensive test plan with 8-15 test cases.

Analyze the application type from the URL and context to produce RELEVANT test cases. Consider:
- Common user flows for that type of application
- Authentication/login flows if credentials are provided  
- Navigation and routing
- Form validation and submission
- Error handling and edge cases
- Responsive design
- API integrations if backends are configured
- Data persistence and state management

You MUST respond with a JSON array using the tool provided. Each test case must have:
- test_number: sequential number starting from 1
- priority: "critical", "high", "medium", or "low"
- test_name: concise descriptive name
- test_description: detailed description of what to test and expected behavior
- test_type: "frontend", "api", or "e2e"`;

    const userPrompt = `Generate a test plan for this web application:

Base URL: ${baseUrl}${apiContext}${urlContext}

Analyze the URL and context to determine what kind of application this is and generate relevant, specific test cases. Do NOT generate generic placeholder tests.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "generate_test_plan",
                description: "Return a list of test cases for the analyzed application.",
                parameters: {
                  type: "object",
                  properties: {
                    test_cases: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          test_number: { type: "number" },
                          priority: { type: "string", enum: ["critical", "high", "medium", "low"] },
                          test_name: { type: "string" },
                          test_description: { type: "string" },
                          test_type: { type: "string", enum: ["frontend", "api", "e2e"] },
                        },
                        required: ["test_number", "priority", "test_name", "test_description", "test_type"],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ["test_cases"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "generate_test_plan" } },
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      console.error("No tool call in response:", JSON.stringify(result));
      return new Response(
        JSON.stringify({ error: "Failed to generate test plan" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const parsed = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify({ test_cases: parsed.test_cases }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("generate-test-plan error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
