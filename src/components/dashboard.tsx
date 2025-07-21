'use client';
import type { ChangeEvent } from 'react';
import React, from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  BookOpen,
  BrainCircuit,
  HeartHandshake,
  LineChart,
  BarChart,
  Clock,
  Target,
  Loader2,
  Cpu,
} from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  personalizeQuestionDifficulty,
  type PersonalizeQuestionDifficultyOutput,
} from '@/ai/flows/personalize-question-difficulty';

const subjects = [
  {
    name: 'Financial Statement Analysis',
    icon: <BookOpen className="w-8 h-8 text-primary" />,
    href: '/quiz?subject=Financial Statement Analysis',
  },
  {
    name: 'Decision Support Systems',
    icon: <BrainCircuit className="w-8 h-8 text-primary" />,
    href: '/quiz?subject=Decision Support Systems',
  },
  {
    name: 'Customer Relationship Management',
    icon: <HeartHandshake className="w-8 h-8 text-primary" />,
    href: '/quiz?subject=Customer Relationship Management',
  },
];

const performanceData = [
  { subject: 'Finance', score: 85, color: 'hsl(var(--chart-1))' },
  { subject: 'Decision Sys.', score: 72, color: 'hsl(var(--chart-2))' },
  { subject: 'CRM', score: 91, color: 'hsl(var(--chart-3))' },
];

const timeData = [
  { subject: 'Finance', time: 35, color: 'hsl(var(--chart-1))' },
  { subject: 'Decision Sys.', time: 45, color: 'hsl(var(--chart-2))' },
  { subject: 'CRM', time: 28, color: 'hsl(var(--chart-3))' },
];

const weakAreasData = [
    { name: 'Liquidity Ratios', value: 40, fill: 'hsl(var(--chart-5))' },
    { name: 'Profitability', value: 30, fill: 'hsl(var(--chart-4))' },
    { name: 'Debt Ratios', value: 30, fill: 'hsl(var(--chart-3))' },
];

export function Dashboard() {
  const [selectedSubject, setSelectedSubject] = React.useState<string>(
    subjects[0].name
  );
  const [
    difficultyResult,
    setDifficultyResult,
  ] = React.useState<PersonalizeQuestionDifficultyOutput | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handlePersonalizeClick = async () => {
    setIsLoading(true);
    setDifficultyResult(null);
    const result = await personalizeQuestionDifficulty({
      userId: 'user-123', // Mock user ID
      subject: selectedSubject,
    });
    setDifficultyResult(result);
    setIsLoading(false);
  };

  return (
    <div className="bg-background">
      <header className="bg-card border-b p-4 shadow-sm">
        <div className="container mx-auto">
          <h1 className="text-3xl font-headline font-bold text-primary">AÖF Exam Prep</h1>
          <p className="text-muted-foreground">Welcome back! Let's get you ready for your exams.</p>
        </div>
      </header>

      <div className="container mx-auto p-4 md:p-8 space-y-8">
        <section>
          <h2 className="text-2xl font-headline font-semibold mb-4">Choose a Subject to Practice</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {subjects.map((subject) => (
              <Link href={subject.href} key={subject.name} legacyBehavior>
                <a className="block">
                  <Card className="hover:shadow-lg hover:border-primary transition-all duration-300 h-full">
                    <CardHeader className="flex flex-row items-center gap-4">
                      {subject.icon}
                      <CardTitle className="font-headline text-xl">{subject.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>Start a new quiz session and test your knowledge.</CardDescription>
                    </CardContent>
                  </Card>
                </a>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl flex items-center gap-2">
                <Cpu className="w-6 h-6" /> AI-Powered Personalization
              </CardTitle>
              <CardDescription>Let our AI determine the best difficulty for your next quiz based on your performance.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row items-center gap-4">
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger className="w-full sm:w-[300px]">
                        <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                        {subjects.map(subject => (
                            <SelectItem key={subject.name} value={subject.name}>{subject.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
              <Button onClick={handlePersonalizeClick} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Personalize Difficulty
              </Button>
              {difficultyResult && (
                <p className="text-lg font-semibold">
                  Recommended Difficulty: <span className="text-primary">{difficultyResult.difficulty}</span>
                </p>
              )}
            </CardContent>
          </Card>
        </section>


        <section>
          <h2 className="text-2xl font-headline font-semibold mb-4">Your Performance Analytics</h2>
          <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><LineChart className="w-5 h-5" />Performance by Subject</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <RechartsBarChart data={performanceData} layout="vertical" margin={{ left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" domain={[0, 100]} />
                            <YAxis dataKey="subject" type="category" width={80} />
                            <ChartTooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent />} />
                            <Bar dataKey="score" layout="vertical" radius={4}>
                                {performanceData.map((entry) => (
                                    <Cell key={`cell-${entry.subject}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </RechartsBarChart>
                    </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

             <Card>
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><Target className="w-5 h-5" />Weakest Areas</CardTitle>
                 <CardDescription>Based on Financial Statement Analysis quizzes.</CardDescription>
              </CardHeader>
              <CardContent>
                 <ChartContainer config={{}} className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                            <Pie data={weakAreasData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={5}>
                                {weakAreasData.map((entry) => (
                                    <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                                ))}
                            </Pie>
                             <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><Clock className="w-5 h-5" />Time Spent per Subject (minutes)</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="h-64">
                     <ResponsiveContainer width="100%" height="100%">
                        <RechartsBarChart data={timeData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="subject" />
                            <YAxis />
                            <ChartTooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent />} />
                            <Bar dataKey="time" radius={4}>
                                {timeData.map((entry) => (
                                    <Cell key={`cell-${entry.subject}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </RechartsBarChart>
                    </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
