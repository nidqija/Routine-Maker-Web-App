import { type APIRoute } from "astro";
import { createClient } from "@libsql/client";

export const prerender = false;

export const turso = createClient({
  url: import.meta.env.DB_URL,
  authToken: import.meta.env.DB_TOKEN,
});



export const POST: APIRoute = async ({ request }) => {
  let username;

  try {
    const body = await request.json();
    username = body.username;
  } catch (err) {
    return new Response(JSON.stringify({ error: "Invalid JSON input" }), { status: 400 });
  }

  if (!username) {
    return new Response(JSON.stringify({ error: "Username is required" }), { status: 400 });
  }

  // Example: check existing user
  const existing = await turso.execute({
    sql: `SELECT * FROM User WHERE username = ?`,
    args: [username],
  });

  if (existing.rows.length > 0) {
    return new Response(JSON.stringify({ error: "Username already taken!" }), { status: 400 });
  }

  await turso.execute({
    sql: "INSERT INTO User (username) VALUES (?)",
    args: [username],
  });

  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
