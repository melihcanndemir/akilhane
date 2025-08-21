"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Smartphone,
  Tablet,
  Monitor,
  MousePointer,
  WifiOff,
  Wifi,
  Download,
  Zap,
  CheckCircle,
  ArrowRight,
  Maximize2,
  Fingerprint,
  Battery,
  Signal,
  Globe,
  Shield,
  Activity,
  Eye,
  Hand,
  SmartphoneIcon,
  Zap as Plug,
} from "lucide-react";

export default function MobileDemo() {
  const [selectedDevice, setSelectedDevice] = useState<
    "desktop" | "tablet" | "mobile"
  >("mobile");

  const devices = [
    { id: "desktop", name: "Desktop", icon: Monitor, width: "w-full" },
    { id: "tablet", name: "Tablet", icon: Tablet, width: "w-3/4" },
    { id: "mobile", name: "Mobile", icon: Smartphone, width: "w-80" },
  ];

  const pwaFeatures = [
    {
      name: "Offline Support",
      status: "Active",
      icon: WifiOff,
      color: "green",
    },
    { name: "Installable", status: "Available", icon: Download, color: "blue" },
    {
      name: "App-like Experience",
      status: "Enabled",
      icon: Smartphone,
      color: "purple",
    },
    { name: "Fast Loading", status: "Optimized", icon: Zap, color: "orange" },
  ];

  const touchGestures = [
    {
      name: "Swipe Navigation",
      description: "Flashcard swipe gestures",
      icon: ArrowRight,
    },
    {
      name: "Tap Interactions",
      description: "Touch-friendly buttons",
      icon: Fingerprint,
    },
    {
      name: "Pinch to Zoom",
      description: "Image zoom support",
      icon: Maximize2,
    },
    { name: "Touch Feedback", description: "Haptic feedback", icon: Hand },
  ];

  const mobileOptimizations = [
    {
      metric: "Touch Target Size",
      value: "44px+",
      status: "Optimal",
      color: "green",
    },
    { metric: "Loading Speed", value: "0.8s", status: "Fast", color: "blue" },
    {
      metric: "Battery Usage",
      value: "Optimized",
      status: "Efficient",
      color: "purple",
    },
    {
      metric: "Data Usage",
      value: "Minimal",
      status: "Compressed",
      color: "orange",
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-gray-900/50 dark:to-gray-800/50">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Mobile Responsiveness Demo
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Progressive Web App özellikleri, responsive tasarım ve touch
              gesture desteği ile mobil-öncelikli deneyim
            </p>
          </div>

          {/* Device Switcher */}
          <div className="flex justify-center mb-8">
            <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
              {devices.map((device) => (
                <Button
                  key={device.id}
                  variant={selectedDevice === device.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedDevice(device.id as "desktop" | "tablet" | "mobile")}
                  className="flex items-center gap-2"
                >
                  <device.icon className="h-4 w-4" />
                  {device.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Responsive Preview */}
          <div className="flex justify-center mb-12">
            <div
              className={`${devices.find((d) => d.id === selectedDevice)?.width} transition-all duration-500`}
            >
              <div className="border-gradient-purple p-[1px] transition-all duration-300 hover:shadow-2xl rounded-xl">
                <Card className="h-full w-full border-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 rounded-[11px]">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                      <SmartphoneIcon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-foreground">
                      {devices.find((d) => d.id === selectedDevice)?.name} View
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="space-y-4">
                      <div className="flex items-center justify-center gap-4">
                        <div className="flex items-center gap-2">
                          {selectedDevice === "mobile" ? (
                            <>
                              <Signal className="h-4 w-4 text-green-500" />
                              <span className="text-sm">4G</span>
                            </>
                          ) : (
                            <>
                              <Wifi className="h-4 w-4 text-blue-500" />
                              <span className="text-sm">WiFi</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {selectedDevice === "desktop" ? (
                            <>
                              <Plug className="h-4 w-4 text-green-500" />
                              <span className="text-sm">Plugged In</span>
                            </>
                          ) : selectedDevice === "tablet" ? (
                            <>
                              <Battery className="h-4 w-4 text-green-500" />
                              <span className="text-sm">100%</span>
                            </>
                          ) : (
                            <>
                              <Battery className="h-4 w-4 text-green-500" />
                              <span className="text-sm">85%</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">Online</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                            98%
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Performance
                          </div>
                        </div>
                        <div className="p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                          <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                            100%
                          </div>
                          <div className="text-xs text-muted-foreground">
                            PWA Score
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* PWA Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {pwaFeatures.map((feature) => (
              <div
                key={feature.name}
                className="border-gradient-purple p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl"
              >
                <Card className="h-full w-full border-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 rounded-[11px]">
                  <CardHeader className="text-center">
                                         <div
                       className={`w-12 h-12 ${
                         feature.color === 'green' ? 'bg-green-600' :
                         feature.color === 'blue' ? 'bg-blue-600' :
                         feature.color === 'purple' ? 'bg-purple-600' :
                         feature.color === 'orange' ? 'bg-orange-600' : 'bg-gray-600'
                       } rounded-lg flex items-center justify-center mb-4 mx-auto`}
                     >
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg font-semibold text-foreground">
                      {feature.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Badge
                      variant="secondary"
                      className={`bg-${feature.color}-100 text-${feature.color}-800 dark:bg-${feature.color}-900 dark:text-${feature.color}-200`}
                    >
                      {feature.status}
                    </Badge>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {/* Touch Gestures & Mobile Optimizations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Touch Gestures */}
            <div className="border-gradient-purple p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
              <Card className="h-full w-full border-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 rounded-[11px]">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center mb-4">
                    <MousePointer className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-foreground">
                    Touch Gestures
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {touchGestures.map((gesture) => (
                      <div
                        key={gesture.name}
                        className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <gesture.icon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          <div>
                            <div className="font-medium text-foreground">
                              {gesture.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {gesture.description}
                            </div>
                          </div>
                        </div>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Mobile Optimizations */}
            <div className="border-gradient-pink p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
              <Card className="h-full w-full border-0 bg-gradient-to-br from-pink-500/10 to-purple-500/10 dark:from-pink-500/20 dark:to-purple-500/20 rounded-[11px]">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-600 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                    <Activity className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-foreground">
                    Mobile Optimizations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mobileOptimizations.map((optimization) => (
                      <div
                        key={optimization.metric}
                        className="flex items-center justify-between p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-3 h-3 bg-${optimization.color}-500 rounded-full`}
                          ></div>
                          <span className="font-medium text-foreground">
                            {optimization.metric}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-foreground">
                            {optimization.value}
                          </div>
                          <Badge
                            variant="secondary"
                            className={`bg-${optimization.color}-100 text-${optimization.color}-800 dark:bg-${optimization.color}-900 dark:text-${optimization.color}-200`}
                          >
                            {optimization.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Responsive Design Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {/* Responsive Score */}
            <div className="border-gradient-purple p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
              <Card className="h-full w-full border-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 rounded-[11px]">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <Eye className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-foreground">
                    Responsive Score
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                    100%
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                  >
                    Perfect
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-2">
                    All breakpoints covered
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Touch Friendly */}
            <div className="border-gradient-pink p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
              <Card className="h-full w-full border-0 bg-gradient-to-br from-pink-500/10 to-purple-500/10 dark:from-pink-500/20 dark:to-purple-500/20 rounded-[11px]">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-600 to-purple-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <Hand className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-foreground">
                    Touch Friendly
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-3xl font-bold text-pink-600 dark:text-pink-400 mb-2">
                    100%
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200"
                  >
                    Optimized
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-2">
                    All touch targets ≥44px
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* PWA Compliance */}
            <div className="border-gradient-purple p-[1px] transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-xl">
              <Card className="h-full w-full border-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 rounded-[11px]">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-foreground">
                    PWA Compliance
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                    100%
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                  >
                    Compliant
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-2">
                    All PWA criteria met
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-200 dark:border-purple-800 rounded-full px-6 py-3 mb-8">
              <Smartphone className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                Mobile-First Design
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
