import { getServerSession } from "next-auth";
import { withAuth } from "next-auth/middleware";
import { Role } from "@prisma/client";

// This is an example of how to read a JSON Web Token from an API route
export default withAuth(function middleware(req, event) {}, {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized: async ({ req, token }) => {
      if (!token) return false;
      if (req.nextUrl.pathname.startsWith("/admin")) {
        return (
          token.user?.role === Role.admin ||
          token.user?.role === Role.salesManager
        );
      }
      return true;
    },
  },
});
