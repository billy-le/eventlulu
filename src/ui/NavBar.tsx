import Link from "next/link";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

export function NavBar() {
  return (
    <header>
      <nav className="bg-slate-900 py-3">
        <div className="container mx-auto flex h-10 flex-wrap items-center justify-between">
          <div className="">
            <Link
              className="font-bold uppercase leading-relaxed text-white"
              href="/"
            >
              EventLulu
            </Link>
          </div>
          <div className="flex-grow items-center lg:flex">
            <ul className="ml-auto flex list-none flex-col items-center text-xs font-bold uppercase leading-snug text-white lg:flex-row">
              <li>
                <Link className="px-3 py-2 hover:opacity-75" href="/dashboard">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link className="px-3 py-2 hover:opacity-75" href="#profile">
                  Profile
                </Link>
              </li>
              <li>
                <Link className="px-3 py-2 hover:opacity-75" href="#settings">
                  Settings
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
