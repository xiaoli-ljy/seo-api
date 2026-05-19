export default async function handler(req, res) {
  console.log('[semrush-url] Request received, URL:', req.query.url);
  try {
    const { url } = req.query;

    if (!url || typeof url !== "string") {
      console.log('[semrush-url] Missing or invalid url');
      return res.status(400).json({ error: "Missing or invalid query param: url" });
    }

    if (!process.env.SEMRUSH_API_KEY) {
      console.log('[semrush-url] SEMRUSH_API_KEY not configured');
      return res.status(500).json({ error: "SEMRUSH_API_KEY is not configured" });
    }

    let normalizedUrl = url;
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }
    console.log('[semrush-url] Normalized URL:', normalizedUrl);

    const apiKey = process.env.SEMRUSH_API_KEY;
    const limit = 10;
    const columns = 'Ph,Po,Ur,Tr';

    const semrushUrl = `https://api.semrush.com/?type=subfolder_organic&key=${encodeURIComponent(apiKey)}&subfolder=${encodeURIComponent(normalizedUrl.replace(/^https?:\/\//, ''))}&database=us&display_limit=${limit}&export_columns=${columns}`;
    console.log('[semrush-url] SEMrush request URL:', semrushUrl.replace(/key=[^&]+/i, 'key=***'));

    const response = await fetch(semrushUrl);
    const text = await response.text();

    if (!response.ok) {
      console.log('[semrush-url] SEMrush request failed with status:', response.status);
      return res.status(response.status).json({
        error: "SEMrush request failed",
        detail: text
      });
    }

    if (text.startsWith("ERROR")) {
      let suggestion = "";
      if (text.includes("ERROR 50")) {
        suggestion = "该子目录下没有找到数据，请检查 URL 是否正确。";
      } else if (text.includes("ERROR 40")) {
        suggestion = "API key 无效或已过期，请检查 SEMRUSH_API_KEY 环境变量配置。";
      } else if (text.includes("ERROR 100")) {
        suggestion = "请求参数有误，请检查 URL 格式是否正确。";
      }
      console.log('[semrush-url] SEMrush returned error:', text);
      return res.status(502).json({
        error: "SEMrush API error",
        detail: text,
        suggestion: suggestion
      });
    }

    const lines = text.trim().split('\n');
    console.log('[semrush-url] Total lines in response:', lines.length);

    if (lines.length < 2) {
      console.log('[semrush-url] No data lines, returning empty pages');
      return res.status(200).json({ pages: [] });
    }

    const headerLine = lines[0];
    const headers = headerLine.split(';').map(h => h.trim());
    console.log('[semrush-url] Headers:', headers);
    const keywordIndex = headers.indexOf('Keyword');
    const positionIndex = headers.indexOf('Position');
    const searchVolumeIndex = headers.indexOf('Search Volume');
    const cpcIndex = headers.indexOf('CPC');
    const urlIndex = headers.indexOf('Url');

    const pages = [];
    for (let i = 1; i < Math.min(lines.length, limit + 1); i++) {
      const line = lines[i];
      if (!line || !line.includes(";")) continue;
      const parts = line.split(';').map(p => p.trim());

      const keyword = keywordIndex >= 0 ? (parts[keywordIndex] || "") : "";
      const position = positionIndex >= 0 ? (parseInt(parts[positionIndex], 10) || 0) : 0;
      const searchVolume = searchVolumeIndex >= 0 ? (parseInt(parts[searchVolumeIndex], 10) || 0) : 0;
      const cpc = cpcIndex >= 0 ? (parseFloat(parts[cpcIndex]) || 0) : 0;
      const pageUrl = urlIndex >= 0 ? (parts[urlIndex] || "") : "";

      if (keyword) {
        pages.push({
          keyword,
          position,
          searchVolume,
          cpc,
          url: pageUrl
        });
      }
    }
    console.log('[semrush-url] Parsed pages count:', pages.length);

    return res.status(200).json({ pages });
  } catch (error) {
    console.error('[semrush-url] Unexpected error:', error);
    return res.status(500).json({
      error: "Unexpected error in semrush-url handler",
      detail: error.message
    });
  }
}