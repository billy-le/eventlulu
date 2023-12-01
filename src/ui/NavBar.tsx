import Link from "next/link";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { Role } from "@prisma/client";

const adminRoles = [Role.admin, Role.salesManager];

export function NavBar() {
  const { data: session } = useSession();
  return (
    <header>
      <nav className="bg-slate-900 py-3">
        <div className="container mx-auto flex h-10 flex-wrap items-center justify-between">
          <div>
            <Link
              className="bg-gradient-to-r from-purple-400 to-red-400 bg-clip-text font-bold uppercase leading-relaxed text-transparent"
              href="/"
            >
              EventLulu
            </Link>
          </div>
          <div className="flex-grow">
            <ul className="flex items-center justify-end text-xs font-bold uppercase leading-snug text-white">
              <li>
                <Link className="px-3 py-2 hover:opacity-75" href="/leads">
                  Leads
                </Link>
              </li>
              {adminRoles.includes(session?.user?.role) && (
                <li>
                  <Link className="px-3 py-2 hover:opacity-75" href="/admin">
                    Admin
                  </Link>
                </li>
              )}
              <li>
                <Link className="px-3 py-2 hover:opacity-75" href="/profile">
                  Profile
                </Link>
              </li>

              <li>
                <Button
                  className={cn(
                    "px-3 py-2 text-xs font-bold uppercase leading-snug text-white hover:opacity-75"
                  )}
                  onClick={() => signOut({ callbackUrl: "/login" })}
                >
                  Sign out
                </Button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}
