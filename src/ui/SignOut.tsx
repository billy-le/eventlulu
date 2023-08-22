import { useSession, signIn, signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";

export function SignOut() {
  const { data: session } = useSession();
  if (session) {
    return (
      <>
        Signed in as {session.user?.name} <br />
        <Button onClick={() => signOut({ callbackUrl: "/login" })}>
          Sign out
        </Button>
      </>
    );
  }
  return null;
}
