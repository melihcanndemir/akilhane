'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Play,
  GraduationCap,
  Brain,
  Users,
  Target
} from 'lucide-react';
import Link from 'next/link';
import { signInWithEmail, signInWithGoogle, signUpWithEmail } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await signInWithEmail(email, password);
        if (error) throw error;
        toast({
          title: "Giriş başarılı!",
          description: "AkılHane'ye hoş geldiniz!",
        });
        router.push('/');
      } else {
        const { error } = await signUpWithEmail(email, password);
        if (error) throw error;
        toast({
          title: "Kayıt başarılı!",
          description: "E-posta adresinizi doğrulayın ve giriş yapın.",
        });
        setIsLogin(true);
      }
    } catch (error: any) {
      toast({
        title: "Hata!",
        description: error.message || "Bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Google girişi başarısız!",
        description: error.message || "Google ile giriş yapılamadı.",
        variant: "destructive",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGuestMode = () => {
    toast({
      title: "Misafir modu",
      description: "Giriş yapmadan AkılHane'yi keşfedin!",
    });
    router.push('/');
  };

  const handleLiveDemo = () => {
    toast({
      title: "Canlı Demo",
      description: "AkılHane'nin tüm özelliklerini keşfedin!",
    });
    router.push('/demo');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo ve Başlık */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl">
              <Brain className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            AkılHane
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            AI Destekli Eğitim Platformu
          </p>
        </motion.div>

        {/* Ana Kart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">
                {isLogin ? 'Hoş Geldiniz' : 'Hesap Oluşturun'}
              </CardTitle>
              <CardDescription>
                {isLogin 
                  ? 'Hesabınıza giriş yapın ve öğrenmeye devam edin'
                  : 'Ücretsiz hesap oluşturun ve AI destekli eğitime başlayın'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-posta</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="ornek@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Şifre</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>{isLogin ? 'Giriş yapılıyor...' : 'Kayıt olunuyor...'}</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>{isLogin ? 'Giriş Yap' : 'Kayıt Ol'}</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  )}
                </Button>
              </form>

              {/* Şifremi Unuttum */}
              {isLogin && (
                <div className="text-center">
                  <Link
                    href="/forgot-password"
                    className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Şifremi unuttum
                  </Link>
                </div>
              )}

              <Separator />

              {/* Google ile Giriş */}
              <Button
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
              >
                {isGoogleLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                    <span>Google ile giriş yapılıyor...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 48 48"
                      className="h-4 w-4"
                    >
                      <path
                        fill="#FFC107"
                        d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                      />
                      <path
                        fill="#FF3D00"
                        d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                      />
                      <path
                        fill="#4CAF50"
                        d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                      />
                      <path
                        fill="#1976D2"
                        d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.022,35.28,44,30.038,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                      />
                    </svg>
                    <span>Google ile {isLogin ? 'Giriş Yap' : 'Kayıt Ol'}</span>
                  </div>
                )}
              </Button>

              <Separator />

              {/* Misafir Modu ve Demo */}
              <div className="space-y-3">
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={handleGuestMode}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Giriş yapmadan devam et
                </Button>

                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={handleLiveDemo}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Canlı Demo
                </Button>
              </div>

              {/* Toggle Login/Register */}
              <div className="text-center text-sm">
                {isLogin ? (
                  <p>
                    Hesabınız yok mu?{' '}
                    <button
                      onClick={() => setIsLogin(false)}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                    >
                      Kayıt olun
                    </button>
                  </p>
                ) : (
                  <p>
                    Zaten hesabınız var mı?{' '}
                    <button
                      onClick={() => setIsLogin(true)}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                    >
                      Giriş yapın
                    </button>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Özellikler */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 grid grid-cols-2 gap-4"
        >
          <div className="text-center p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg backdrop-blur-sm">
            <GraduationCap className="h-6 w-6 mx-auto mb-2 text-blue-600" />
            <p className="text-sm font-medium">AI Destekli Öğrenme</p>
          </div>
          <div className="text-center p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg backdrop-blur-sm">
            <Target className="h-6 w-6 mx-auto mb-2 text-indigo-600" />
            <p className="text-sm font-medium">Kişiselleştirilmiş</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 