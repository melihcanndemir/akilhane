"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, Brain, ArrowLeft, Shield } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ResetSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Auto redirect to login after 5 seconds
    const timer = setTimeout(() => {
      router.push("/login");
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          {/* Logo */}
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl">
              <Brain className="h-8 w-8 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            AkılHane
          </h1>

          {/* Success Icon */}
          <div className="flex items-center justify-center mb-6">
            <div className="bg-green-100 dark:bg-green-900 p-4 rounded-full">
              <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
          </div>

          <Card className="shadow-xl border-0 glass-card">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-green-600 dark:text-green-400 flex items-center justify-center gap-2">
                <Shield className="h-6 w-6" />
                Şifre Başarıyla Güncellendi!
              </CardTitle>
              <CardDescription className="text-base">
                Şifreniz güvenli bir şekilde güncellendi. Artık yeni şifrenizle
                giriş yapabilirsiniz.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Güvenlik Notu:</strong> Hesabınızın güvenliği için
                  şifrenizi kimseyle paylaşmayın.
                </p>
              </div>

              <Button
                onClick={() => router.push("/login")}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Giriş Yap
              </Button>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                5 saniye sonra otomatik olarak giriş sayfasına
                yönlendirileceksiniz.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
