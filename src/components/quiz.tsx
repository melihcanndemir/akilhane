'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { questions as allQuestions } from '@/lib/questions';
import type { Question, Subject, PerformanceData, QuizResult } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, XCircle, Clock, BookOpen, BrainCircuit, HeartHandshake, Calculator, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const shuffleArray = (array: any[]) => {
    return array.sort(() => Math.random() - 0.5);
};

const QUIZ_DURATION = 50 * 60; // 50 minutes in seconds

export function Quiz() {
    const searchParams = useSearchParams();
    const subject = searchParams.get('subject') as Subject | null;

    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [timeLeft, setTimeLeft] = useState(QUIZ_DURATION);
    const [incorrectTopics, setIncorrectTopics] = useState<Record<string, number>>({});

    useEffect(() => {
        if (subject) {
            const filteredQuestions = allQuestions.filter(q => q.subject === subject);
            setQuestions(shuffleArray(filteredQuestions).slice(0, 5)); // Using 5 questions for demo
            setIsFinished(false);
            setCurrentQuestionIndex(0);
            setScore(0);
            setTimeLeft(QUIZ_DURATION);
            setIncorrectTopics({});
        }
    }, [subject]);

    useEffect(() => {
        if (timeLeft > 0 && !isFinished) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0 && !isFinished) {
            handleFinishQuiz();
        }
    }, [timeLeft, isFinished]);
    
    if (!subject) {
        return <div className="text-center p-8">Lütfen teste başlamak için bir ders seçin.</div>;
    }

    if (questions.length === 0 && !isFinished) {
        return <div className="text-center p-8">Sorular yükleniyor...</div>;
    }
    
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = currentQuestion?.options.find(opt => opt.text === selectedAnswer)?.isCorrect;

    const handleFinishQuiz = () => {
        if (!subject) return;

        const timeSpent = QUIZ_DURATION - timeLeft;
        const result: QuizResult = {
            score,
            totalQuestions: questions.length,
            timeSpent,
            date: new Date().toISOString(),
            weakTopics: incorrectTopics,
        };
        
        try {
            const existingDataString = localStorage.getItem('performanceData');
            const existingData: PerformanceData = existingDataString ? JSON.parse(existingDataString) : {};
            
            if (!existingData[subject]) {
                existingData[subject] = [];
            }
            existingData[subject]?.push(result);

            localStorage.setItem('performanceData', JSON.stringify(existingData));
        } catch (error) {
            console.error("Failed to save quiz results to localStorage", error);
        }

        setIsFinished(true);
    };

    const handleNext = () => {
        if (!selectedAnswer) return;

        if (!showFeedback) {
            setShowFeedback(true);
            if (isCorrect) {
                setScore(score + 1);
            } else {
                const topic = currentQuestion.topic || 'Genel';
                setIncorrectTopics(prev => ({
                    ...prev,
                    [topic]: (prev[topic] || 0) + 1,
                }));
            }
        } else {
            setShowFeedback(false);
            setSelectedAnswer(null);
            if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex(currentQuestionIndex + 1);
            } else {
                handleFinishQuiz();
            }
        }
    };
    
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getSubjectIcon = (subject: Subject) => {
        switch (subject) {
            case 'Finansal Tablo Analizi': return <BookOpen className="w-6 h-6" />;
            case 'Karar Destek Sistemleri': return <BrainCircuit className="w-6 h-6" />;
            case 'Müşteri İlişkileri Yönetimi': return <HeartHandshake className="w-6 h-6" />;
            default: return null;
        }
    };

    if (isFinished) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background p-4">
                <Card className="w-full max-w-2xl text-center">
                    <CardHeader>
                        <CardTitle className="text-3xl font-headline">Test Bitti!</CardTitle>
                        <CardDescription>İşte sonucun.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-5xl font-bold text-primary">{score} / {questions.length}</p>
                        <p className="text-xl text-muted-foreground">Başarı oranın %{((score / questions.length) * 100).toFixed(2)}</p>
                    </CardContent>
                    <CardFooter>
                        <Link href="/" className="w-full">
                            <Button className="w-full">Anasayfaya Dön</Button>
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        );
    }
    
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <header className="sticky top-0 bg-card/80 backdrop-blur-sm border-b p-4 z-10">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-2 text-primary font-semibold">
                        {getSubjectIcon(subject)}
                        <span className="hidden sm:inline">{subject}</span>
                    </div>
                    <div className="flex items-center gap-2 font-semibold text-lg text-primary">
                        <Clock className="w-6 h-6" />
                        <span>{formatTime(timeLeft)}</span>
                    </div>
                </div>
                <Progress value={(currentQuestionIndex + 1) / questions.length * 100} className="w-full h-2 mt-2" />
            </header>

            <main className="flex-1 flex items-center justify-center p-4">
                <Card className="w-full max-w-4xl">
                    <CardHeader>
                        <CardTitle className="text-2xl font-headline">Soru {currentQuestionIndex + 1} / {questions.length}</CardTitle>
                        <CardDescription className="text-lg pt-2">{currentQuestion.text}</CardDescription>
                        {currentQuestion.formula && (
                           <div className="mt-2 p-3 bg-muted rounded-md flex items-center gap-2">
                               <Calculator className="w-5 h-5 text-muted-foreground" />
                               <p className="font-code text-sm">{currentQuestion.formula}</p>
                           </div>
                        )}
                    </CardHeader>
                    <CardContent>
                        <RadioGroup
                            value={selectedAnswer ?? ''}
                            onValueChange={setSelectedAnswer}
                            disabled={showFeedback}
                        >
                            {currentQuestion.options.map((option, index) => {
                                const feedbackColor = showFeedback
                                    ? option.isCorrect
                                        ? 'border-green-500 bg-green-500/10'
                                        : (selectedAnswer === option.text ? 'border-red-500 bg-red-500/10' : 'border-border')
                                    : 'border-border';

                                return (
                                    <Label key={index} className={`flex items-center p-4 rounded-lg border-2 transition-all ${feedbackColor} ${!showFeedback ? 'hover:border-primary cursor-pointer' : ''}`}>
                                        <RadioGroupItem value={option.text} id={`r${index}`} className="mr-4" />
                                        <span>{option.text}</span>
                                    </Label>
                                );
                            })}
                        </RadioGroup>

                        {showFeedback && (
                            <Alert className={`mt-6 ${isCorrect ? 'border-green-500 text-green-700' : 'border-red-500 text-red-700'}`}>
                                {isCorrect ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                                <AlertTitle>{isCorrect ? 'Doğru!' : 'Yanlış'}</AlertTitle>
                                <AlertDescription>
                                    {currentQuestion.explanation}
                                </AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                    <CardFooter>
                         <Button onClick={handleNext} disabled={!selectedAnswer} className="w-full">
                            {showFeedback ? (currentQuestionIndex < questions.length - 1 ? "Sonraki Soru" : "Testi Bitir") : "Cevabı Gönder"}
                            <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    </CardFooter>
                </Card>
            </main>
        </div>
    );
}
