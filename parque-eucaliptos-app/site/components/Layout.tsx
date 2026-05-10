"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";

export default function Layout({ children }: { children: ReactNode }) {
  const router = useRouter();

  function handleLogout() {
    localStorage.removeItem("auth");
    router.replace("/");
  }

  return (
    <div className="min-h-screen bg-[#e8f0dc] text-gray-800">

      {/* Navbar */}
      <header className="flex items-center justify-between px-8 py-4">
        <h1 className="text-xl font-bold">
          Parque dos Eucaliptos
        </h1>

        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-full text-sm"
        >
          Sair
        </button>
      </header>

      {/* Conteúdo da página */}
      <main className="px-8 py-6">
        {children}
      </main>
    </div>
  );
}