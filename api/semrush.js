process.emitWarning = () => {};  // 放在所有 import 之后
export default async function handler(req, res) {
  try {
    const { keyword, database = "us", type = "phrase_related" } = req.query;

    if (!keyword || typeof keyword !== "string") {
      return res.status(400).json({ error: "Missing or invalid query param: keyword" });
    }

    if (!process.env.SEMRUSH_API_KEY) {
      return res.status(500).json({ error: "SEMRUSH_API_KEY is not configured" });
    }

    if (typeof database !== "string" || typeof type !== "string") {
      return res.status(400).json({ error: "database and type must be strings" });
    }

    const url = `https://api.semrush.com/?type=${encodeURIComponent(type)}&key=${encodeURIComponent(process.env.SEMRUSH_API_KEY)}&phrase=${encodeURIComponent(keyword)}&database=${encodeURIComponent(database)}&display_limit=5`;

    const response = await fetch(url);
    const text = await response.text();

    if (!response.ok) {
      return res.status(response.status).json({
        error: "SEMrush request failed",
        detail: text
      });
    }

    if (!text || text.trim().length === 0) {
      return res.status(502).json({
        error: "SEMrush returned empty response"
      });
    }

    if (text.startsWith("ERROR")) {
      return res.status(502).json({
        error: "SEMrush API error",
        detail: text
      });
    }

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.status(200).send(text);
  } catch (error) {
    return res.status(500).json({
      error: "Unexpected error in semrush handler",
      detail: error.message
    });
  }
}