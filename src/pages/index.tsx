"use client";

import Image from "next/image";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { z } from "zod";
import Head from "next/head";
import {
  ArrowRight,
  LogIn,
  StickyNote,
  LineChart,
  BetweenHorizontalStart,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Link from "next/link";

import eventRoomImg from "../assets/hero_image.jpeg";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export default function HomePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status]);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  function onSubmit(values: z.infer<typeof loginSchema>) {
    signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    }).then((res) => {
      if (res?.ok) {
        router.push("/dashboard");
      } else {
        toast({
          title: "Login Failed",
          description: "Wrong email and password",
          variant: "destructive",
        });
      }
    });
  }

  return (
    <>
      <Head>
        <meta name="description" content={"Log into EventLulu"} />
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <title>Eventlulu</title>
      </Head>
      <header className="bg-white drop-shadow">
        <nav className="container mx-auto flex items-center justify-between py-5">
          <h1 className="inline-block bg-gradient-to-r from-purple-400 to-red-400 bg-clip-text text-2xl font-bold uppercase leading-relaxed text-transparent">
            EventLulu
          </h1>
          <ul className="text-medium flex gap-4 text-xl">
            <li>
              <Popover>
                <PopoverTrigger>
                  <Button className="flex gap-2 font-bold md:text-lg">
                    Login
                    <LogIn />
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <Form {...form}>
                    <form
                      className="space-y-4"
                      onSubmit={form.handleSubmit(onSubmit)}
                    >
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormItem>
                        <FormControl>
                          <Button type="submit" className="ml-auto block">
                            Sign In
                          </Button>
                        </FormControl>
                      </FormItem>
                    </form>
                  </Form>
                </PopoverContent>
              </Popover>
            </li>
          </ul>
        </nav>
      </header>
      <main className="space-y-20 py-10 xl:space-y-10">
        <section className="container mx-auto ">
          <div className="grid gap-20 md:grid-cols-5 xl:grid-cols-12">
            <div className="space-y-8 md:col-span-3 xl:col-span-8">
              <p className="text-4xl font-medium leading-relaxed xl:text-6xl xl:leading-normal">
                Accelerate your{" "}
                <span className="rounded bg-gradient-to-tr from-blue-300 to-indigo-400 px-4 text-white">
                  lead
                </span>{" "}
                generation with{" "}
                <span className="px rounded bg-gradient-to-tr from-purple-300 to-indigo-400 px-4 text-white">
                  modern
                </span>{" "}
                tools.
              </p>
              <p className="max-w-lg text-gray-500 xl:text-lg">
                Give an one-of-a-kind experience by tailoring every aspect of
                your clients' events by using a fast and modern approach to
                hotel event management.
              </p>
              <div className="flex justify-center md:justify-start">
                <Link
                  href="/dashboard"
                  className="relative inline-flex h-12 w-full overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 md:w-auto"
                >
                  <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                  <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-transparent px-8 py-1 text-xl font-medium text-white backdrop-blur-3xl">
                    Try Now
                    <ArrowRight size={28} />
                  </span>
                </Link>
              </div>
            </div>
            <div className="md:col-span-2 xl:col-span-4">
              <Image
                src={eventRoomImg}
                alt="prepared event room with tables and chairs in an elegant design"
                loading="lazy"
                className="max-w-full rounded object-cover"
              />
            </div>
          </div>
        </section>
        <section className="container mx-auto space-y-16 xl:space-y-10">
          <h2 className="text-center text-4xl font-bold text-neutral-800">
            Why use Eventlulu?
          </h2>
          <ul className="mx-auto flex max-w-lg flex-col justify-between gap-16 xl:max-w-full xl:flex-row xl:gap-10">
            <li className="w-full">
              <div className="flex gap-3">
                <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-pink-300 text-white">
                  <StickyNote />
                </div>
                <div>
                  <h3 className="mb-3 text-xl font-medium">Go Paperless</h3>
                  <p className="text-sm text-neutral-500">
                    Enter all your data digitally to reduce your paperwork and
                    easily retrieve, modify, or delete them.
                  </p>
                </div>
              </div>
            </li>
            <li className="w-full">
              <div className="flex gap-3">
                <div className="grid h-10 w-10  flex-shrink-0 place-items-center rounded-full bg-pink-300 text-white">
                  <LineChart />
                </div>
                <div>
                  <h3 className="mb-3 text-xl font-medium">
                    Trends at a Glance
                  </h3>
                  <p className="text-sm text-neutral-500">
                    Analyze your performance weekly, monthly, or annually
                    through the use of data visualization.
                  </p>
                </div>
              </div>
            </li>
            <li className="w-full">
              <div className="flex gap-3">
                <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-pink-300 text-white">
                  <BetweenHorizontalStart />
                </div>
                <div>
                  <h3 className="mb-3 text-xl font-medium">Accountability</h3>
                  <p className="text-sm text-neutral-500">
                    Quickly inventory your assets and services and make sure no
                    part of your business is missing.
                  </p>
                </div>
              </div>
            </li>
          </ul>
        </section>
      </main>
    </>
  );
}
