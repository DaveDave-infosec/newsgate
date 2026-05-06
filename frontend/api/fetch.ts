export const config = {
  runtime: "edge",
};

export default async function handler(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url) {
    return new Response(JSON.stringify({ error: "Missing url parameter" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!/^https?:\/\//i.test(url)) {
    return new Response(
      JSON.stringify({ error: "URL must start with http:// or https://" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const upstream = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!upstream.ok) {
      return new Response(
        JSON.stringify({
          error: `Upstream returned ${upstream.status}`,
          status: upstream.status,
        }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    const html = await upstream.text();

    return new Response(JSON.stringify({ html, url }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=300",
      },
    });
  } catch (err: unknown) {
    const e = err as { message?: string; name?: string };
    const isTimeout = e?.name === "TimeoutError" || e?.name === "AbortError";
    return new Response(
      JSON.stringify({
        error: isTimeout ? "Fetch timed out" : e?.message || "Fetch failed",
      }),
      { status: 504, headers: { "Content-Type": "application/json" } }
    );
  }
}
