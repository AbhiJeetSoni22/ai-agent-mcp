import fs from "fs";
import path from "path";
import { google } from "googleapis";

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.readonly",
];

const TOKEN_PATH = path.resolve("token.json");
const CREDENTIALS_PATH = path.resolve("gmailCredentials.json");

/*
=====================================
Authorize user (OAuth)
=====================================
*/
export async function authorize() {
  const content = fs.readFileSync(CREDENTIALS_PATH);
  const credentials = JSON.parse(content);

  const { client_secret, client_id, redirect_uris } = credentials.installed;

  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0],
  );

  // If token exists → reuse
  if (fs.existsSync(TOKEN_PATH)) {
    const token = fs.readFileSync(TOKEN_PATH);
    oAuth2Client.setCredentials(JSON.parse(token));
    return oAuth2Client;
  }

  // First time login
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });

  console.log("\n🔐 Authorize this app by visiting:\n", authUrl);

  const readline = await import("readline");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const code = await new Promise((resolve) =>
    rl.question("\nPaste code here: ", resolve),
  );

  rl.close();

  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);

  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));

  console.log("✅ Token saved. Next time login not required.\n");

  return oAuth2Client;
}

/*
=====================================
Send Email
=====================================
*/
export async function sendEmail(to, subject, body) {
  const auth = await authorize();
  const gmail = google.gmail({ version: "v1", auth });

  const message = [
    `To: ${to}`,
    "Content-Type: text/plain; charset=utf-8",
    "MIME-Version: 1.0",
    `Subject: ${subject}`,
    "",
    body,
  ].join("\n");

  const encodedMessage = Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw: encodedMessage,
    },
  });

  return "Email sent successfully.";
}

/*
=====================================
Get Unread Emails
=====================================
*/
export async function getUnreadEmails() {
  const auth = await authorize();
  const gmail = google.gmail({ version: "v1", auth });

  const res = await gmail.users.messages.list({
    userId: "me",
    q: "is:unread",
    maxResults: 5,
  });

  if (!res.data.messages) return [];

  const messages = [];

  for (const msg of res.data.messages) {
    const m = await gmail.users.messages.get({
      userId: "me",
      id: msg.id,
    });

    const headers = m.data.payload.headers;

    const subject =
      headers.find((h) => h.name === "Subject")?.value || "No subject";

    const from = headers.find((h) => h.name === "From")?.value || "Unknown";

    messages.push({
      id: msg.id,
      subject,
      from,
    });
  }

  return messages;
}

/*
=====================================
Get Email Content by ID
=====================================
*/
export async function getEmailContent(messageId) {
  const auth = await authorize();
  const gmail = google.gmail({ version: "v1", auth });

  const res = await gmail.users.messages.get({
    userId: "me",
    id: messageId,
  });

  const payload = res.data.payload;

  function extractBody(part) {
    if (part.body?.data) {
      return Buffer.from(part.body.data, "base64").toString("utf-8");
    }

    if (part.parts) {
      for (const p of part.parts) {
        const text = extractBody(p);
        if (text) return text;
      }
    }

    return "";
  }

  return extractBody(payload) || "No content found.";
}
