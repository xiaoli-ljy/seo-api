import * as cheerio from "cheerio";

export default async function handler(req, res) {
  try {
    const { url } = req.query;
    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "Missing or invalid query param: url" });
    }

    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch {
      return res.status(400).json({ error: "Invalid URL format" });
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return res.status(400).json({ error: "Only http/https URLs are allowed" });
    }

    const response = await fetch(parsedUrl.toString(), {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; seo-api-bot/1.0)" }
    });
    if (!response.ok) {
      return res.status(response.status).json({
        error: "Failed to fetch target URL",
        detail: `Upstream status: ${response.status}`
      });
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const headings = [];
    $("h1, h2, h3").each((i, el) => {
      if (i < 50) headings.push($(el).text().trim());
    });

    const paragraphs = [];
    $("p").each((i, el) => {
      if (i < 20) paragraphs.push($(el).text().trim());
    });

    return res.status(200).json({
      headings,
      summary: paragraphs.join(" ").slice(0, 2000)
    });
  } catch (error) {
    return res.status(500).json({
      error: "Unexpected error in extract handler",
      detail: error.message
    });
  }
}