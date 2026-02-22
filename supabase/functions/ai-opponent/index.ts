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
    const { playerSpells, playerHealth, enemyHealth, enemyMana } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a snarky, witty British wizard opponent in a magical duel. You must respond with a JSON object (no markdown) containing:
- "spell": one of "Expelliarmus", "Protego", "Stupefy", "Incendio", "Lumos" (choose strategically)
- "taunt": a short, in-character taunt (max 15 words, British wizard style, snarky but family-friendly)
- "strategy": "offensive", "defensive", or "counter" based on the situation

Rules:
- If your health is below 30, prefer "Protego" (defensive)
- If the player just used the same spell twice, counter it
- If you have high mana and player health is low, go offensive
- Be creative and theatrical with taunts
- Reference famous wizard duels occasionally`;

    const userMessage = `Game state:
- Player's last 3 spells: ${JSON.stringify(playerSpells || [])}
- Player health: ${playerHealth}/100
- Your health: ${enemyHealth}/100  
- Your mana: ${enemyMana}/100
Choose your next move wisely.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "duel_response",
              description: "Generate the opponent wizard's next move and taunt",
              parameters: {
                type: "object",
                properties: {
                  spell: {
                    type: "string",
                    enum: ["Expelliarmus", "Protego", "Stupefy", "Incendio", "Lumos"],
                  },
                  taunt: { type: "string" },
                  strategy: {
                    type: "string",
                    enum: ["offensive", "defensive", "counter"],
                  },
                },
                required: ["spell", "taunt", "strategy"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "duel_response" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, try again shortly" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI error:", response.status, text);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    let result;
    if (toolCall?.function?.arguments) {
      result = JSON.parse(toolCall.function.arguments);
    } else {
      // Fallback
      result = { spell: "Stupefy", taunt: "Is that all you've got, muggle?", strategy: "offensive" };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-opponent error:", e);
    // Fallback response so the game still works
    return new Response(
      JSON.stringify({
        spell: "Protego",
        taunt: "You'll have to do better than that!",
        strategy: "defensive",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
