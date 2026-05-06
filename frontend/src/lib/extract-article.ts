export function extractArticleText(html: string): string {
  let cleaned = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<head\b[^>]*>[\s\S]*?<\/head>/gi, "")
    .replace(/<nav\b[^>]*>[\s\S]*?<\/nav>/gi, "")
    .replace(/<footer\b[^>]*>[\s\S]*?<\/footer>/gi, "")
    .replace(/<aside\b[^>]*>[\s\S]*?<\/aside>/gi, "");

  const articleMatch = cleaned.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i);
  const mainMatch = cleaned.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);

  if (articleMatch && articleMatch[1].length > 500) {
    cleaned = articleMatch[1];
  } else if (mainMatch && mainMatch[1].length > 500) {
    cleaned = mainMatch[1];
  }

  let text = cleaned.replace(/<[^>]+>/g, " ");

  text = text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&[a-z]+;/gi, " ");

  text = text.replace(/\s+/g, " ").trim();

  return text;
}

export async function fetchAndExtract(
  url: string,
  maxChars: number = 8000
): Promise<{ text: string; source: "vercel" | "jina" }> {
  try {
    const res = await fetch(`/api/fetch?url=${encodeURIComponent(url)}`);
    if (res.ok) {
      const data = (await res.json()) as { html?: string; error?: string };
      if (data.html) {
        const text = extractArticleText(data.html);
        if (text.length >= 200) {
          return {
            text: text.slice(0, maxChars),
            source: "vercel",
          };
        }
      }
    }
  } catch {
    // fall through to Jina fallback
  }

  try {
    const jinaUrl = `https://r.jina.ai/${url}`;
    const res = await fetch(jinaUrl, {
      headers: { Accept: "text/plain" },
    });
    if (res.ok) {
      const text = await res.text();
      if (text.length >= 200) {
        return {
          text: text.slice(0, maxChars),
          source: "jina",
        };
      }
    }
  } catch {
    // fall through to error
  }

  throw new Error(
    "Could not fetch readable text from this URL. The site may block scrapers or require JavaScript."
  );
}
