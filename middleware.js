// import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// const isPublicRoute = createRouteMatcher(['/sign-in(.*)','/sign-up(.*)','/forgot-password(.*)','/reset-password(.*)','/magic-link-sign-in(.*)','/magic-link-sign-in-verify(.*)','/magic-link-sign-in-send(.*)','/magic-link-sign-in-sent(.*)','/api/create'])

// export default clerkMiddleware(async (auth, request) => {
//   if (!isPublicRoute(request)) {
//     await auth.protect()
//   }
// })

// export const config = {
//   matcher: [
//     // Skip Next.js internals and all static files, unless found in search params
//     '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
//     // Always run for API routes
//     '/(api|trpc)(.*)',
//   ],
// };



import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/forgot-password(.*)",
  "/reset-password(.*)",
  "/magic-link-sign-in(.*)",
  "/magic-link-sign-in-verify(.*)",
  "/magic-link-sign-in-send(.*)",
  "/magic-link-sign-in-sent(.*)",
  "/api/create",
]);

export default clerkMiddleware((auth, request) => {
  if (!isPublicRoute(request)) {
    return auth().protect();
  }
});

// **Force middleware to run as a Node.js Serverless Function**
export const config = {
  runtime: "nodejs18.x", // Force it to use Node.js instead of Edge
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
