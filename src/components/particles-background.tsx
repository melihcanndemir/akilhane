"use client";

import React from "react";

export default function ParticlesBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Small Particles - Fast Movement */}
      <div className="absolute top-10 left-5 w-1 h-1 bg-blue-400/30 rounded-full animate-particle-1"></div>
      <div
        className="absolute top-20 right-10 w-1 h-1 bg-purple-400/30 rounded-full animate-particle-2"
        style={{ animationDelay: "0.5s" }}
      ></div>
      <div
        className="absolute top-40 left-1/4 w-1 h-1 bg-green-400/30 rounded-full animate-particle-3"
        style={{ animationDelay: "1s" }}
      ></div>
      <div
        className="absolute top-60 right-1/3 w-1 h-1 bg-pink-400/30 rounded-full animate-particle-4"
        style={{ animationDelay: "1.5s" }}
      ></div>

      {/* Medium Particles - Medium Movement */}
      <div
        className="absolute top-80 left-10 w-2 h-2 bg-indigo-400/40 rounded-full animate-particle-5"
        style={{ animationDelay: "0.3s" }}
      ></div>
      <div
        className="absolute top-96 right-20 w-2 h-2 bg-teal-400/40 rounded-full animate-particle-6"
        style={{ animationDelay: "0.8s" }}
      ></div>
      <div
        className="absolute top-1/2 left-1/2 w-2 h-2 bg-yellow-400/40 rounded-full animate-particle-7"
        style={{ animationDelay: "1.2s" }}
      ></div>
      <div
        className="absolute top-2/3 left-1/3 w-2 h-2 bg-orange-400/40 rounded-full animate-particle-8"
        style={{ animationDelay: "0.6s" }}
      ></div>

      {/* Large Particles - Slow Movement */}
      <div
        className="absolute top-1/4 right-1/4 w-3 h-3 bg-blue-500/50 rounded-full animate-particle-9"
        style={{ animationDelay: "0.2s" }}
      ></div>
      <div
        className="absolute top-3/4 left-1/5 w-3 h-3 bg-purple-500/50 rounded-full animate-particle-10"
        style={{ animationDelay: "0.9s" }}
      ></div>
      <div
        className="absolute top-1/3 right-1/5 w-3 h-3 bg-green-500/50 rounded-full animate-particle-11"
        style={{ animationDelay: "1.4s" }}
      ></div>
      <div
        className="absolute top-2/3 right-1/3 w-3 h-3 bg-pink-500/50 rounded-full animate-particle-12"
        style={{ animationDelay: "0.7s" }}
      ></div>

      {/* Diamond Particles - Rotating */}
      <div className="absolute top-1/6 left-1/6 w-4 h-4 bg-gradient-to-br from-blue-400/60 to-purple-400/60 transform rotate-45 animate-particle-diamond-1"></div>
      <div
        className="absolute top-5/6 right-1/6 w-4 h-4 bg-gradient-to-br from-green-400/60 to-teal-400/60 transform rotate-45 animate-particle-diamond-2"
        style={{ animationDelay: "0.5s" }}
      ></div>
      <div
        className="absolute top-1/2 left-1/6 w-4 h-4 bg-gradient-to-br from-pink-400/60 to-orange-400/60 transform rotate-45 animate-particle-diamond-3"
        style={{ animationDelay: "1s" }}
      ></div>

      {/* Star Particles - Twinkling */}
      <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-yellow-400/70 transform rotate-45 animate-particle-star-1"></div>
      <div
        className="absolute top-3/4 right-1/4 w-2 h-2 bg-yellow-300/70 transform rotate-45 animate-particle-star-2"
        style={{ animationDelay: "0.8s" }}
      ></div>
      <div
        className="absolute top-1/2 right-1/2 w-2 h-2 bg-yellow-500/70 transform rotate-45 animate-particle-star-3"
        style={{ animationDelay: "1.3s" }}
      ></div>

      {/* Glowing Particles - Pulse Effect */}
      <div className="absolute top-1/5 left-1/5 w-1 h-1 bg-cyan-400/80 rounded-full animate-particle-glow-1"></div>
      <div
        className="absolute top-4/5 right-1/5 w-1 h-1 bg-magenta-400/80 rounded-full animate-particle-glow-2"
        style={{ animationDelay: "0.6s" }}
      ></div>
      <div
        className="absolute top-1/2 left-4/5 w-1 h-1 bg-lime-400/80 rounded-full animate-particle-glow-3"
        style={{ animationDelay: "1.1s" }}
      ></div>
    </div>
  );
}
