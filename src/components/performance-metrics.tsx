"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Zap,
  Gauge,
  TrendingUp,
  Shield,
  Eye,
  Smartphone,
  Globe,
  CheckCircle,
  Clock,
  Activity,
  BarChart3,
  Target,
} from "lucide-react";

export default function PerformanceMetrics() {
  return (
    <section className="py-16 bg-gradient-to-br from-green-50/50 to-blue-50/50 dark:from-gray-900/50 dark:to-gray-800/50">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Performance Metrics
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Enterprise-level performance, Lighthouse scores ve Core Web Vitals
              ile optimize edilmiş eğitim platformu
            </p>
          </div>

          {/* Lighthouse Scores Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Performance Score */}
            <div className="border-gradient-green p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
              <Card className="h-full w-full border-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 dark:from-green-500/20 dark:to-emerald-500/20 rounded-[11px]">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <Gauge className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                    98
                  </div>
                  <CardTitle className="text-lg font-semibold text-foreground">
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 relative">
                    <svg
                      className="w-24 h-24 transform -rotate-90"
                      viewBox="0 0 100 100"
                    >
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-gray-200 dark:text-gray-700"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray="251.2"
                        strokeDashoffset="5.024"
                        className="text-green-600 dark:text-green-400"
                        style={{ strokeDashoffset: 251.2 - (251.2 * 98) / 100 }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                        98%
                      </span>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  >
                    Excellent
                  </Badge>
                </CardContent>
              </Card>
            </div>

            {/* Accessibility Score */}
            <div className="border-gradient-blue p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
              <Card className="h-full w-full border-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 rounded-[11px]">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <Eye className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    90
                  </div>
                  <CardTitle className="text-lg font-semibold text-foreground">
                    Accessibility
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 relative">
                    <svg
                      className="w-24 h-24 transform -rotate-90"
                      viewBox="0 0 100 100"
                    >
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-gray-200 dark:text-gray-700"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray="251.2"
                        strokeDashoffset="25.12"
                        className="text-blue-600 dark:text-blue-400"
                        style={{ strokeDashoffset: 251.2 - (251.2 * 90) / 100 }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        90%
                      </span>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  >
                    Good
                  </Badge>
                </CardContent>
              </Card>
            </div>

            {/* Best Practices Score */}
            <div className="border-gradient-purple p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
              <Card className="h-full w-full border-0 bg-gradient-to-br from-purple-500/10 to-violet-500/10 dark:from-purple-500/20 dark:to-violet-500/20 rounded-[11px]">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-violet-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                    100
                  </div>
                  <CardTitle className="text-lg font-semibold text-foreground">
                    Best Practices
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 relative">
                    <svg
                      className="w-24 h-24 transform -rotate-90"
                      viewBox="0 0 100 100"
                    >
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-gray-200 dark:text-gray-700"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray="251.2"
                        strokeDashoffset="0"
                        className="text-purple-600 dark:text-purple-400"
                        style={{
                          strokeDashoffset: 251.2 - (251.2 * 100) / 100,
                        }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        100%
                      </span>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                  >
                    Perfect
                  </Badge>
                </CardContent>
              </Card>
            </div>

            {/* SEO Score */}
            <div className="border-gradient-orange p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
              <Card className="h-full w-full border-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 dark:from-orange-500/20 dark:to-red-500/20 rounded-[11px]">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-red-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <Target className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                    100
                  </div>
                  <CardTitle className="text-lg font-semibold text-foreground">
                    SEO
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 relative">
                    <svg
                      className="w-24 h-24 transform -rotate-90"
                      viewBox="0 0 100 100"
                    >
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-gray-200 dark:text-gray-700"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray="251.2"
                        strokeDashoffset="0"
                        className="text-orange-600 dark:text-orange-400"
                        style={{
                          strokeDashoffset: 251.2 - (251.2 * 100) / 100,
                        }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        100%
                      </span>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                  >
                    Perfect
                  </Badge>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Core Web Vitals & Bundle Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Core Web Vitals */}
            <div className="border-gradient-green p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
              <Card className="h-full w-full border-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 dark:from-green-500/20 dark:to-emerald-500/20 rounded-[11px]">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center mb-4">
                    <Activity className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-foreground">
                    Core Web Vitals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="font-medium">
                          LCP (Largest Contentful Paint)
                        </span>
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      >
                        1.2s
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="font-medium">
                          FID (First Input Delay)
                        </span>
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      >
                        45ms
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="font-medium">
                          CLS (Cumulative Layout Shift)
                        </span>
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      >
                        0.02
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                      <CheckCircle className="h-4 w-4" />
                      <span>
                        All Core Web Vitals are in the &quot;Good&quot; range
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bundle Analysis */}
            <div className="border-gradient-blue p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
              <Card className="h-full w-full border-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 rounded-[11px]">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mb-4">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-foreground">
                    Bundle Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="font-medium">Total Bundle Size</span>
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      >
                        2.1MB
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="font-medium">JavaScript</span>
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      >
                        1.4MB
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="font-medium">CSS</span>
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      >
                        0.7MB
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="font-medium">Images</span>
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      >
                        0.2MB
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                      <TrendingUp className="h-4 w-4" />
                      <span>
                        Optimized with code splitting and lazy loading
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {/* PWA Score */}
            <div className="border-gradient-purple p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
              <Card className="h-full w-full border-0 bg-gradient-to-br from-purple-500/10 to-violet-500/10 dark:from-purple-500/20 dark:to-violet-500/20 rounded-[11px]">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-violet-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <Smartphone className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-foreground">
                    PWA Score
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                    100
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                  >
                    Perfect
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-2">
                    Offline support, installable, responsive
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Load Time */}
            <div className="border-gradient-orange p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
              <Card className="h-full w-full border-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 dark:from-orange-500/20 dark:to-red-500/20 rounded-[11px]">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-red-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-foreground">
                    Load Time
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                    0.8s
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                  >
                    Fast
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-2">
                    First contentful paint
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Global Rank */}
            <div className="border-gradient-green p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
              <Card className="h-full w-full border-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 dark:from-green-500/20 dark:to-emerald-500/20 rounded-[11px]">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-foreground">
                    Performance Rank
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                    Top 1%
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  >
                    Elite
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-2">
                    Among all websites
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-200 dark:border-green-800 rounded-full px-6 py-3 mb-8">
              <Zap className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                Enterprise-Level Performance
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
