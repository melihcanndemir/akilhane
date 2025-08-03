"use client";

import React from "react";

export default function TimeWarpBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Time Warp Core - Black Hole Effect */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-24 h-24 bg-black rounded-full animate-time-warp-core shadow-2xl shadow-black/80 flex items-center justify-center">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Gravitational Lensing Rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Ring 1 - Closest to Event Horizon */}
        <div className="absolute w-32 h-32 border border-blue-400/40 rounded-full animate-time-warp-ring-1"></div>

        {/* Ring 2 */}
        <div
          className="absolute w-40 h-40 border border-purple-400/30 rounded-full animate-time-warp-ring-2"
          style={{ animationDelay: "0.3s" }}
        ></div>

        {/* Ring 3 */}
        <div
          className="absolute w-48 h-48 border border-pink-400/25 rounded-full animate-time-warp-ring-3"
          style={{ animationDelay: "0.6s" }}
        ></div>

        {/* Ring 4 */}
        <div
          className="absolute w-56 h-56 border border-cyan-400/20 rounded-full animate-time-warp-ring-4"
          style={{ animationDelay: "0.9s" }}
        ></div>

        {/* Ring 5 - Farthest */}
        <div
          className="absolute w-64 h-64 border border-green-400/15 rounded-full animate-time-warp-ring-5"
          style={{ animationDelay: "1.2s" }}
        ></div>
      </div>

      {/* Temporal Distortion Waves */}
      <div className="absolute inset-0">
        {/* Wave 1 */}
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent animate-time-warp-wave-1"></div>

        {/* Wave 2 */}
        <div
          className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-400/25 to-transparent animate-time-warp-wave-2"
          style={{ animationDelay: "0.5s" }}
        ></div>

        {/* Wave 3 */}
        <div
          className="absolute bottom-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-pink-400/20 to-transparent animate-time-warp-wave-3"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      {/* Time Dilation Particles */}
      <div className="absolute inset-0">
        {/* Particle 1 - Slow Motion */}
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-blue-400 rounded-full animate-time-warp-particle-slow"></div>

        {/* Particle 2 - Fast Motion */}
        <div
          className="absolute top-1/3 right-1/3 w-1 h-1 bg-purple-400 rounded-full animate-time-warp-particle-fast"
          style={{ animationDelay: "0.3s" }}
        ></div>

        {/* Particle 3 - Relativistic */}
        <div
          className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-pink-400 rounded-full animate-time-warp-particle-relativistic"
          style={{ animationDelay: "0.6s" }}
        ></div>

        {/* Particle 4 - Time Reversal */}
        <div
          className="absolute top-1/2 right-1/4 w-1 h-1 bg-cyan-400 rounded-full animate-time-warp-particle-reverse"
          style={{ animationDelay: "0.9s" }}
        ></div>

        {/* Particle 5 - Quantum Fluctuation */}
        <div
          className="absolute bottom-1/4 right-1/2 w-1 h-1 bg-green-400 rounded-full animate-time-warp-particle-quantum"
          style={{ animationDelay: "1.2s" }}
        ></div>
      </div>

      {/* Spacetime Curvature Lines */}
      <svg className="absolute inset-0 w-full h-full" style={{ zIndex: -1 }}>
        {/* Curvature Line 1 */}
        <path
          d="M 25% 25% Q 50% 10% 75% 25% Q 90% 50% 75% 75% Q 50% 90% 25% 75% Q 10% 50% 25% 25%"
          stroke="url(#timeWarpGradient1)"
          strokeWidth="1"
          fill="none"
          className="animate-time-warp-curvature-1"
          opacity="0.4"
        />

        {/* Curvature Line 2 */}
        <path
          d="M 20% 20% Q 60% 15% 80% 30% Q 85% 60% 70% 80% Q 40% 85% 20% 70% Q 15% 40% 20% 20%"
          stroke="url(#timeWarpGradient2)"
          strokeWidth="0.5"
          fill="none"
          className="animate-time-warp-curvature-2"
          opacity="0.3"
        />

        {/* Curvature Line 3 */}
        <path
          d="M 30% 30% Q 70% 25% 85% 40% Q 80% 70% 65% 85% Q 35% 80% 30% 65% Q 25% 35% 30% 30%"
          stroke="url(#timeWarpGradient3)"
          strokeWidth="0.5"
          fill="none"
          className="animate-time-warp-curvature-3"
          opacity="0.2"
        />

        {/* Gradient Definitions */}
        <defs>
          <linearGradient
            id="timeWarpGradient1"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#a855f7" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#ec4899" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient
            id="timeWarpGradient2"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#10b981" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient
            id="timeWarpGradient3"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#14b8a6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0.4" />
          </linearGradient>
        </defs>
      </svg>

      {/* Quantum Fluctuations */}
      <div className="absolute inset-0">
        {/* Fluctuation 1 */}
        <div className="absolute top-1/6 left-1/6 w-2 h-2 bg-blue-400 rounded-full animate-time-warp-fluctuation-1"></div>

        {/* Fluctuation 2 */}
        <div
          className="absolute top-1/4 right-1/4 w-1.5 h-1.5 bg-purple-400 rounded-full animate-time-warp-fluctuation-2"
          style={{ animationDelay: "0.4s" }}
        ></div>

        {/* Fluctuation 3 */}
        <div
          className="absolute bottom-1/4 left-1/4 w-2.5 h-2.5 bg-pink-400 rounded-full animate-time-warp-fluctuation-3"
          style={{ animationDelay: "0.8s" }}
        ></div>

        {/* Fluctuation 4 */}
        <div
          className="absolute bottom-1/6 right-1/6 w-1 h-1 bg-cyan-400 rounded-full animate-time-warp-fluctuation-4"
          style={{ animationDelay: "1.2s" }}
        ></div>
      </div>

      {/* Relativistic Doppler Effect */}
      <div className="absolute inset-0">
        {/* Doppler Wave 1 */}
        <div className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-transparent via-blue-400/20 to-transparent animate-time-warp-doppler-1"></div>

        {/* Doppler Wave 2 */}
        <div
          className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-400/20 to-transparent animate-time-warp-doppler-2"
          style={{ animationDelay: "0.6s" }}
        ></div>

        {/* Doppler Wave 3 */}
        <div
          className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-pink-400/20 to-transparent animate-time-warp-doppler-3"
          style={{ animationDelay: "1.2s" }}
        ></div>
      </div>

      {/* Temporal Anomalies */}
      <div className="absolute inset-0">
        {/* Anomaly 1 - Time Loop */}
        <div className="absolute top-1/3 left-1/3 w-8 h-8 border border-orange-400/30 rounded-full animate-time-warp-anomaly-1"></div>

        {/* Anomaly 2 - Time Dilation */}
        <div
          className="absolute top-2/3 right-1/3 w-6 h-6 border border-yellow-400/25 rounded-full animate-time-warp-anomaly-2"
          style={{ animationDelay: "0.7s" }}
        ></div>

        {/* Anomaly 3 - Causality Violation */}
        <div
          className="absolute bottom-1/3 left-2/3 w-10 h-10 border border-red-400/20 rounded-full animate-time-warp-anomaly-3"
          style={{ animationDelay: "1.4s" }}
        ></div>
      </div>

      {/* Einstein-Rosen Bridge Effect */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 border border-white/10 rounded-full animate-time-warp-bridge"></div>
      </div>
    </div>
  );
}
