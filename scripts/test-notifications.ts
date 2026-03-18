// Load environment variables FIRST before any imports
import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(__dirname, "../.env") });

// Now import after env is loaded
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import { Event } from "@/models/Event";
import { Booking } from "@/models/Booking";
import { Notification } from "@/models/Notification";
import { createInAppNotification } from "@/server/notifications/service";

async function testNotifications() {
  try {
    console.log("🧪 Starting notification system tests...\n");

    await connectToDatabase();
    console.log("✅ Connected to database\n");

    // Test 1: Check notification models
    console.log("📋 Test 1: Checking notification models...");
    const notificationCount = await Notification.countDocuments();
    console.log(`   Found ${notificationCount} notifications in database`);

    // Test 2: Check users
    console.log("\n👥 Test 2: Checking users...");
    const userCount = await User.countDocuments();
    console.log(`   Found ${userCount} users in database`);

    if (userCount === 0) {
      console.log("   ⚠️  No users found. Please run: npm run db:seed");
      process.exit(1);
    }

    // Test 3: Check events
    console.log("\n🎉 Test 3: Checking events...");
    const eventCount = await Event.countDocuments();
    console.log(`   Found ${eventCount} events in database`);

    // Test 4: Check for events 15 days from now
    console.log("\n📅 Test 4: Checking for events 15 days from now...");
    const reminderDate = new Date();
    reminderDate.setDate(reminderDate.getDate() + 15);

    const startDate = new Date(reminderDate);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(reminderDate);
    endDate.setHours(23, 59, 59, 999);

    const upcomingEvents = await Event.find({
      startsAt: {
        $gte: startDate,
        $lte: endDate,
      },
      status: "PUBLISHED",
    }).lean();

    console.log(`   Found ${upcomingEvents.length} events starting on ${reminderDate.toLocaleDateString()}`);

    if (upcomingEvents.length > 0) {
      upcomingEvents.forEach(event => {
        console.log(`   - ${event.title} at ${new Date(event.startsAt).toLocaleString()}`);
      });
    } else {
      console.log(`   ℹ️  To test event reminders, create an event starting on ${reminderDate.toLocaleDateString()}`);
    }

    // Test 5: Check bookings
    console.log("\n🎫 Test 5: Checking bookings...");
    const bookingCount = await Booking.countDocuments();
    const confirmedBookings = await Booking.countDocuments({ status: "CONFIRMED" });
    console.log(`   Found ${bookingCount} total bookings (${confirmedBookings} confirmed)`);

    // Test 6: Check unread notifications per user
    console.log("\n🔔 Test 6: Checking unread notifications...");
    const users = await User.find().limit(5).lean();

    for (const user of users) {
      const unreadCount = await Notification.countDocuments({
        userId: user._id,
        read: false,
      });
      console.log(`   ${user.name} (${user.email}): ${unreadCount} unread notifications`);
    }

    // Test 7: Create a test notification
    console.log("\n✨ Test 7: Creating test notification...");
    const testUser = await User.findOne().lean();

    if (testUser) {
      await createInAppNotification({
        userId: String(testUser._id),
        type: "EVENT_UPDATE",
        title: "Test Notification",
        message: "This is a test notification created by the test script.",
        link: "/",
        metadata: {
          testRun: true,
          timestamp: new Date().toISOString(),
        },
      });
      console.log(`   ✅ Test notification created for ${testUser.email}`);
    }

    // Test 8: Check notification types distribution
    console.log("\n📊 Test 8: Notification types distribution...");
    const notificationTypes = await Notification.aggregate([
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    if (notificationTypes.length > 0) {
      notificationTypes.forEach(type => {
        console.log(`   ${type._id}: ${type.count}`);
      });
    } else {
      console.log("   No notifications found");
    }

    // Test 9: Check student verifications
    console.log("\n🎓 Test 9: Checking student verifications...");
    const studentsApproved = await User.countDocuments({
      studentVerificationStatus: "APPROVED",
    });
    const studentsPending = await User.countDocuments({
      studentVerificationStatus: "PENDING",
    });
    const studentsRejected = await User.countDocuments({
      studentVerificationStatus: "REJECTED",
    });

    console.log(`   Approved: ${studentsApproved}`);
    console.log(`   Pending: ${studentsPending}`);
    console.log(`   Rejected: ${studentsRejected}`);

    // Test 10: Check email verified users
    console.log("\n📧 Test 10: Checking email verification status...");
    const emailVerified = await User.countDocuments({
      emailVerifiedAt: { $ne: null },
    });
    const emailUnverified = await User.countDocuments({
      emailVerifiedAt: null,
    });

    console.log(`   Verified: ${emailVerified}`);
    console.log(`   Unverified: ${emailUnverified}`);

    // Summary
    console.log("\n" + "=".repeat(50));
    console.log("📝 SUMMARY");
    console.log("=".repeat(50));
    console.log(`✅ Database connection: OK`);
    console.log(`✅ Users: ${userCount}`);
    console.log(`✅ Events: ${eventCount}`);
    console.log(`✅ Bookings: ${bookingCount} (${confirmedBookings} confirmed)`);
    console.log(`✅ Notifications: ${notificationCount}`);
    console.log(`✅ Events in 15 days: ${upcomingEvents.length}`);
    console.log(`✅ Email verified users: ${emailVerified}/${userCount}`);
    console.log(`✅ Student verifications: ${studentsApproved} approved`);

    console.log("\n🎉 All tests completed successfully!");
    console.log("\n📖 Next steps:");
    console.log("   1. Start the dev server: npm run dev");
    console.log("   2. Login and check the notification bell");
    console.log("   3. Test booking flow to trigger notifications");
    console.log("   4. Create an event as admin to test NEW_EVENT notifications");
    console.log("   5. Run: npm run reminders:send (to test event reminders)");
    console.log("\n📚 See TESTING_GUIDE.md for detailed testing instructions\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error running tests:", error);
    process.exit(1);
  }
}

testNotifications();
