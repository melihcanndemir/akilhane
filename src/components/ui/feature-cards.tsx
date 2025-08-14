"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

export interface FeatureCard {
  icon: LucideIcon;
  title: string;
  description: string;
  iconBgColor: string; // CSS gradient class
}

interface FeatureCardsProps {
  title: string;
  features: FeatureCard[];
  columns?: 2 | 3 | 4; // Grid columns
  className?: string;
}

export default function FeatureCards({
  title,
  features,
  columns = 3,
  className = "",
}: FeatureCardsProps) {
  const getGridCols = () => {
    switch (columns) {
      case 2:
        return "grid-cols-1 md:grid-cols-2";
      case 3:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
      case 4:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";
      default:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
    }
  };

  return (
    <div className={`mt-12 mb-8 px-4 sm:px-0 ${className}`}>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-4 sm:mb-6 text-center">
        {title}
      </h2>
      <div className={`grid ${getGridCols()} gap-3 sm:gap-4 lg:gap-6 max-w-5xl mx-auto`}>
        {features.map((feature, index) => (
          <Card
            key={index}
            className="border-gradient-question shadow-lg hover:shadow-xl transition-all duration-300 w-full"
          >
            <CardContent className="p-3 sm:p-4 lg:p-6 text-center">
              <div className={`p-2 ${feature.iconBgColor} rounded-lg mx-auto mb-3 sm:mb-4 w-fit`}>
                <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {feature.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
