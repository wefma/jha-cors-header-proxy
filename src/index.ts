export default {
  async fetch(request: Request): Promise<Response> {
    const ALLOWED_ORIGIN = "https://jha-summary.wefma.net";

    const TARGET_URL = "https://jha-summary-api.wefma.net/jha-scores.json";

    const url = new URL(request.url);

    // このWorkerのエンドポイント（必要なら変更）
    if (!url.pathname.startsWith("/corsproxy")) {
      return new Response("Not Found", { status: 404 });
    }

    // CORS preflight
    if (request.method === "OPTIONS") {
      // Originが一致する場合のみCORS応答（不要なら '*' ではなく拒否）
      const origin = request.headers.get("Origin");
      if (origin !== ALLOWED_ORIGIN) return new Response(null, { status: 403 });

      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
          "Access-Control-Allow-Methods": "GET,HEAD,OPTIONS",
          "Access-Control-Allow-Headers":
            request.headers.get("Access-Control-Request-Headers") ||
            "Content-Type",
          "Access-Control-Max-Age": "86400",
          Vary: "Origin",
        },
      });
    }

    // メソッド制限
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    // Originチェック（ブラウザ以外から叩かれても通るのが嫌なら強制）
    const origin = request.headers.get("Origin");
    if (origin !== ALLOWED_ORIGIN) {
      return new Response("Forbidden", { status: 403 });
    }

    // 転送するヘッダを最小に（Accept等だけ）
    const upstreamHeaders = new Headers();
    const accept = request.headers.get("Accept");
    if (accept) upstreamHeaders.set("Accept", accept);

    // upstreamへ
    const upstream = await fetch(TARGET_URL, {
      method: request.method,
      headers: upstreamHeaders,
      // cf: { cacheTtl: 300, cacheEverything: true }, // 必要ならキャッシュ
    });

    // 応答をコピーしてCORSを付与
    const resHeaders = new Headers(upstream.headers);
    resHeaders.set("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
    resHeaders.set("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS");
    resHeaders.set("Access-Control-Max-Age", "86400");
    resHeaders.set("Vary", "Origin");

    // セキュリティ的に不要な場合は cookie 系は落とす（念のため）
    resHeaders.delete("Set-Cookie");

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: resHeaders,
    });
  },
} satisfies ExportedHandler;
