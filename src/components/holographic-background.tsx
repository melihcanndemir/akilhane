"use client";

import React from "react";

export default function HolographicBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[0]">
      {/* Holographic Core - 3D Projection */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-32 h-32 bg-gradient-to-br from-cyan-400 via-blue-400 to-purple-400 rounded-full animate-holographic-core shadow-2xl shadow-cyan-400/50 flex items-center justify-center">
          <div className="w-16 h-16 bg-white/20 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Rainbow Spectrum Rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Red Ring */}
        <div className="absolute w-40 h-40 border border-red-400/40 rounded-full animate-holographic-ring-red"></div>

        {/* Orange Ring */}
        <div
          className="absolute w-48 h-48 border border-orange-400/35 rounded-full animate-holographic-ring-orange"
          style={{ animationDelay: "0.2s" }}
        ></div>

        {/* Yellow Ring */}
        <div
          className="absolute w-56 h-56 border border-yellow-400/30 rounded-full animate-holographic-ring-yellow"
          style={{ animationDelay: "0.4s" }}
        ></div>

        {/* Green Ring */}
        <div
          className="absolute w-64 h-64 border border-green-400/25 rounded-full animate-holographic-ring-green"
          style={{ animationDelay: "0.6s" }}
        ></div>

        {/* Blue Ring */}
        <div
          className="absolute w-72 h-72 border border-blue-400/20 rounded-full animate-holographic-ring-blue"
          style={{ animationDelay: "0.8s" }}
        ></div>

        {/* Indigo Ring */}
        <div
          className="absolute w-80 h-80 border border-indigo-400/15 rounded-full animate-holographic-ring-indigo"
          style={{ animationDelay: "1s" }}
        ></div>

        {/* Violet Ring */}
        <div
          className="absolute w-88 h-88 border border-violet-400/10 rounded-full animate-holographic-ring-violet"
          style={{ animationDelay: "1.2s" }}
        ></div>
      </div>

      {/* Prismatic Light Refraction */}
      <div className="absolute inset-0">
        {/* Prism 1 */}
        <div className="absolute top-1/4 left-1/4 w-8 h-8 bg-gradient-to-br from-red-400 via-yellow-400 to-blue-400 transform rotate-45 animate-holographic-prism-1"></div>

        {/* Prism 2 */}
        <div
          className="absolute top-1/3 right-1/3 w-6 h-6 bg-gradient-to-br from-green-400 via-cyan-400 to-purple-400 transform -rotate-45 animate-holographic-prism-2"
          style={{ animationDelay: "0.3s" }}
        ></div>

        {/* Prism 3 */}
        <div
          className="absolute bottom-1/3 left-1/3 w-10 h-10 bg-gradient-to-br from-orange-400 via-pink-400 to-indigo-400 transform rotate-90 animate-holographic-prism-3"
          style={{ animationDelay: "0.6s" }}
        ></div>

        {/* Prism 4 */}
        <div
          className="absolute bottom-1/4 right-1/4 w-7 h-7 bg-gradient-to-br from-teal-400 via-emerald-400 to-violet-400 transform -rotate-90 animate-holographic-prism-4"
          style={{ animationDelay: "0.9s" }}
        ></div>
      </div>

      {/* Glitch Effect Lines */}
      <div className="absolute inset-0">
        {/* Glitch Line 1 */}
        <div className="absolute top-1/6 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-400/30 to-transparent animate-holographic-glitch-1"></div>

        {/* Glitch Line 2 */}
        <div
          className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-400/25 to-transparent animate-holographic-glitch-2"
          style={{ animationDelay: "0.4s" }}
        ></div>

        {/* Glitch Line 3 */}
        <div
          className="absolute bottom-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400/20 to-transparent animate-holographic-glitch-3"
          style={{ animationDelay: "0.8s" }}
        ></div>

        {/* Glitch Line 4 */}
        <div
          className="absolute bottom-1/6 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-400/15 to-transparent animate-holographic-glitch-4"
          style={{ animationDelay: "1.2s" }}
        ></div>
      </div>

      {/* Holographic Data Streams */}
      <div className="absolute inset-0">
        {/* Data Stream 1 */}
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-cyan-400/30 to-transparent animate-holographic-stream-1"></div>

        {/* Data Stream 2 */}
        <div
          className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-magenta-400/25 to-transparent animate-holographic-stream-2"
          style={{ animationDelay: "0.5s" }}
        ></div>

        {/* Data Stream 3 */}
        <div
          className="absolute top-0 left-2/3 w-px h-full bg-gradient-to-b from-transparent via-yellow-400/20 to-transparent animate-holographic-stream-3"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      {/* Spectrum Particles */}
      <div className="absolute inset-0">
        {/* Red Particle */}
        <div className="absolute top-1/5 left-1/5 w-2 h-2 bg-red-400 rounded-full animate-holographic-particle-red"></div>

        {/* Orange Particle */}
        <div
          className="absolute top-1/4 right-1/4 w-1.5 h-1.5 bg-orange-400 rounded-full animate-holographic-particle-orange"
          style={{ animationDelay: "0.2s" }}
        ></div>

        {/* Yellow Particle */}
        <div
          className="absolute bottom-1/4 left-1/4 w-2.5 h-2.5 bg-yellow-400 rounded-full animate-holographic-particle-yellow"
          style={{ animationDelay: "0.4s" }}
        ></div>

        {/* Green Particle */}
        <div
          className="absolute bottom-1/5 right-1/5 w-1 h-1 bg-green-400 rounded-full animate-holographic-particle-green"
          style={{ animationDelay: "0.6s" }}
        ></div>

        {/* Blue Particle */}
        <div
          className="absolute top-1/2 left-1/6 w-2 h-2 bg-blue-400 rounded-full animate-holographic-particle-blue"
          style={{ animationDelay: "0.8s" }}
        ></div>

        {/* Indigo Particle */}
        <div
          className="absolute top-1/2 right-1/6 w-1.5 h-1.5 bg-indigo-400 rounded-full animate-holographic-particle-indigo"
          style={{ animationDelay: "1s" }}
        ></div>

        {/* Violet Particle */}
        <div
          className="absolute bottom-1/2 left-1/2 w-2 h-2 bg-violet-400 rounded-full animate-holographic-particle-violet"
          style={{ animationDelay: "1.2s" }}
        ></div>
      </div>

      {/* Holographic Grid */}
      <svg className="absolute inset-0 w-full h-full" style={{ zIndex: -1 }}>
        {/* Grid Lines */}
        <defs>
          <pattern
            id="holographicGrid"
            x="0"
            y="0"
            width="50"
            height="50"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 50 0 L 0 0 0 50"
              fill="none"
              stroke="url(#holographicGradient)"
              strokeWidth="0.5"
              opacity="0.3"
            />
          </pattern>
          <linearGradient
            id="holographicGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
            <stop offset="25%" stopColor="#8b5cf6" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#ec4899" stopOpacity="0.6" />
            <stop offset="75%" stopColor="#f97316" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.6" />
          </linearGradient>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="url(#holographicGrid)"
          className="animate-holographic-grid"
        />
      </svg>

      {/* Holographic Waves */}
      <div className="absolute inset-0">
        {/* Wave 1 */}
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent animate-holographic-wave-1"></div>

        {/* Wave 2 */}
        <div
          className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-magenta-400/25 to-transparent animate-holographic-wave-2"
          style={{ animationDelay: "0.6s" }}
        ></div>

        {/* Wave 3 */}
        <div
          className="absolute bottom-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent animate-holographic-wave-3"
          style={{ animationDelay: "1.2s" }}
        ></div>
      </div>

      {/* Holographic Anomalies */}
      <div className="absolute inset-0">
        {/* Anomaly 1 - Data Corruption */}
        <div className="absolute top-1/3 left-1/3 w-12 h-12 border border-red-400/30 rounded-full animate-holographic-anomaly-1"></div>

        {/* Anomaly 2 - Signal Interference */}
        <div
          className="absolute top-2/3 right-1/3 w-8 h-8 border border-yellow-400/25 rounded-full animate-holographic-anomaly-2"
          style={{ animationDelay: "0.7s" }}
        ></div>

        {/* Anomaly 3 - Frequency Shift */}
        <div
          className="absolute bottom-1/3 left-2/3 w-16 h-16 border border-blue-400/20 rounded-full animate-holographic-anomaly-3"
          style={{ animationDelay: "1.4s" }}
        ></div>
      </div>

      {/* Holographic Energy Field */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-20 h-20 border border-cyan-400/20 rounded-full animate-holographic-field"></div>
      </div>
    </div>
  );
}
