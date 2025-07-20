import { defineMiddleware } from "astro:middleware";
export const prerender = false;

export const onRequest = defineMiddleware((context, next) => {
  const username = context.cookies.get("session_username")?.value;

  if (!username && context.url.pathname.startsWith("/protected")) {
    return context.redirect("/login");
  }

  return next();
});
