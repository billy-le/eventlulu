import { withAuth } from "next-auth/middleware";
import { Role } from "@prisma/client";

// This is an example of how to read a JSON Web Token from an API route
export default withAuth(function middleware(req, event) {}, {
  pages: {
    signIn: "/",
  },
  callbacks: {
    authorized: async ({ req, token }) => {
      if (!token) return false;
      if (req.nextUrl.pathname.startsWith("/admin")) {
        return token.user?.roles?.includes("admin") ?? false;
      }
      return true;
    },
  },
});

export const config = { matcher: ["/admin", "/profile"] };
