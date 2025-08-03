"use client";

import React from "react";

export default function BubblesBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Bubble 1 - Floating up and right */}
      <div className="absolute top-20 left-10 w-16 h-16 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full animate-pulse animate-float-1"></div>

      {/* Bubble 2 - Floating down and left */}
      <div
        className="absolute top-40 right-20 w-12 h-12 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full animate-pulse animate-float-2"
        style={{ animationDelay: "1s" }}
      ></div>

      {/* Bubble 3 - Floating in circles */}
      <div
        className="absolute top-80 left-1/4 w-20 h-20 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-full animate-pulse animate-float-3"
        style={{ animationDelay: "2s" }}
      ></div>

      {/* Bubble 4 - Floating up and down */}
      <div
        className="absolute top-96 right-1/3 w-14 h-14 bg-gradient-to-br from-pink-400/20 to-orange-400/20 rounded-full animate-pulse animate-float-4"
        style={{ animationDelay: "0.5s" }}
      ></div>

      {/* Bubble 5 - Floating diagonally */}
      <div
        className="absolute top-1/2 left-1/2 w-18 h-18 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full animate-pulse animate-float-5"
        style={{ animationDelay: "1.5s" }}
      ></div>

      {/* Bubble 6 - Floating side to side */}
      <div
        className="absolute top-2/3 left-10 w-10 h-10 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-full animate-pulse animate-float-6"
        style={{ animationDelay: "2.5s" }}
      ></div>

      {/* Bubble 7 - Floating in figure 8 */}
      <div
        className="absolute top-3/4 right-10 w-16 h-16 bg-gradient-to-br from-teal-400/20 to-blue-400/20 rounded-full animate-pulse animate-float-7"
        style={{ animationDelay: "0.8s" }}
      ></div>

      {/* Bubble 8 - Floating randomly */}
      <div
        className="absolute bottom-20 left-1/3 w-12 h-12 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full animate-pulse animate-float-8"
        style={{ animationDelay: "1.2s" }}
      ></div>
    </div>
  );
}
