export default async function handler(req, res) {
  try {
    const { keyword } = req.query;

    if (!keyword || typeof keyword !== "string") {
      return res.status(400).json({ error: "Missing or invalid query param: keyword" });
    }

    if (!process.env.SERP_API_KEY) {
      return res.status(500).json({ error: "SERP_API_KEY is not configured" });
    }

    const url = `https://serpapi.com/search.json?q=${encodeURIComponent(keyword)}&num=10&api_key=${process.env.SERP_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: "SERP API request failed",
        detail: data?.error || data
      });
    }

    const organicResults = Array.isArray(data?.organic_results) ? data.organic_results : [];
    const results = organicResults.map((r) => ({
      title: r.title || "",
      link: r.link || "",
      snippet: r.snippet || ""
    }));

    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({
      error: "Unexpected error in serpAPI handler",
      detail: error.message
    });
  }
}