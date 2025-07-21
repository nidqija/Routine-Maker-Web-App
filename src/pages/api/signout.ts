


import { type APIRoute} from "astro";
import * as cookie from "cookie";


export const prerender = false;


export const GET : APIRoute = async ({cookies}) =>{
    cookies.delete("session_username" , {path : '/'});

    return new Response(null,{
      status : 302 , headers :{Location : "/login",},
    });
}