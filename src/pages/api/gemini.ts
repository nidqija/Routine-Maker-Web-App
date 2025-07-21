import { type APIRoute } from "astro";
import { GoogleGenerativeAI } from "@google/generative-ai";


const GenAI = new GoogleGenerativeAI(import.meta.env.GEMINI_API_KEY);

export const prerender = false;


export const POST : APIRoute = async ({request})=>{
    const {prompt} = await request.json();


    try {
        const model = GenAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        return new Response(JSON.stringify({result: text}),{status : 200});

    } catch(err){
        console.error(err);
        return new Response(JSON.stringify({error : "Gemini request failed!"}),{
            status : 500,
        });
    }
};