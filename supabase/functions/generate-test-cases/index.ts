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
    const { description, inputType, priority, testType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    if (!description?.trim()) throw new Error("Description is required");

    const inputLabel = inputType === "user_story" ? "User Story" : inputType === "requirements" ? "Requirements Document" : "Feature Description";

    const systemPrompt = `You are an expert QA engineer. Given a ${inputLabel}, generate comprehensive test cases.

Generate 4-8 test cases that thoroughly cover the described functionality. Consider:
- Happy path scenarios
- Error/edge cases
- Validation rules
- Security aspects (if applicable)
- Boundary conditions

You MUST respond using the tool provided. Each test case must have:
- name: concise descriptive name
- description: what is being tested
- priority: "${priority || "medium"}" unless the test warrants a different priority ("critical", "high", "medium", "low")
- type: "${testType || "functional"}" or another relevant type ("functional", "security", "performance", "integration")
- steps: array of { action, expected } pairs describing each step`;

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
            { role: "user", content: `Generate test cases for:\n\n${description}` },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "generate_test_cases",
                description: "Return generated test cases.",
                parameters: {
                  type: "object",
                  properties: {
                    test_cases: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string" },
                          description: { type: "string" },
                          priority: { type: "string", enum: ["critical", "high", "medium", "low"] },
                          type: { type: "string" },
                          steps: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                action: { type: "string" },
                                expected: { type: "string" },
                              },
                              required: ["action", "expected"],
                              additionalProperties: false,
                            },
                          },
                        },
                        required: ["name", "description", "priority", "type", "steps"],
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
          tool_choice: { type: "function", function: { name: "generate_test_cases" } },
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
          JSON.stringify({ error: "AI credits exhausted." }),
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
        JSON.stringify({ error: "Failed to generate test cases" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const parsed = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify({ test_cases: parsed.test_cases }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("generate-test-cases error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
