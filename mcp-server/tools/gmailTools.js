import { z } from "zod";
import {
  sendEmail,
  getUnreadEmails,
  getEmailContent,
} from "../services/gmailService.js";

/*
=====================================
GMAIL MCP TOOLS
=====================================
*/

export const gmailTools = [
  /*
  ==========================
  Send Email Tool
  ==========================
  */
  {
    name: "send_email",
    description: "Send an email using Gmail",
    schema: z.object({
      to: z.string().describe("Recipient email address"),
      subject: z.string().describe("Email subject"),
      body: z.string().describe("Email body content"),
      access_token: z.string().optional(),
      refresh_token: z.string().optional(),
    }),

    handler: async ({ to, subject, body, access_token, refresh_token }) => {
      try {
        const result = await sendEmail(to, subject, body, access_token, refresh_token);

        return {
          content: [
            {
              type: "text",
              text: `✅ Email sent successfully to ${to}`,
            },
          ],
        };
      } catch (err) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Failed to send email: ${err.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  },

  /*
  ==========================
  Get Unread Emails Tool
  ==========================
  */
  {
    name: "get_unread_emails",
    description: "Fetch latest unread emails from inbox",
    schema: z.object({
      access_token: z.string().optional(),
      refresh_token: z.string().optional(),
    }),

    handler: async ({ access_token, refresh_token }) => {
      try {
        const emails = await getUnreadEmails(access_token, refresh_token);
        console.log('running get email tool function')
        if (!emails.length) {
          return {
            content: [{ type: "text", text: "No unread emails 🎉" }],
          };
        }

        const text = emails
          .map(
            (e, i) =>
              `${i + 1}. From: ${e.from}
                Subject: ${e.subject}
                ID: ${e.id}`,
          )
          .join("\n\n");

        return {
          content: [{ type: "text", text }],
        };
      } catch (err) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Failed to fetch emails: ${err.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  },

  /*
==========================
Get Email Content Tool
==========================
*/
  {
    name: "get_email_content",
    description: "Read full body content of an email using its message ID",
    schema: z.object({
      messageId: z.string().describe("ID of the email message"),
      access_token: z.string().optional(),
      refresh_token: z.string().optional(),
    }),

    handler: async ({ messageId, access_token, refresh_token }) => {
      try {
        const content = await getEmailContent(messageId, access_token, refresh_token);

        return {
          content: [
            {
              type: "text",
              text: content,
            },
          ],
        };
      } catch (err) {
        return {
          content: [
            { type: "text", text: `❌ Failed to read email: ${err.message}` },
          ],
          isError: true,
        };
      }
    },
  },
];
