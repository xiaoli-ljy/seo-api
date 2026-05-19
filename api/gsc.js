import { google } from "googleapis";

export default async function handler(req, res) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN,
  });

  const searchconsole = google.searchconsole({
    version: "v1",
    auth: oauth2Client,
  });

  try {
    // 获取站点
    const sitesResponse = await searchconsole.sites.list();
    const sites = sitesResponse.data.siteEntry || [];

    if (sites.length === 0) {
      return res.json({ sites: [], keywords: [] });
    }

    const siteUrl = sites[0].siteUrl;

    // 提取 domain（用于自动品牌识别）
    const domain = siteUrl
      .replace("https://", "")
      .replace("http://", "")
      .replace("sc-domain:", "")
      .replace("www.", "")
      .replace("/", "")
      .toLowerCase();

    const requestBody = {
      startDate: "2024-01-01",
      endDate: new Date().toISOString().split("T")[0],
      dimensions: ["query", "page"],
      rowLimit: 25000,
    };

    const analyticsResponse =
      await searchconsole.searchanalytics.query({
        siteUrl,
        requestBody,
      });

    const rows = analyticsResponse.data.rows || [];

    // ❗ 仅过滤真正无意义流量词（不动SEO词）
    const uselessWords = [
      "amazon",
      "ebay",
      "aliexpress",
      "walmart",
      "youtube",
      "facebook",
      "instagram",
      "tiktok",
      "reddit",
      "login",
      "sign in",
      "customer service",
    ];

    // ===============================
    // 🔥 自动品牌词识别函数（核心）
    // ===============================
    const isBrandQuery = (query) => {
      if (!query) return false;

      const q = query.toLowerCase();

      // 1. 包含域名关键词（最强信号）
      if (q.includes(domain)) return true;

      // 2. 包含去掉点的域名
      const cleanDomain = domain.replace(/\./g, "");
      if (q.includes(cleanDomain)) return true;

      // 3. 品牌短名（通常是 domain 第一段）
      const brandRoot = domain.split(".")[0];
      if (brandRoot && q.includes(brandRoot)) return true;

      return false;
    };

    const keywords = rows
      .map((row) => {
        const query = row.keys?.[0] || "";
        const page = row.keys?.[1] || "";

        return {
          query,
          landingPage: page,

          clicks: row.clicks || 0,
          impressions: row.impressions || 0,

          // CTR 转百分比（AI友好）
          ctr: Number(((row.ctr || 0) * 100).toFixed(2)),

          // position 保留1位小数
          position: Number((row.position || 0).toFixed(1)),

          // brand flag（关键新增）
          isBrand: isBrandQuery(query),
        };
      })

      // 1. impressions过滤
      .filter((item) => item.impressions > 50)

      // 2. position过滤（SEO机会区间）
      .filter(
        (item) => item.position >= 5 && item.position <= 40
      )

      // 3. 排除无意义词（平台垃圾流量）
      .filter((item) => {
        const q = item.query.toLowerCase();
        return !uselessWords.some((w) => q.includes(w));
      })

      // 4. 排除品牌词（自动识别）
      .filter((item) => !item.isBrand)

      // 5. 排序：曝光优先（SEO机会最大化）
      .sort((a, b) => b.impressions - a.impressions);

    return res.json({
      siteUrl,
      domain,
      total: keywords.length,
      keywords,
    });
  } catch (err) {
    console.error("GSC API Error:", err);

    return res.status(500).json({
      error: err.message,
    });
  }
}