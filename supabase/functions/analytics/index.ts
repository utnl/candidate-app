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

    const { count: totalCandidates, error: totalError } = await supabaseAdmin
      .from("candidates")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);
    if (totalError) throw totalError;

    const { data: statusDistribution, error: statusError } =
      await supabaseAdmin.rpc("get_status_distribution_for_user", {
        p_user_id: user.id,
      });
    if (statusError) throw statusError;

    const { data: topPositions, error: topPositionsError } =
      await supabaseAdmin.rpc("get_top_positions_for_user", {
        p_user_id: user.id,
      });
    if (topPositionsError) throw topPositionsError;

    const sevenDaysAgo = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000
    ).toISOString();
    const { count: newCandidates, error: newCandidatesError } =
      await supabaseAdmin
        .from("candidates")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", sevenDaysAgo);
    if (newCandidatesError) throw newCandidatesError;

    const analyticsData = {
      totalCandidates,
      statusDistribution,
      topPositions,
      newCandidatesInLast7Days: newCandidates,
    };

    return new Response(JSON.stringify(analyticsData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
