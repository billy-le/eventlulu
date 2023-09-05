import Head from "next/head";
import React from "react";
import { NavBar } from "~/ui/NavBar";
import { Toaster } from "@/components/ui/toaster";

export function DefaultLayout({
  title,
  description,
  children,
}: React.PropsWithChildren<{
  title?: string;
  description?: string;
}>) {
  return (
    <>
      <Head>
        <title>Eventlulu{title ? ` | ${title}` : ""}</title>
        <meta name="description" content={description} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-h-screen">
        <NavBar />
        <div className="container py-8">{children}</div>
      </main>
      <Toaster />
    </>
  );
}

DefaultLayout.defaultProps = {
  title: "",
  description: "",
};
