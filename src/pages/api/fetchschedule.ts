import { type APIRoute } from "astro";
import * as cookie from "cookie";
import { createClient } from "@libsql/client";

export const prerender = false;

const turso = createClient({
  url: import.meta.env.DB_URL,
  authToken: import.meta.env.DB_TOKEN,
});

export const GET: APIRoute = async ({ request }) => {
  const cookies = cookie.parse(request.headers.get("cookie") || "");
  const username = cookies.session_username;

  try {
    if (!username) {
      return new Response(JSON.stringify({ success: false, error: "username missing" }), { status: 400 });
    }

    const userResult = await turso.execute(
      "SELECT * FROM User WHERE username = ?",
      [username]
    );

    if (!userResult.rows.length) {
      return new Response(JSON.stringify({ success: false, error: "User not found" }), { status: 404 });
    }

    const userID = userResult.rows[0].user_id;

    const fetchStudyPlan = await turso.execute(
      "SELECT * FROM Study_Plan WHERE user_id = ?",
      [userID]
    );

    return new Response(JSON.stringify({ success: true, studyPlans: fetchStudyPlan.rows }), { status: 200 });
  } catch (err) {
    console.log("API GET/studyplan error:", err);
    return new Response(JSON.stringify({ success: false, error: 'internal error' }), { status: 500 });
  }
};
