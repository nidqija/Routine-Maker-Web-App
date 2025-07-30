import { type APIRoute } from "astro";
import * as cookie from "cookie";
import { createClient, type Row } from "@libsql/client";

export const prerender = false;

const turso = createClient({
  url: import.meta.env.DB_URL,
  authToken: import.meta.env.DB_TOKEN,
});



export const GET: APIRoute = async ({ request }) => {
  const cookies = cookie.parse(request.headers.get("cookie") || "");
  const username = cookies.session_username;


  try{
    
   type StudyRow = {
    study_date : string;
};
   
    if(!username){
      return new Response(JSON.stringify({ success: false, error: "username missing" }), { status: 400 });
    }

    const userResult = await turso.execute(
        "SELECT * FROM User where username = ?",
        [username]
    );

    if(!userResult.rows.length){
       return new Response(JSON.stringify({success : false , error: 'user not found' }) ,{status : 404 });
    }

    const userID = userResult.rows[0].user_id; 

    const fetchStudyDate = await turso.execute("SELECT DISTINCT study_date from Study_Plan WHERE user_id =? " ,
        [userID]
    )

    if(!fetchStudyDate){
        return new Response(JSON.stringify({success : false , error : 'could not fetch study date'}) , {status : 404});
    }

    const studyDates:StudyRow[] = fetchStudyDate.rows.map((row)=>({
      study_date : row.study_date as string,
    }))


    return new Response(JSON.stringify({success : true , data : studyDates }) , {
        status : 200,
        headers : {
            "Content-Type" : "application/json",
        },
    })

} catch(err){
    console.error("Error fetching study notes" , err);
    return new Response(JSON.stringify({success : false , error : "Internal server error"}) ,{
        status : 500,
    });
}


};


