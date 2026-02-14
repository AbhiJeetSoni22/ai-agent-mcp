import { google } from "googleapis";
import { oAuth2Client } from "../../src/config/googleClient.js";


/*
=====================================
Send Email
=====================================
*/
export async function sendEmail(to, subject, body) {
  const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

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
    requestBody: { raw: encodedMessage },
  });

  return "Email sent successfully.";
}

/*
=====================================
Get Unread Emails
=====================================
*/
export async function getUnreadEmails() {
  const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

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

    const from =
      headers.find((h) => h.name === "From")?.value || "Unknown";

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
Get Email Content
=====================================
*/
export async function getEmailContent(messageId) {
  const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

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
