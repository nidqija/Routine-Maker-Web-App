import { type APIRoute } from "astro";
import { createClient } from "@libsql/client";
import * as cookie from "cookie";

export const prerender = false;

export const turso = createClient({
  url: import.meta.env.DB_URL,
  authToken: import.meta.env.DB_TOKEN,
});


export const POST: APIRoute = async ({request}) =>{
  const data = await request.json();
  const username = data.username;


  if(!username){
    return new Response(
      JSON.stringify({success : false , message : "username required " }),
      {status : 400}
    );
  }


  const {rows} = await turso.execute(
    "SELECT * FROM User WHERE username =?",
    [username]
  );

 

  if(rows.length === 0){
    return new Response(
      JSON.stringify({success : false , message : "User not found"}),
      {status : 400} 
    );
  }

const headers = new Headers();
  headers.append(
    "Set-Cookie",
    cookie.serialize("session_username" , username , {
      httpOnly : true,
      path : "/",
      maxAge : 60 * 60 * 24,
      sameSite : "lax",
      secure: import.meta.env.PROD,
    })
  );

  return new Response(
    JSON.stringify({success : true , user : rows[0]}),
    {status : 200 ,
      headers,
    }
    );
  
};