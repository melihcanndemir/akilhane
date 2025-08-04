"use client";

import React from "react";
import BreakoutLoadingGame from "@/components/breakout-loading-game";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function BreakoutGamePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/topic-explainer">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-0 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Geri Dön
            </Button>
          </Link>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🎮 Atari Breakout Oyunu
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Loading sırasında eğlenceli bir oyun oynayın!
          </p>
        </div>

        {/* Game Component */}
        <BreakoutLoadingGame
          isLoading={false}
          loadingText="Oyun Zamanı!"
          onGameComplete={() => {
            //do nothing
          }}
        />
      </div>
    </div>
  );
}
