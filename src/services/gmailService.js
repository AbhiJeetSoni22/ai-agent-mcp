import { google } from "googleapis";

/*
=====================================
Create Gmail Client (PER USER)
=====================================
*/
function getGmailClient(access_token, refresh_token) {
  const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oAuth2Client.setCredentials({
    access_token,
    refresh_token,
  });

  return google.gmail({
    version: "v1",
    auth: oAuth2Client,
  });
}

/*
=====================================
Send Email
=====================================
*/
export async function sendEmail(
  to,
  subject,
  body,
  access_token,
  refresh_token
) {
  const gmail = getGmailClient(access_token, refresh_token);

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
export async function getUnreadEmails(
  access_token,
  refresh_token
) {
  const gmail = getGmailClient(access_token, refresh_token);

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
export async function getEmailContent(
  messageId,
  access_token,
  refresh_token
) {
  const gmail = getGmailClient(access_token, refresh_token);

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