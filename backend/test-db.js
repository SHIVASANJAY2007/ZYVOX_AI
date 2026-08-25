import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { initDb, query } from './database/db.js';
import {
  createUser,
  findUserByEmail,
  findUserById,
  updateLastLogin,
  createTravelPlan,
  getTravelPlansByUser,
  getTravelPlanById,
  updateTravelPlan,
  deleteTravelPlan,
  saveMessage,
  getChatHistory,
  getRecentChatHistory
} from './database/dbService.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load dotenv from root folder (CWD)
dotenv.config();

// Load dotenv from backend folder
dotenv.config({ path: path.resolve(__dirname, '.env') });

const runTests = async () => {
  console.log("--- Starting Database Integration Tests ---");
  
  try {
    // 1. Initialize DB and Create tables
    await initDb();
    console.log("PASS: Database initialized and tables verified");

    // Clear old test data first if it exists
    await query("DELETE FROM personal_details WHERE email = $1", ["test@zyvox.ai"]);
    
    // 2. Create User
    const name = "Test Explorer";
    const phone = "1234567890";
    const email = "test@zyvox.ai";
    const password = "securepassword";
    
    const user = await createUser(name, phone, email, password);
    console.log("PASS: User created successfully", user);
    if (!user.person_id || user.name !== name || user.email !== email) {
      throw new Error("Created user details do not match input");
    }

    // 3. Find User by Email
    const foundByEmail = await findUserByEmail(email);
    console.log("PASS: Found user by email");
    if (!foundByEmail || foundByEmail.person_id !== user.person_id) {
      throw new Error("Failed to find user by email correctly");
    }

    // 4. Verify password hash
    const match = await bcrypt.compare(password, foundByEmail.password_hash);
    if (!match) {
      throw new Error("Password verification failed against stored hash");
    }
    console.log("PASS: Password hashed and matched successfully");

    // 5. Find User by ID
    const foundById = await findUserById(user.person_id);
    console.log("PASS: Found user by ID");
    if (!foundById || foundById.email !== email) {
      throw new Error("Failed to find user by ID correctly");
    }

    // 6. Update Last Login
    const updatedUser = await updateLastLogin(user.person_id);
    console.log("PASS: Updated last login", updatedUser.last_login);
    if (!updatedUser.last_login) {
      throw new Error("Last login was not updated");
    }

    // 7. Create Travel Plan
    const travel = await createTravelPlan(
      user.person_id,
      "New York",
      "Paris",
      "2026-09-01",
      "2026-09-12",
      "Eiffel Tower tour, Michelin dining",
      "Flight",
      true,
      "Ritz Paris",
      false
    );
    console.log("PASS: Created travel plan", travel);
    if (travel.source !== "New York" || travel.destination !== "Paris") {
      throw new Error("Travel plan fields do not match");
    }

    // 8. Get All Travel Plans for User
    const plans = await getTravelPlansByUser(user.person_id);
    console.log("PASS: Retrieved travel plans by user, count:", plans.length);
    if (plans.length !== 1 || plans[0].travel_id !== travel.travel_id) {
      throw new Error("Failed to retrieve travel plans by user");
    }

    // 9. Get specific travel plan
    const specificPlan = await getTravelPlanById(travel.travel_id);
    console.log("PASS: Retrieved specific travel plan");
    if (!specificPlan || specificPlan.destination !== "Paris") {
      throw new Error("Failed to retrieve specific travel plan");
    }

    // 10. Update Travel Plan
    const updatedPlan = await updateTravelPlan(travel.travel_id, {
      destination: "London",
      hotel_name: "The Savoy"
    });
    console.log("PASS: Updated travel plan", updatedPlan);
    if (updatedPlan.destination !== "London" || updatedPlan.hotel_name !== "The Savoy") {
      throw new Error("Failed to update travel plan");
    }

    // 11. Save Chat Message
    const chatMsg = await saveMessage(
      user.person_id,
      "session-abc-123",
      "user",
      "Hello Concierge! Help me plan a luxury trip."
    );
    console.log("PASS: Saved chat message", chatMsg);

    // Save assistant response
    await saveMessage(
      user.person_id,
      "session-abc-123",
      "assistant",
      "Welcome! I can certainly help you plan a trip to London."
    );

    // 12. Get Chat History for session
    const chatHistory = await getChatHistory(user.person_id, "session-abc-123");
    console.log("PASS: Retrieved chat history for session, count:", chatHistory.length);
    if (chatHistory.length !== 2) {
      throw new Error("Failed to retrieve correct chat history");
    }

    // 13. Get Recent Chat History
    const recent = await getRecentChatHistory(5);
    console.log("PASS: Retrieved recent chat history globally, count:", recent.length);

    // 14. Delete Travel Plan
    const deleted = await deleteTravelPlan(travel.travel_id);
    console.log("PASS: Deleted travel plan", deleted);

    // Clean up user
    await query("DELETE FROM personal_details WHERE email = $1", ["test@zyvox.ai"]);
    console.log("PASS: Cleaned up test user");

    console.log("\nALL INTEGRATION TESTS PASSED SUCCESSFULLY! ✅");
    process.exit(0);

  } catch (error) {
    console.error("FAIL: Test failed with error:", error);
    process.exit(1);
  }
};

runTests();
