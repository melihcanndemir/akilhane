"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, RotateCcw } from "lucide-react";

interface FormActionsProps {
  onSubmit: () => Promise<void>;
  onReset: () => void;
  isCreating: boolean;
}

export default function FormActions({
  onSubmit,
  onReset,
  isCreating,
}: FormActionsProps) {
  // Wrapper function to handle async submit
  const handleSubmitClick = () => {
    onSubmit().catch(() => {
      // Silent fail for better UX
    });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
      <Button
        onClick={handleSubmitClick}
        disabled={isCreating}
        className="flex-1 h-11 sm:h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
      >
        {isCreating ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Oluşturuluyor...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Soru Oluştur
          </div>
        )}
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={onReset}
        disabled={isCreating}
        className="h-11 sm:h-12 px-6 border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
      >
        <RotateCcw className="w-4 h-4 mr-2" />
        Sıfırla
      </Button>
    </div>
  );
}
