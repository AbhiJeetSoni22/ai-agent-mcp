// test-google.js
import "dotenv/config";
import {
  createCalendarEvent,
  getEventsByDate,
} from "./mcp-server/services/calendarService.js";

async function runSanityCheck() {
  console.log("🚀 Starting Google Calendar Sanity Check...");

  try {
    // 1. Try to create a hardcoded event
    const testTitle = "Marketing meeting";
    const start = "2026-02-06T14:00:00Z";
    const end = "2026-02-06T15:00:00Z";
    console.log(
      "CLIENT_ID:",
      process.env.GOOGLE_CLIENT_ID ? "Loaded ✅" : "NOT LOADED ❌",
    );
    console.log(
      "REFRESH_TOKEN:",
      process.env.GOOGLE_REFRESH_TOKEN ? "Loaded ✅" : "NOT LOADED ❌",
    );
    console.log("--- Attempting to CREATE event ---");
    const eventId = await createCalendarEvent(testTitle, start, end);

    if (eventId) {
      console.log(`✅ SUCCESS! Event created. ID: ${eventId}`);
    } else {
      console.error("❌ FAILED: Function returned no ID.");
    }

    // 2. Try to list events for today
    console.log("\n--- Attempting to LIST events ---");
    const events = await getEventsByDate("2026-02-06");
    console.log(`✅ Found ${events.length} events on your calendar.`);

    events.forEach((e) => {
      console.log(`   - [${e.id}] ${e.summary}`);
    });
  } catch (error) {
    console.error("\n❌ CRITICAL AUTH OR API ERROR:");
    console.error(error.message);
    if (error.response) {
      console.error(
        "Data from Google:",
        JSON.stringify(error.response.data, null, 2),
      );
    }
  }
}

runSanityCheck();
