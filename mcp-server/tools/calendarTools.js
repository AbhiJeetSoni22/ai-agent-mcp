import { z } from "zod";
import {
  getEventsByDate,
  createCalendarEvent,
  deleteCalendarEvent,
  updateCalendarEvent,
} from "../services/calendarService.js";

/**
 * MCP Tool Definitions
 * These tools are exported as an array so they can be
 * registered in a loop within mcpServer.js.
 */
export const calendarTools = [
  {
    name: "getEvents",
    description: "Get all calendar events for a specific date (YYYY-MM-DD)",

    schema: z.object({
      date: z
        .string()
        .describe("The date in YYYY-MM-DD format (e.g., 2026-02-05)"),

      access_token: z.string().optional(),
      refresh_token: z.string().optional(),
    }),
    handler: async ({ date, access_token, refresh_token }) => {
      try {
       

        console.error("TOKENS RECEIVED:", access_token, refresh_token);
        const events = await getEventsByDate(
          date,
          access_token,
          refresh_token
        );

        if (!events || events.length === 0) {
          return {
            content: [{ type: "text", text: `No events found for ${date}.` }],
          };
        }

        const text = events
          .map((e) => {
            const time = e.start.dateTime
              ? new Date(e.start.dateTime).toLocaleTimeString("en-IN", {
                timeZone: "Asia/Kolkata",
              })
              : e.start.date;
            return `- ${e.summary} (ID: ${e.id}) at ${time}`;
          })
          .join("\n");

        return {
          content: [{ type: "text", text: `Events for ${date}:\n${text}` }],
        };
      } catch (err) {
        return {
          content: [
            { type: "text", text: `Error fetching events: ${err.message}` },
          ],
          isError: true,
        };
      }
    },
  },

  {
    name: "createEvent",
    description: "Create a new Google Calendar event",
    schema: z.object({
      title: z.string().describe("Title of the meeting or event"),
      startTime: z
        .string()
        .describe("ISO Start time (e.g., 2026-02-05T10:00:00Z)"),
      endTime: z.string().describe("ISO End time (e.g., 2026-02-05T11:00:00Z)"),

      access_token: z.string().optional(),
      refresh_token: z.string().optional(),
    }),
    handler: async ({ title, startTime, endTime, access_token, refresh_token }) => {
      try {
        const eventId = await createCalendarEvent(
          title,
          startTime,
          endTime,
          access_token,
          refresh_token
        );
        // If eventId is undefined, this will throw an error instead of fake success
        if (!eventId) throw new Error("Google API returned no ID");

        return {
          content: [
            {
              type: "text",
              text: `SUCCESS: Event created. Google ID: ${eventId}`,
            },
          ],
        };
      } catch (err) {
        return {
          content: [{ type: "text", text: `ERROR: ${err.message}` }],
          isError: true,
        };
      }
    },
  },

  {
    name: "deleteEvent",
    description: "Delete a calendar event using its unique event ID",
    schema: z.object({
      eventId: z
        .string()
        .describe("The unique ID of the calendar event to be deleted"),

      access_token: z.string().optional(),
      refresh_token: z.string().optional(),
    }),
    handler: async ({ eventId, access_token, refresh_token }) => {
      try {
        await deleteCalendarEvent(eventId, access_token, refresh_token);
        return {
          content: [
            {
              type: "text",
              text: `Successfully deleted event with ID: ${eventId}`,
            },
          ],
        };
      } catch (err) {
        return {
          content: [
            { type: "text", text: `Error deleting event: ${err.message}` },
          ],
          isError: true,
        };
      }
    },
  },

  {
    name: "updateEvent",
    description: "Update the start time of an existing calendar event",
    schema: z.object({
      eventId: z.string().describe("The ID of the event you wish to update"),
      newTime: z.string().describe("The new ISO Start time for the event"),

  access_token: z.string().optional(),
  refresh_token: z.string().optional(),
    }),
    handler: async ({ eventId, newTime, access_token, refresh_token }) => {
      try {
        await updateCalendarEvent(
          eventId,
          newTime,
          access_token,
          refresh_token
        );
        return {
          content: [
            {
              type: "text",
              text: `Successfully updated event ${eventId} to new time: ${newTime}`,
            },
          ],
        };
      } catch (err) {
        return {
          content: [
            { type: "text", text: `Error updating event: ${err.message}` },
          ],
          isError: true,
        };
      }
    },
  },
  {
    name: "deleteEventsByDate",
    description: "Delete ALL calendar events for a specific date (YYYY-MM-DD)",
    schema: z.object({
      date: z
        .string()
        .describe(
          "The date in YYYY-MM-DD format whose events should be deleted",
        ),

  access_token: z.string().optional(),
  refresh_token: z.string().optional(),
    }),
    handler: async ({ date, access_token, refresh_token }) => {
      try {
        const events = await getEventsByDate(
          date,
          access_token,
          refresh_token
        );


        if (!events || events.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: `No events found for ${date}. Nothing to delete.`,
              },
            ],
          };
        }

        // 🔥 loop delete on server side (NOT LLM side)
        for (const event of events) {
          await deleteCalendarEvent(
            event.id,
            access_token,
            refresh_token
          );
        }

        return {
          content: [
            {
              type: "text",
              text: `Successfully deleted ${events.length} events for ${date}.`,
            },
          ],
        };
      } catch (err) {
        return {
          content: [
            { type: "text", text: `Error deleting events: ${err.message}` },
          ],
          isError: true,
        };
      }
    },
  },
];
