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
    }),

    handler: async ({ to, subject, body }) => {
      try {
        const result = await sendEmail(to, subject, body);

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
    schema: z.any(),


    handler: async () => {
      try {
        const emails = await getUnreadEmails();

        if (!emails.length) {
          return {
            content: [{ type: "text", text: "No unread emails 🎉" }],
          };
        }

        const text = emails
          .map((e, i) => `${i + 1}. From: ${e.from}\nSubject: ${e.subject}`)
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
    }),

    handler: async ({ messageId }) => {
      try {
        const content = await getEmailContent(messageId);

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
