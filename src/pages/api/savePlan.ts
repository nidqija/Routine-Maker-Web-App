import { type APIRoute } from "astro";
import { createClient } from "@libsql/client";
import * as cookie from "cookie";

export const prerender = false;

export const turso = createClient({
  url: import.meta.env.DB_URL,
  authToken: import.meta.env.DB_TOKEN,
});

export const POST: APIRoute = async ({ request }) => {
  const { items } = await request.json();
  const cookies = cookie.parse(request.headers.get("cookie") || "");
  const username = cookies.session_username;
  
  try {
    // 🔧 Validate username presence
    if (!username) {
      return new Response(JSON.stringify({ success: false, error: "Username missing" }), { status: 400 });
    }

    // 🔧 Get user ID from username
    const userResult = await turso.execute(
      "SELECT user_id FROM User WHERE username = ?",
      [username]
    );

    if (!userResult.rows.length) {
      return new Response(JSON.stringify({ success: false, error: "User not found" }), { status: 404 });
    }

    const userID = userResult.rows[0].user_id;
    const planID = String(crypto.randomUUID());

    // 🔧 Insert each plan item
    for (const item of items) {
      console.log("Inserting item:", {
        planID,
        stepNumber: item.stepNumber,
        description: item.description
      });

      await turso.execute(
        "INSERT INTO Study_Plan (plan_id, user_id, plan_step, plan_description) VALUES (?, ?, ?, ?)",
        [
          planID,
          userID,
          Number(item.stepNumber),
          String(item.description)
        ]
      );
    }

    return new Response(JSON.stringify({ success: true, planID }), { status: 200 });

  } catch (error) {
    console.error("Error saving planned items:", error);

    let errorMessage = "Unknown error";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return new Response(JSON.stringify({ success: false, error: errorMessage }), { status: 500 });
  }
};
