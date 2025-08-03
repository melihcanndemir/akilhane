"use client";

import React from "react";

export default function NeuralNetworkBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Neural Network Nodes */}
      <div className="absolute inset-0">
        {/* Node 1 - Main Brain */}
        <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-blue-400 rounded-full animate-neural-node-1 shadow-lg shadow-blue-400/50"></div>

        {/* Node 2 */}
        <div
          className="absolute top-1/3 right-1/3 w-2 h-2 bg-purple-400 rounded-full animate-neural-node-2"
          style={{ animationDelay: "0.3s" }}
        ></div>

        {/* Node 3 */}
        <div
          className="absolute bottom-1/3 left-1/3 w-4 h-4 bg-pink-400 rounded-full animate-neural-node-3"
          style={{ animationDelay: "0.6s" }}
        ></div>

        {/* Node 4 */}
        <div
          className="absolute top-1/2 right-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-neural-node-4"
          style={{ animationDelay: "0.9s" }}
        ></div>

        {/* Node 5 */}
        <div
          className="absolute bottom-1/4 right-1/2 w-3 h-3 bg-green-400 rounded-full animate-neural-node-5"
          style={{ animationDelay: "1.2s" }}
        ></div>

        {/* Node 6 */}
        <div
          className="absolute top-1/6 left-1/2 w-2 h-2 bg-orange-400 rounded-full animate-neural-node-6"
          style={{ animationDelay: "1.5s" }}
        ></div>

        {/* Node 7 */}
        <div
          className="absolute bottom-1/6 right-1/6 w-2 h-2 bg-indigo-400 rounded-full animate-neural-node-7"
          style={{ animationDelay: "1.8s" }}
        ></div>

        {/* Node 8 */}
        <div
          className="absolute top-2/3 left-1/6 w-3 h-3 bg-teal-400 rounded-full animate-neural-node-8"
          style={{ animationDelay: "2.1s" }}
        ></div>

        {/* Additional Nodes for Complex Network */}
        <div
          className="absolute top-1/5 left-1/3 w-1.5 h-1.5 bg-red-400 rounded-full animate-neural-node-9"
          style={{ animationDelay: "0.4s" }}
        ></div>
        <div
          className="absolute bottom-1/5 right-1/5 w-2 h-2 bg-yellow-400 rounded-full animate-neural-node-10"
          style={{ animationDelay: "0.7s" }}
        ></div>
        <div
          className="absolute top-3/4 left-2/3 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-neural-node-11"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-2/3 right-1/5 w-2 h-2 bg-violet-400 rounded-full animate-neural-node-12"
          style={{ animationDelay: "1.3s" }}
        ></div>
      </div>

      {/* Neural Connections - Real Brain-like Synapses */}
      <svg className="absolute inset-0 w-full h-full" style={{ zIndex: -1 }}>
        {/* Connection 1: Node 1 to Node 2 */}
        <line
          x1="25%"
          y1="25%"
          x2="67%"
          y2="33%"
          stroke="url(#gradient1)"
          strokeWidth="1"
          className="animate-neural-connection-1"
          opacity="0.6"
        />

        {/* Connection 2: Node 2 to Node 3 */}
        <line
          x1="67%"
          y1="33%"
          x2="33%"
          y2="67%"
          stroke="url(#gradient2)"
          strokeWidth="1"
          className="animate-neural-connection-2"
          opacity="0.5"
        />

        {/* Connection 3: Node 3 to Node 4 */}
        <line
          x1="33%"
          y1="67%"
          x2="75%"
          y2="50%"
          stroke="url(#gradient3)"
          strokeWidth="1"
          className="animate-neural-connection-3"
          opacity="0.7"
        />

        {/* Connection 4: Node 4 to Node 5 */}
        <line
          x1="75%"
          y1="50%"
          x2="50%"
          y2="75%"
          stroke="url(#gradient4)"
          strokeWidth="1"
          className="animate-neural-connection-4"
          opacity="0.6"
        />

        {/* Connection 5: Node 5 to Node 6 */}
        <line
          x1="50%"
          y1="75%"
          x2="50%"
          y2="17%"
          stroke="url(#gradient5)"
          strokeWidth="1"
          className="animate-neural-connection-5"
          opacity="0.5"
        />

        {/* Connection 6: Node 6 to Node 7 */}
        <line
          x1="50%"
          y1="17%"
          x2="83%"
          y2="83%"
          stroke="url(#gradient6)"
          strokeWidth="1"
          className="animate-neural-connection-6"
          opacity="0.6"
        />

        {/* Connection 7: Node 7 to Node 8 */}
        <line
          x1="83%"
          y1="83%"
          x2="17%"
          y2="67%"
          stroke="url(#gradient7)"
          strokeWidth="1"
          className="animate-neural-connection-7"
          opacity="0.7"
        />

        {/* Connection 8: Node 8 to Node 1 */}
        <line
          x1="17%"
          y1="67%"
          x2="25%"
          y2="25%"
          stroke="url(#gradient8)"
          strokeWidth="1"
          className="animate-neural-connection-8"
          opacity="0.5"
        />

        {/* Additional Complex Connections */}
        <line
          x1="25%"
          y1="25%"
          x2="33%"
          y2="20%"
          stroke="url(#gradient9)"
          strokeWidth="0.5"
          className="animate-neural-connection-9"
          opacity="0.4"
        />

        <line
          x1="33%"
          y1="20%"
          x2="80%"
          y2="80%"
          stroke="url(#gradient10)"
          strokeWidth="0.5"
          className="animate-neural-connection-10"
          opacity="0.3"
        />

        <line
          x1="80%"
          y1="80%"
          x2="67%"
          y2="75%"
          stroke="url(#gradient11)"
          strokeWidth="0.5"
          className="animate-neural-connection-11"
          opacity="0.4"
        />

        <line
          x1="67%"
          y1="75%"
          x2="20%"
          y2="33%"
          stroke="url(#gradient12)"
          strokeWidth="0.5"
          className="animate-neural-connection-12"
          opacity="0.3"
        />

        {/* Cross Connections for Complex Network */}
        <line
          x1="25%"
          y1="25%"
          x2="75%"
          y2="50%"
          stroke="url(#gradient13)"
          strokeWidth="0.5"
          className="animate-neural-connection-13"
          opacity="0.2"
        />

        <line
          x1="67%"
          y1="33%"
          x2="50%"
          y2="75%"
          stroke="url(#gradient14)"
          strokeWidth="0.5"
          className="animate-neural-connection-14"
          opacity="0.3"
        />

        <line
          x1="33%"
          y1="67%"
          x2="50%"
          y2="17%"
          stroke="url(#gradient15)"
          strokeWidth="0.5"
          className="animate-neural-connection-15"
          opacity="0.2"
        />

        {/* Gradient Definitions */}
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ec4899" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ec4899" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="gradient4" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="gradient5" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="gradient6" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="gradient7" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="gradient8" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="gradient9" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="gradient10" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#eab308" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="gradient11" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#eab308" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="gradient12" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="gradient13" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="gradient14" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="gradient15" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ec4899" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0.4" />
          </linearGradient>
        </defs>
      </svg>

      {/* Data Flow Particles - Moving Along Connections */}
      <div className="absolute inset-0">
        {/* Particle 1 - Moving along connection 1 */}
        <div className="absolute w-1 h-1 bg-blue-400 rounded-full animate-neural-particle-path-1"></div>

        {/* Particle 2 - Moving along connection 2 */}
        <div
          className="absolute w-1 h-1 bg-purple-400 rounded-full animate-neural-particle-path-2"
          style={{ animationDelay: "0.4s" }}
        ></div>

        {/* Particle 3 - Moving along connection 3 */}
        <div
          className="absolute w-1 h-1 bg-pink-400 rounded-full animate-neural-particle-path-3"
          style={{ animationDelay: "0.8s" }}
        ></div>

        {/* Particle 4 - Moving along connection 4 */}
        <div
          className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-neural-particle-path-4"
          style={{ animationDelay: "1.2s" }}
        ></div>

        {/* Particle 5 - Moving along connection 5 */}
        <div
          className="absolute w-1 h-1 bg-green-400 rounded-full animate-neural-particle-path-5"
          style={{ animationDelay: "1.6s" }}
        ></div>
      </div>

      {/* Brain Waves - Horizontal Scanning */}
      <div className="absolute inset-0">
        {/* Wave 1 */}
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent animate-neural-wave-1"></div>

        {/* Wave 2 */}
        <div
          className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-400/30 to-transparent animate-neural-wave-2"
          style={{ animationDelay: "0.6s" }}
        ></div>

        {/* Wave 3 */}
        <div
          className="absolute bottom-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-pink-400/30 to-transparent animate-neural-wave-3"
          style={{ animationDelay: "1.2s" }}
        ></div>
      </div>

      {/* Neural Core - Central Processing Unit */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 rounded-full animate-neural-core shadow-lg shadow-blue-400/50 flex items-center justify-center">
          <div className="w-6 h-6 bg-white/20 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Data Streams - Vertical Processing Lines */}
      <div className="absolute inset-0">
        {/* Stream 1 */}
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-blue-400/20 to-transparent animate-neural-stream-1"></div>

        {/* Stream 2 */}
        <div
          className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-purple-400/20 to-transparent animate-neural-stream-2"
          style={{ animationDelay: "0.7s" }}
        ></div>

        {/* Stream 3 */}
        <div
          className="absolute top-0 left-2/3 w-px h-full bg-gradient-to-b from-transparent via-pink-400/20 to-transparent animate-neural-stream-3"
          style={{ animationDelay: "1.4s" }}
        ></div>
      </div>
    </div>
  );
}
