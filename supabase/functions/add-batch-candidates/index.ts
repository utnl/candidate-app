import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing auth header");
    const jwt = authHeader.replace("Bearer ", "");
    const {
      data: { user },
    } = await supabaseAdmin.auth.getUser(jwt);
    if (!user) throw new Error("User not found");

    const candidates = await req.json();

    if (!Array.isArray(candidates) || candidates.length === 0) {
      throw new Error("Request body must be a non-empty array of candidates.");
    }

    const candidatesToInsert = candidates.map((candidate) => ({
      ...candidate,
      user_id: user.id,
      status: "New",
    }));

    const { error } = await supabaseAdmin
      .from("candidates")
      .insert(candidatesToInsert);

    if (error) throw error;

    return new Response(
      JSON.stringify({
        message: `Successfully inserted ${candidates.length} candidates.`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
