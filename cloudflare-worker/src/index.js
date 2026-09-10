/**
 * TMB Studio — media upload Worker
 * Receives image/video uploads from admin.html, checks the request
 * carries a valid Supabase session (so only you can upload), stores
 * the file in an R2 bucket, and returns its public URL.
 *
 * Deploy with: wrangler deploy
 */

const ALLOWED_ORIGINS = [
  "https://tmbstudio.my",
  "https://www.tmbstudio.my",
  "http://localhost:8000", // convenient for local testing; remove if unwanted
];

function corsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
  };
}

async function isAuthorized(request, env) {
  const authHeader = request.headers.get("Authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) return false;

  // Ask Supabase whether this access token belongs to a real, signed-in user.
  const res = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: env.SUPABASE_ANON_KEY,
    },
  });
  return res.ok;
}

function safeFileName(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-").toLowerCase();
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders(origin) });
    }

    const url = new URL(request.url);
    if (url.pathname !== "/upload" || request.method !== "POST") {
      return new Response("Not found", { status: 404, headers: corsHeaders(origin) });
    }

    const authorized = await isAuthorized(request, env);
    if (!authorized) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
      });
    }

    let form;
    try {
      form = await request.formData();
    } catch (e) {
      return new Response(JSON.stringify({ error: "Expected multipart/form-data" }), {
        status: 400,
        headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
      });
    }

    const file = form.get("file");
    if (!file || typeof file === "string") {
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400,
        headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
      });
    }

    const key = `${Date.now()}-${crypto.randomUUID()}-${safeFileName(file.name || "upload")}`;

    await env.MEDIA_BUCKET.put(key, file.stream(), {
      httpMetadata: { contentType: file.type || "application/octet-stream" },
    });

    const publicUrl = `${env.PUBLIC_R2_URL.replace(/\/$/, "")}/${key}`;

    return new Response(JSON.stringify({ url: publicUrl, key }), {
      status: 200,
      headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
    });
  },
};
