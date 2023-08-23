"use client";

import layeredWaves from "public/layered-waves-haikei.svg";
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
import * as z from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export default function Login() {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
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
        router.push("/");
      }
    });
  }
  return (
    <section className="flex min-h-screen items-center justify-center">
      <Image
        fill
        src={layeredWaves}
        alt=""
        className="-z-10 object-cover"
        role="presentation"
      />
      <div className="w-full max-w-lg rounded-lg bg-slate-800 px-8 py-12">
        <h1 className="mb-10 text-center text-2xl text-slate-100">EventLulu</h1>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-100">Email</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                  <FormLabel className="text-slate-100">Password</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormItem className="pt-8">
              <FormControl>
                <Button type="submit" className="ml-auto block">
                  Sign In
                </Button>
              </FormControl>
            </FormItem>
          </form>
        </Form>
      </div>
    </section>
  );
}
