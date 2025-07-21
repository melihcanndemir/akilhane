'use client';
import type { ChangeEvent } from 'react';
import React from 'react';
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
import type { PerformanceData, Subject } from '@/lib/types';

const subjects = [
  {
    name: 'Finansal Tablo Analizi',
    icon: <BookOpen className="w-8 h-8 text-primary" />,
    href: '/quiz?subject=Finansal Tablo Analizi',
  },
  {
    name: 'Karar Destek Sistemleri',
    icon: <BrainCircuit className="w-8 h-8 text-primary" />,
    href: '/quiz?subject=Karar Destek Sistemleri',
  },
  {
    name: 'Müşteri İlişkileri Yönetimi',
    icon: <HeartHandshake className="w-8 h-8 text-primary" />,
    href: '/quiz?subject=Müşteri İlişkileri Yönetimi',
  },
];

const initialPerformanceData = [
  { subject: 'Finansal Tablo Analizi', score: 0, color: 'hsl(var(--chart-1))' },
  { subject: 'Karar Destek Sistemleri', score: 0, color: 'hsl(var(--chart-2))' },
  { subject: 'Müşteri İlişkileri Yönetimi', score: 0, color: 'hsl(var(--chart-3))' },
];

const initialTimeData = [
  { subject: 'Finansal Tablo Analizi', time: 0, color: 'hsl(var(--chart-1))' },
  { subject: 'Karar Destek Sistemleri', time: 0, color: 'hsl(var(--chart-2))' },
  { subject: 'Müşteri İlişkileri Yönetimi', time: 0, color: 'hsl(var(--chart-3))' },
];

const initialWeakAreasData = [
    { name: 'Konu A', value: 1, fill: 'hsl(var(--chart-5))' },
    { name: 'Konu B', value: 1, fill: 'hsl(var(--chart-4))' },
    { name: 'Konu C', value: 1, fill: 'hsl(var(--chart-3))' },
];

export function Dashboard() {
  const [selectedSubject, setSelectedSubject] = React.useState<string>(
    subjects[0].name
  );
  const [difficultyResult, setDifficultyResult] = React.useState<PersonalizeQuestionDifficultyOutput | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  
  const [performanceData, setPerformanceData] = React.useState(initialPerformanceData);
  const [timeData, setTimeData] = React.useState(initialTimeData);
  const [weakAreasData, setWeakAreasData] = React.useState(initialWeakAreasData);
  const [hasData, setHasData] = React.useState(false);

  React.useEffect(() => {
      try {
        const storedDataString = localStorage.getItem('performanceData');
        if (storedDataString) {
            const storedData: PerformanceData = JSON.parse(storedDataString);
            if (Object.keys(storedData).length > 0) {
              setHasData(true);
            } else {
              setHasData(false);
              return;
            }

            // Update Performance Chart Data
            const newPerformanceData = subjects.map((subject, index) => {
                const results = storedData[subject.name as Subject];
                const avgScore = results && results.length > 0
                    ? results.reduce((acc, r) => acc + (r.score / r.totalQuestions) * 100, 0) / results.length
                    : 0;
                return { subject: subject.name, score: Math.round(avgScore), color: `hsl(var(--chart-${index + 1}))` };
            });
            setPerformanceData(newPerformanceData);

            // Update Time Chart Data
            const newTimeData = subjects.map((subject, index) => {
                const results = storedData[subject.name as Subject];
                const avgTime = results && results.length > 0
                    ? (results.reduce((acc, r) => acc + r.timeSpent, 0) / results.length) / 60 // average time in minutes
                    : 0;
                return { subject: subject.name, time: Math.round(avgTime), color: `hsl(var(--chart-${index + 1}))` };
            });
            setTimeData(newTimeData);
            
            // Update Weak Areas Chart Data for ALL subjects
            const allWeakTopics: Record<string, number> = {};
            Object.values(storedData).forEach(subjectResults => {
                if (subjectResults) {
                  subjectResults.forEach(result => {
                      Object.entries(result.weakTopics).forEach(([topic, count]) => {
                          allWeakTopics[topic] = (allWeakTopics[topic] || 0) + count;
                      });
                  });
                }
            });

            const sortedWeakTopics = Object.entries(allWeakTopics)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5); // Get top 5 weak topics

            if (sortedWeakTopics.length > 0) {
                 const newWeakAreasData = sortedWeakTopics.map(([name, value], index) => ({
                    name,
                    value,
                    fill: `hsl(var(--chart-${(index % 5) + 1}))`,
                }));
                setWeakAreasData(newWeakAreasData);
            } else {
                setWeakAreasData([{ name: 'Zayıf konu bulunamadı', value: 1, fill: 'hsl(var(--muted))' }]);
            }
        } else {
            setHasData(false);
        }
      } catch (error) {
          console.error("Could not load performance data from localStorage", error);
          setHasData(false);
      }
  }, []); // Run only once on component mount


  const handlePersonalizeClick = async () => {
    setIsLoading(true);
    setDifficultyResult(null);

    // Pass the localStorage data to the flow
    const performanceData = localStorage.getItem('performanceData') || '{}';

    const result = await personalizeQuestionDifficulty({
      userId: 'user-123', // Mock user ID
      subject: selectedSubject,
      performanceData: performanceData,
    });
    setDifficultyResult(result);
    setIsLoading(false);
  };

  return (
    <div className="bg-background">
      <header className="bg-card border-b p-4 shadow-sm">
        <div className="container mx-auto">
          <h1 className="text-3xl font-headline font-bold text-primary">AÖF Sınav Hazırlık</h1>
          <p className="text-muted-foreground">Tekrar hoş geldin! Seni sınavlara hazırlayalım.</p>
        </div>
      </header>

      <div className="container mx-auto p-4 md:p-8 space-y-8">
        <section>
          <h2 className="text-2xl font-headline font-semibold mb-4">Pratik Yapmak İçin Bir Ders Seç</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {subjects.map((subject) => (
              <Link
                href={subject.href}
                key={subject.name}
                className="block"
              >
                <Card className="hover:shadow-lg hover:border-primary transition-all duration-300 h-full">
                  <CardHeader className="flex flex-row items-center gap-4">
                    {subject.icon}
                    <CardTitle className="font-headline text-xl">
                      {subject.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      Yeni bir test oturumu başlat ve bilgini sına.
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl flex items-center gap-2">
                <Cpu className="w-6 h-6" /> Yapay Zeka Destekli Kişiselleştirme
              </CardTitle>
              <CardDescription>Performansına göre bir sonraki testin için en uygun zorluğu yapay zekamızın belirlemesine izin ver.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row items-center gap-4">
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger className="w-full sm:w-[300px]">
                        <SelectValue placeholder="Bir ders seçin" />
                    </SelectTrigger>
                    <SelectContent>
                        {subjects.map(subject => (
                            <SelectItem key={subject.name} value={subject.name}>{subject.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
              <Button onClick={handlePersonalizeClick} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Zorluğu Kişiselleştir
              </Button>
              {difficultyResult && (
                <p className="text-lg font-semibold">
                  Önerilen Zorluk: <span className="text-primary">{difficultyResult.difficulty}</span>
                </p>
              )}
            </CardContent>
          </Card>
        </section>


        <section>
          <h2 className="text-2xl font-headline font-semibold mb-4">Performans Analizlerin</h2>
          {!hasData && (
             <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground">Henüz hiç test çözmedin. İlk testini çözdükten sonra analizlerin burada görünecek.</p>
                </CardContent>
              </Card>
          )}
          <div className={`grid md:grid-cols-1 lg:grid-cols-3 gap-6 ${!hasData ? 'hidden' : ''}`}>
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><LineChart className="w-5 h-5" />Derse Göre Ortalama Başarı (%)</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <RechartsBarChart data={performanceData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="subject" tick={{fontSize: 12}} />
                            <YAxis domain={[0, 100]} unit="%" />
                            <ChartTooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent />} />
                            <Bar dataKey="score" radius={4}>
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
                <CardTitle className="font-headline flex items-center gap-2"><Target className="w-5 h-5" />Zayıf Alanlar</CardTitle>
                 <CardDescription>Tüm derslerdeki yanlış cevaplarına göre.</CardDescription>
              </Header>
              <CardContent>
                 <ChartContainer config={{}} className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                            <Pie data={weakAreasData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={5} labelLine={false}>
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
                <CardTitle className="font-headline flex items-center gap-2"><Clock className="w-5 h-5" />Derse Göre Ortalama Süre (dakika)</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="h-64">
                     <ResponsiveContainer width="100%" height="100%">
                        <RechartsBarChart data={timeData} layout="vertical" margin={{ right: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" unit="dk" />
                            <YAxis dataKey="subject" type="category" width={140} tick={{fontSize: 12}}/>
                            <ChartTooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent />} />
                            <Bar dataKey="time" layout="vertical" radius={4}>
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
