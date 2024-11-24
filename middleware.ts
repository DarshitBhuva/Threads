import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)']);


export default clerkMiddleware((auth, request) => {

  PublicRoutes: ['/','/api/webhook/clerk']
  ignoredRoutes: ['/api/webhook/clerk']
  
//   if(!isPublicRoute(request)) {
//     auth().protect();
//   }
}, { debug: false });

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};