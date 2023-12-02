import Link from "next/link";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { Role } from "@prisma/client";
import { LogOut, User, PencilRuler } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";

const adminRoles = [Role.admin, Role.salesManager];

export function NavBar() {
  const { data: session } = useSession();
  return (
    <header>
      <nav className="bg-slate-900 py-3">
        <div className="container mx-auto flex h-10 flex-wrap items-center justify-between">
          <Link
            className="bg-gradient-to-r from-purple-400 to-red-400 bg-clip-text text-xl font-bold uppercase leading-relaxed text-transparent"
            href="/"
          >
            EventLulu
          </Link>
          <div className="flex-grow">
            <ul className="flex items-center justify-end gap-4 text-sm font-medium uppercase leading-snug text-white">
              <li>
                <Link
                  className="px-3 py-2 hover:rounded-md hover:ring-1 hover:ring-white"
                  href="/leads"
                >
                  Leads
                </Link>
              </li>
              <li>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Button className="h-10 w-10 rounded-full bg-gradient-to-tr from-purple-400 to-pink-400 p-0">
                      <User className="text-white" size="20" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-44">
                    <DropdownMenuItem>
                      <DropdownMenuLabel className="w-full p-0">
                        <Link
                          href="/profile"
                          className="flex items-center justify-between"
                        >
                          Profile
                          <User size="20" className="text-slate-400" />
                        </Link>
                      </DropdownMenuLabel>
                    </DropdownMenuItem>
                    {adminRoles.includes(session?.user?.role) && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <DropdownMenuLabel className="w-full p-0">
                            <Link
                              href="/admin"
                              className="flex items-center justify-between"
                            >
                              Admin
                              <PencilRuler
                                size="20"
                                className="text-slate-400"
                              />
                            </Link>
                          </DropdownMenuLabel>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Button
                        variant="ghost"
                        className={cn(
                          "flex h-auto w-full items-center justify-between p-0"
                        )}
                        onClick={() => signOut({ callbackUrl: "/login" })}
                      >
                        Sign out
                        <LogOut size="20" className="text-slate-400" />
                      </Button>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}
