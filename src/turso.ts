import { createClient } from "@libsql/client/web";

export const turso = createClient({url : import.meta.env.DB_URL , authToken : import.meta.env.DB_TOKEN,});


