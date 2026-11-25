import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://zamilone.github.io",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  const json = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
    });

  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Méthode non autorisée." }, 405);

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Session SCC manquante. Connecte-toi au dashboard puis recharge Screen Cast." }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const publishableKeys = JSON.parse(Deno.env.get("SUPABASE_PUBLISHABLE_KEYS") ?? "{}");
    const publishableKey = publishableKeys.default;
    if (!supabaseUrl || !publishableKey) return json({ error: "Configuration Supabase incomplète." }, 500);

    const userClient = createClient(supabaseUrl, publishableKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData.user) return json({ error: "Session SCC invalide. Reconnecte-toi au dashboard." }, 401);

    const domain = (Deno.env.get("METERED_DOMAIN") ?? "").trim().toLowerCase();
    const apiKey = Deno.env.get("METERED_TURN_API_KEY") ?? "";
    if (!domain || !apiKey) return json({
      error: "Relais TURN non configuré. Ajoute METERED_DOMAIN et METERED_TURN_API_KEY dans les secrets Supabase.",
      setupRequired: true,
    }, 503);
    if (!/^[a-z0-9-]+\.metered\.live$/.test(domain)) {
      return json({ error: "METERED_DOMAIN doit être le domaine Metered complet, par exemple monapp.metered.live." }, 500);
    }

    const url = new URL(`https://${domain}/api/v1/turn/credentials`);
    url.searchParams.set("apiKey", apiKey);
    const response = await fetch(url.toString(), { headers: { "Accept": "application/json" } });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !Array.isArray(payload)) {
      console.error("Metered TURN credentials request failed:", response.status);
      return json({ error: "Metered n'a pas fourni les serveurs TURN. Vérifie le domaine, la clé API et l'activation du service TURN." }, 502);
    }
    const iceServers = payload.filter((server: any) => {
      const urls = Array.isArray(server?.urls) ? server.urls : [server?.urls];
      return urls.length > 0 && urls.every((value: unknown) =>
        typeof value === "string" && /^(stun|turn|turns):/i.test(value)
      );
    });
    if (!iceServers.some((server: any) => {
      const urls = Array.isArray(server.urls) ? server.urls : [server.urls];
      return urls.some((value: string) => /^(turn|turns):/i.test(value));
    })) return json({ error: "Aucun serveur TURN valide n'a été retourné par Metered." }, 502);

    return json({ iceServers });
  } catch (error) {
    console.error("scc-turn-credentials:", error);
    return json({ error: "Impossible de récupérer la configuration TURN." }, 500);
  }
});
