"use client";

import React from "react";

export default function QuantumTunnelBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Quantum Tunnel Rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Ring 1 - Closest */}
        <div className="absolute w-96 h-96 border-2 border-blue-400/30 rounded-full animate-quantum-tunnel-1"></div>

        {/* Ring 2 */}
        <div
          className="absolute w-80 h-80 border-2 border-purple-400/30 rounded-full animate-quantum-tunnel-2"
          style={{ animationDelay: "0.5s" }}
        ></div>

        {/* Ring 3 */}
        <div
          className="absolute w-64 h-64 border-2 border-pink-400/30 rounded-full animate-quantum-tunnel-3"
          style={{ animationDelay: "1s" }}
        ></div>

        {/* Ring 4 */}
        <div
          className="absolute w-48 h-48 border-2 border-cyan-400/30 rounded-full animate-quantum-tunnel-4"
          style={{ animationDelay: "1.5s" }}
        ></div>

        {/* Ring 5 - Farthest */}
        <div
          className="absolute w-32 h-32 border-2 border-green-400/30 rounded-full animate-quantum-tunnel-5"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Quantum Particles */}
      <div className="absolute inset-0">
        {/* Particle 1 */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-quantum-particle-1"></div>

        {/* Particle 2 */}
        <div
          className="absolute top-1/3 right-1/3 w-1 h-1 bg-purple-400 rounded-full animate-quantum-particle-2"
          style={{ animationDelay: "0.3s" }}
        ></div>

        {/* Particle 3 */}
        <div
          className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-pink-400 rounded-full animate-quantum-particle-3"
          style={{ animationDelay: "0.6s" }}
        ></div>

        {/* Particle 4 */}
        <div
          className="absolute top-1/2 right-1/4 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-quantum-particle-4"
          style={{ animationDelay: "0.9s" }}
        ></div>

        {/* Particle 5 */}
        <div
          className="absolute bottom-1/4 right-1/2 w-2.5 h-2.5 bg-green-400 rounded-full animate-quantum-particle-5"
          style={{ animationDelay: "1.2s" }}
        ></div>
      </div>

      {/* Energy Waves */}
      <div className="absolute inset-0">
        {/* Wave 1 */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent animate-quantum-wave-1"></div>

        {/* Wave 2 */}
        <div
          className="absolute top-1/3 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-400/20 to-transparent animate-quantum-wave-2"
          style={{ animationDelay: "0.5s" }}
        ></div>

        {/* Wave 3 */}
        <div
          className="absolute bottom-1/3 left-0 w-full h-1 bg-gradient-to-r from-transparent via-pink-400/20 to-transparent animate-quantum-wave-3"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      {/* Quantum Field Lines */}
      <div className="absolute inset-0">
        {/* Vertical Line 1 */}
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-blue-400/30 to-transparent animate-quantum-field-1"></div>

        {/* Vertical Line 2 */}
        <div
          className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-purple-400/30 to-transparent animate-quantum-field-2"
          style={{ animationDelay: "0.7s" }}
        ></div>

        {/* Horizontal Line 1 */}
        <div
          className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-pink-400/30 to-transparent animate-quantum-field-3"
          style={{ animationDelay: "1.4s" }}
        ></div>

        {/* Horizontal Line 2 */}
        <div
          className="absolute bottom-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent animate-quantum-field-4"
          style={{ animationDelay: "2.1s" }}
        ></div>
      </div>

      {/* Quantum Core */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 rounded-full animate-quantum-core shadow-lg shadow-blue-400/50"></div>
      </div>
    </div>
  );
}
