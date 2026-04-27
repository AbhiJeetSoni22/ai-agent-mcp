import { google } from "googleapis";

/**
 * Ensures a date string is in proper ISO 8601 format for Google.
 * If the LLM sends "2026-02-05 20:00:00", this converts it to a valid string.
 */

function getCalendarClient(access_token, refresh_token) {
  const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oAuth2Client.setCredentials({
    access_token,
    refresh_token,
  });

  return google.calendar({
    version: "v3",
    auth: oAuth2Client,
  });
}


function formatToISO(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toISOString();
}

export async function getEventsByDate(date, access_token, refresh_token) {
  const calendar = getCalendarClient(access_token, refresh_token);

  const start = new Date(date);
  start.setUTCHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setUTCHours(23, 59, 59, 999);

  const res = await calendar.events.list({
    calendarId: "primary",
    timeMin: start.toISOString(),
    timeMax: end.toISOString(),
    singleEvents: true,
    orderBy: "startTime",
  });

  return res.data.items || [];
}

export async function createCalendarEvent(
  title,
  startTime,
  endTime,
  access_token,
  refresh_token
) {
  const calendar = getCalendarClient(access_token, refresh_token);

  const res = await calendar.events.insert({
    calendarId: "primary",
    requestBody: {
      summary: title,
      start: { dateTime: startTime },
      end: { dateTime: endTime },
    },
  });

  return res.data.id;
}


export async function deleteCalendarEvent(
  eventId,
  access_token,
  refresh_token
) {
  const calendar = getCalendarClient(access_token, refresh_token);
  await calendar.events.delete({
    calendarId: "primary",
    eventId,
  });
}

export async function updateCalendarEvent(
  eventId,
  newTime,
  access_token,
  refresh_token
) {
  // 1. Get current event to preserve other details (like title)
  const calendar = getCalendarClient(access_token, refresh_token);
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
      start: { dateTime: start.toISOString(), timeZone: "UTC" },
      end: { dateTime: end.toISOString(), timeZone: "UTC" },
    },
  });
}
