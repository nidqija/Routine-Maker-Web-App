import { GoogleGenerativeAI } from "@google/generative-ai";
import { type APIRoute } from "astro";

const genAI = new GoogleGenerativeAI(import.meta.env.GEMINI_API_KEY);

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const { prompt } = await request.json();

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return new Response(JSON.stringify({ result: text }), { status: 200 });
  } catch (err) {
    console.error("Gemini API error:", err);
    return new Response(JSON.stringify({ error: "Gemini request failed!" }), { status: 500 });
  }
};