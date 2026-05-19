import { google } from "googleapis";

export default async function handler(req, res) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
  );

  const { code } = req.query;

  try {
    const { tokens } = await oauth2Client.getToken(code);

    console.log("OAuth tokens received:", {
      token_type: tokens.token_type,
      expiry_date: tokens.expiry_date,
      scope: tokens.scope,
      has_refresh_token: !!tokens.refresh_token
    });

    res.send(`
      <h3>Authorization Successful</h3>
      <p>Refresh token (last 8 chars): ...${tokens.refresh_token?.slice(-8)}</p>
      <p>Please update REFRESH_TOKEN in Vercel environment variables.</p>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send("auth failed");
  }
}