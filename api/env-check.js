export default async function handler(req, res) {
  try {
    const result = {
      success: true,
      timestamp: new Date().toISOString(),
      environment: {
        OPENAI_API_KEY: checkEnv("OPENAI_API_KEY"),
        SERP_API_KEY: checkEnv("SERP_API_KEY"),
        SEMRUSH_API_KEY: checkEnv("SEMRUSH_API_KEY"),
        CLIENT_ID: checkEnv("CLIENT_ID"),
        CLIENT_SECRET: checkEnv("CLIENT_SECRET"),
        REDIRECT_URI: checkEnv("REDIRECT_URI"),
        ACCESS_TOKEN: checkEnv("ACCESS_TOKEN"),
        REFRESH_TOKEN: checkEnv("REFRESH_TOKEN")
      }
    };

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

function checkEnv(key) {
  const value = process.env[key];

  if (!value) {
    return {
      status: "❌ missing",
      message: "未配置"
    };
  }

  const masked = value.length > 8
    ? value.slice(0, 4) + "****" + value.slice(-2)
    : "****";

  return {
    status: "✅ ok",
    preview: masked
  };
}