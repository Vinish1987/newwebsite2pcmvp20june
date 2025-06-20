import React from "react";
import Head from "next/head";
import Navigation from "@/components/Navigation";
import LoginForm from "@/components/LoginForm";

export default function Login() {
  return (
    <>
      <Head>
        <title>Login - 2PC</title>
        <meta name="description" content="Login to your 2PC account to access your dashboard" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="min-h-screen bg-slate-900">
        <Navigation />
        <div className="pt-16 flex items-center justify-center min-h-screen px-4">
          <LoginForm />
        </div>
      </div>
    </>
  );
}
