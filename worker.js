
const ALLOWED_ORIGIN = "https://foci-kalkulator.norbertboti31.workers.dev";
const UPSTREAM = "https://footballdata.io/api/v1";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";
    const corsOrigin = origin === ALLOWED_ORIGIN ? ALLOWED_ORIGIN : "null";

    const cors = {
      "Access-Control-Allow-Origin": corsOrigin,
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Accept",
      "Vary": "Origin"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    if (request.method !== "GET") {
      return Response.json({ error: "Method not allowed" }, {
        status: 405, headers: cors
      });
    }

    const apiKey = env.API_FOOTBALL_KEY || env.API_FUTBALL_KULCS;
    if (!apiKey) {
      return Response.json({ error: "Hiányzik az API-kulcs titkos változója." }, {
        status: 500, headers: cors
      });
    }

    const path = url.pathname.replace(/^\/api/, "");
    const allowed = /^\/matches(?:\/[^/]+(?:\/(?:predictions|corners|probabilities))?)?$/.test(path);

    if (!allowed) {
      return Response.json({ error: "Unknown endpoint" }, {
        status: 404, headers: cors
      });
    }

    try {
      const response = await fetch(UPSTREAM + path + url.search, {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Accept": "application/json"
        }
      });

      return new Response(await response.text(), {
        status: response.status,
        headers: {
          ...cors,
          "Content-Type": response.headers.get("Content-Type") || "application/json",
          "Cache-Control": "no-store"
        }
      });
    } catch {
      return Response.json({ error: "Nem sikerült elérni a futballadat-szolgáltatót." }, {
        status: 502, headers: cors
      });
    }
  }
};

