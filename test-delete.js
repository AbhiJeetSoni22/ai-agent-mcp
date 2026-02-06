// test-delete.js
import "dotenv/config";
import { deleteCalendarEvent, getEventsByDate } from "./mcp-server/services/calendarService.js";

async function testDelete() {
  const eventIdToDelete = "9tit66omqv6qq9fvcn7vbnkkng"; // Replace with your actual ID from the previous log
  
  console.log(`🚀 Attempting to delete event: ${eventIdToDelete}`);

  try {
    await deleteCalendarEvent(eventIdToDelete);
    console.log("✅ SUCCESS! Event deleted from Google.");

    // Verify it's gone
    console.log("\n--- Verifying with a List call ---");
    const events = await getEventsByDate("2026-02-05");
    const exists = events.find(e => e.id === eventIdToDelete);
    
    if (!exists) {
      console.log("🎉 Confirmation: Event is no longer in the list!");
    } else {
      console.log("⚠️ Warning: Event still appears in the list.");
    }
  } catch (error) {
    console.error("❌ DELETE FAILED:", error.message);
  }
}

testDelete();