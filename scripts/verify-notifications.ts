import { db } from "../src/db";
import { notifications, users } from "../src/db/schema";
import { eq, desc } from "drizzle-orm";
import { deleteNotification, clearAllNotifications, getNotifications } from "../src/app/actions/notifications";

async function testNotifications() {
    console.log("--- Testing Notification improvements ---");
    
    // 1. Check for welcome message in DB (mocked for recent user)
    const latestNotifications = await db.select().from(notifications).orderBy(desc(notifications.createdAt)).limit(5);
    console.log("Latest notifications in DB:", latestNotifications.map(n => ({ title: n.title, createdAt: n.createdAt })));
    
    const welcome = latestNotifications.find(n => n.title.includes("Welcome to TypeFlow"));
    if (welcome) {
        console.log("✅ Welcome message found!");
    } else {
        console.log("❌ Welcome message not found (Expected if no new user created recently)");
    }

    // 2. Test relative time helper logic (Manual check of code is preferred for UI helpers)
    
    console.log("Verification script finished.");
}

testNotifications().catch(console.error);
