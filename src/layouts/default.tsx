"use client";

import Head from "next/head";
import React from "react";
import { NavBar } from "~/ui/NavBar";

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
      </Head>
      <main className="min-h-screen">
        <NavBar />
        <div className="container py-8">{children}</div>
      </main>
    </>
  );
}

DefaultLayout.defaultProps = {
  title: "",
  description: "",
};
