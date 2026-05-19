export default async function handler(req, res) {
  console.log('[semrush-url-keywords] Request received, URL:', req.query.url);
  try {
    const { url } = req.query;

    if (!url || typeof url !== "string") {
      console.log('[semrush-url-keywords] Missing or invalid url');
      return res.status(400).json({ error: "Missing or invalid query param: url" });
    }

    if (!process.env.SEMRUSH_API_KEY) {
      console.log('[semrush-url-keywords] SEMRUSH_API_KEY not configured');
      return res.status(500).json({ error: "SEMRUSH_API_KEY is not configured" });
    }

    let normalizedUrl = url;
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }
    if (!normalizedUrl.includes('www.')) {
      normalizedUrl = normalizedUrl.replace(/^(https?:\/\/)/, '$1www.');
    }
    console.log('[semrush-url-keywords] Normalized URL:', normalizedUrl);

    const semrushUrl = `https://api.semrush.com/?type=url_organic&key=${encodeURIComponent(process.env.SEMRUSH_API_KEY)}&url=${encodeURIComponent(normalizedUrl)}&database=us&display_limit=10&export_columns=Ph,P0,Nq,Cp,Kd`;
    console.log('[semrush-url-keywords] SEMrush request URL:', semrushUrl.replace(/key=[^&]+/i, 'key=***'));

    const response = await fetch(semrushUrl);
    console.log('[semrush-url-keywords] SEMrush response status:', response.status);
    const text = await response.text();
    console.log('[semrush-url-keywords] SEMrush response text (first 500 chars):', text.substring(0, 500));

    if (!response.ok) {
      console.log('[semrush-url-keywords] SEMrush request failed with status:', response.status);
      return res.status(response.status).json({
        error: "SEMrush request failed",
        detail: text
      });
    }

    if (text.startsWith("ERROR")) {
      let suggestion = "";
      if (text.includes("ERROR 50")) {
        suggestion = "您的 SEMrush API key 可能没有 domain_analytics 或 organic_research 权限。请检查您的 API key 权限配置，或联系 SEMrush 客服升级权限。";
      } else if (text.includes("ERROR 40")) {
        suggestion = "API key 无效或已过期，请检查 SEMRUSH_API_KEY 环境变量配置。";
      } else if (text.includes("ERROR 100")) {
        suggestion = "请求参数有误，请检查 URL 格式是否正确。";
      }
      console.log('[semrush-url-keywords] SEMrush returned error:', text);
      return res.status(502).json({
        error: "SEMrush API error",
        detail: text,
        suggestion: suggestion
      });
    }

    const lines = text.trim().split('\n');
    console.log('[semrush-url-keywords] Total lines in response:', lines.length);
    if (lines.length < 2) {
      console.log('[semrush-url-keywords] No data lines, returning empty keywords');
      return res.status(200).json({ keywords: [] });
    }

    const headerLine = lines[0];
    console.log('[semrush-url-keywords] Header line:', headerLine);
    if (headerLine.startsWith("ERROR")) {
      let suggestion = "";
      if (headerLine.includes("ERROR 50")) {
        suggestion = "您的 SEMrush API key 可能没有 domain_analytics 或 organic_research 权限。请检查您的 API key 权限配置，或联系 SEMrush 客服升级权限。";
      } else if (headerLine.includes("ERROR 40")) {
        suggestion = "API key 无效或已过期，请检查 SEMRUSH_API_KEY 环境变量配置。";
      } else if (headerLine.includes("ERROR 100")) {
        suggestion = "请求参数有误，请检查 URL 格式是否正确。";
      }
      console.log('[semrush-url-keywords] Header line contains error:', headerLine);
      return res.status(502).json({
        error: "SEMrush API error",
        detail: headerLine,
        suggestion: suggestion
      });
    }

    // 解析表头，确定各列位置
    const headers = headerLine.split(';').map(h => h.trim());
    console.log('[semrush-url-keywords] Headers:', headers);
    const keywordIndex = headers.indexOf('Keyword');
    const positionIndex = headers.indexOf('Position');
    const searchVolumeIndex = headers.indexOf('Search Volume');
    const cpcIndex = headers.indexOf('CPC');
    const keywordDifficultyIndex = headers.indexOf('Keyword Difficulty');

    const keywords = [];
    for (let i = 1; i < Math.min(lines.length, 11); i++) {
      const line = lines[i];
      if (!line || !line.includes(";")) continue;
      const parts = line.split(';').map(p => p.trim());
      
      const keyword = keywordIndex >= 0 ? (parts[keywordIndex] || "") : "";
      const position = positionIndex >= 0 ? (parseInt(parts[positionIndex], 10) || 0) : 0;
      const searchVolume = searchVolumeIndex >= 0 ? (parseInt(parts[searchVolumeIndex], 10) || 0) : 0;
      const cpc = cpcIndex >= 0 ? (parseFloat(parts[cpcIndex]) || 0) : 0;
      const keywordDifficulty = keywordDifficultyIndex >= 0 ? (parseFloat(parts[keywordDifficultyIndex]) || 0) : 0;
      
      if (keyword) {
        keywords.push({
          keyword,
          position,
          searchVolume,
          cpc,
          keywordDifficulty
        });
      }
    }
    console.log('[semrush-url-keywords] Parsed keywords count:', keywords.length);

    return res.status(200).json({ keywords: keywords });
  } catch (error) {
    console.error('[semrush-url-keywords] Unexpected error:', error);
    return res.status(500).json({
      error: "Unexpected error in semrush-url-keywords handler",
      detail: error.message
    });
  }
}
