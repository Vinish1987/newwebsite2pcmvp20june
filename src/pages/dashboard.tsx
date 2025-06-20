import React from "react";
import Head from "next/head";
import dynamic from "next/dynamic";

// Dynamically import Dashboard component with no SSR
const Dashboard = dynamic(() => import("@/components/Dashboard"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-emerald-900/20 flex items-center justify-center">
      <div className="text-white text-xl">Loading...</div>
    </div>
  )
});

export default function DashboardPage() {
  return (
    <>
      <Head>
        <title>Dashboard - 2PC</title>
        <meta name="description" content="Your 2PC savings dashboard - track your growth and manage your investments" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="min-h-screen bg-slate-900">
        <Dashboard />
      </div>
    </>
  );
}
