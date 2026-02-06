import { calendar } from "../tools/calendarAuth.js";

/**
 * Ensures a date string is in proper ISO 8601 format for Google.
 * If the LLM sends "2026-02-05 20:00:00", this converts it to a valid string.
 */
function formatToISO(dateStr) {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr; 
    return d.toISOString();
}

export async function getEventsByDate(date) {
    // 1. Parse the date and force it to the start of that day in UTC
    const start = new Date(date);
    start.setUTCHours(0, 0, 0, 0);
    
    // 2. Set the end to the very end of that same day in UTC
    const end = new Date(date);
    end.setUTCHours(23, 59, 59, 999);

    console.log(`[Debug] Searching from: ${start.toISOString()} to ${end.toISOString()}`);

    const res = await calendar.events.list({
        calendarId: 'primary',
        timeMin: start.toISOString(),
        timeMax: end.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
    });

    return res.data.items || [];
}
export async function createCalendarEvent(title, startTime, endTime) {
  try {
    const res = await calendar.events.insert({
      calendarId: "primary",
      requestBody: {
        summary: title,
        start: { dateTime: new Date(startTime).toISOString() },
        end: { dateTime: new Date(endTime).toISOString() },
      },
    });
    return res.data.id;
  } catch (error) {
    // This sends the REAL Google error back to the AI
    throw new Error(`Google API Reject: ${error.response?.data?.error?.message || error.message}`);
  }
}

export async function deleteCalendarEvent(eventId) {
    await calendar.events.delete({
        calendarId: "primary",
        eventId,
    });
}

export async function updateCalendarEvent(eventId, newTime) {
    // 1. Get current event to preserve other details (like title)
    const event = await calendar.events.get({
        calendarId: "primary",
        eventId,
    });

    const start = new Date(newTime);
    const end = new Date(start.getTime() + 60 * 60 * 1000); // Default 1 hour duration

    await calendar.events.update({
        calendarId: "primary",
        eventId,
        requestBody: {
            ...event.data,
            start: { dateTime: start.toISOString(), timeZone: 'UTC' },
            end: { dateTime: end.toISOString(), timeZone: 'UTC' },
        },
    });
}