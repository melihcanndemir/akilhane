'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Edit, Trash2, Search, Filter, BookOpen, Brain, Users, Home, Database, GraduationCap } from 'lucide-react';
import type { Question } from '@/lib/types';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';

interface Subject {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'Başlangıç' | 'Orta' | 'İleri';
  questionCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const questionTypes = [
  'Çoktan Seçmeli',
  'Doğru/Yanlış',
  'Hesaplama',
  'Vaka Çalışması',
];

const difficulties = ['Kolay', 'Orta', 'Zor'];

export default function QuestionManager() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');

  // Form state
  const [formData, setFormData] = useState({
    subject: '',
    topic: '',
    type: 'Çoktan Seçmeli',
    difficulty: 'Orta',
    text: '',
    options: [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
    ],
    explanation: '',
    formula: '',
  });

  // Load subjects and questions
  useEffect(() => {
    loadSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      loadQuestions();
    }
  }, [selectedSubject]);

  const loadSubjects = async () => {
    try {
      setIsLoadingSubjects(true);
      console.log('Loading subjects...');
      const response = await fetch('/api/subjects');
      if (response.ok) {
        const data = await response.json();
        console.log('Subjects loaded:', data);
        setSubjects(data);
        if (data.length > 0) {
          setSelectedSubject(data[0].name);
          setFormData(prev => ({ ...prev, subject: data[0].name }));
        }
      } else {
        console.error('Failed to load subjects:', response.status);
      }
    } catch (error) {
      console.error('Error loading subjects:', error);
    } finally {
      setIsLoadingSubjects(false);
    }
  };

  const loadQuestions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/questions?subject=${encodeURIComponent(selectedSubject)}`);
      if (response.ok) {
        const data = await response.json();
        setQuestions(data);
      }
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateQuestion = async () => {
    try {
      setIsCreating(true);

      // Validate form
      if (!formData.text || !formData.topic || !formData.explanation) {
        alert('Lütfen tüm zorunlu alanları doldurun');
        return;
      }

      // Validate options for multiple choice questions
      if (formData.type === 'Çoktan Seçmeli') {
        const validOptions = formData.options.filter(opt => opt.text.trim() !== '');
        if (validOptions.length < 2) {
          alert('En az 2 seçenek gerekli');
          return;
        }

        const correctOptions = validOptions.filter(opt => opt.isCorrect);
        if (correctOptions.length !== 1) {
          alert('Tam olarak 1 doğru cevap seçmelisiniz');
          return;
        }
      }

      const validOptions = formData.options.filter(opt => opt.text.trim() !== '');
      const correctOptions = validOptions.filter(opt => opt.isCorrect);
      const correctAnswer = formData.type === 'Çoktan Seçmeli' ? correctOptions[0].text : '';

      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          options: validOptions,
          correctAnswer,
        }),
      });

      if (response.ok) {
        alert('Soru başarıyla oluşturuldu!');
        resetForm();
        loadQuestions();
      } else {
        const error = await response.json();
        alert(`Hata: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating question:', error);
      alert('Soru oluşturulurken hata oluştu');
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setFormData({
      subject: selectedSubject,
      topic: '',
      type: 'Çoktan Seçmeli',
      difficulty: 'Orta',
      text: '',
      options: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ],
      explanation: '',
      formula: '',
    });
  };

  const handleOptionChange = (index: number, field: 'text' | 'isCorrect', value: string | boolean) => {
    const newOptions = [...formData.options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setFormData({ ...formData, options: newOptions });
  };

  const addOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, { text: '', isCorrect: false }],
    });
  };

  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData({ ...formData, options: newOptions });
    }
  };

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.topic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = filterDifficulty === 'all' || question.difficulty === filterDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Home className="w-6 h-6 text-primary" />
              <span className="font-headline font-bold text-xl text-primary">AkılHane</span>
            </div>
            
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <Home className="w-4 h-4 mr-2" />
                  Ana Sayfa
                </Button>
              </Link>
              <Link href="/question-manager">
                <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Database className="w-4 h-4 mr-2" />
                  Soru Yöneticisi
                </Button>
              </Link>
              <Link href="/subject-manager">
                <Button variant="ghost" size="sm">
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Ders Yöneticisi
                </Button>
              </Link>
              <Link href="/quiz">
                <Button variant="ghost" size="sm">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Test Çöz
                </Button>
              </Link>
              <Link href="/flashcard">
                <Button variant="ghost" size="sm">
                  <Brain className="w-4 h-4 mr-2" />
                  Flashcard
                </Button>
              </Link>
              <Link href="/ai-chat">
                <Button variant="ghost" size="sm">
                  <Users className="w-4 h-4 mr-2" />
                  AI Asistan
                </Button>
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      <div className="p-4 md:p-8">
        <div className="container mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-headline font-bold text-primary">Soru Yöneticisi</h1>
              <p className="text-muted-foreground">Soru ekle, düzenle ve yönet</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Create Question Form */}
            <Card id="question-form">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Yeni Soru Ekle
                </CardTitle>
                <CardDescription>
                  Yeni bir soru oluşturmak için formu doldurun
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="subject">Ders</Label>
                    <Select value={formData.subject} onValueChange={(value) => setFormData({...formData, subject: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Ders seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
                            <GraduationCap className="w-8 h-8 text-muted-foreground/50 mb-2" />
                            <p className="text-sm font-medium text-muted-foreground mb-1">
                              Henüz ders bulunmuyor
                            </p>
                            <p className="text-xs text-muted-foreground/70 mb-3">
                              Ders yöneticisinden ders ekleyin
                            </p>
                            <Link href="/subject-manager">
                              <Button size="sm" variant="outline" className="text-xs">
                                <GraduationCap className="w-3 h-3 mr-1" />
                                Ders Ekle
                              </Button>
                            </Link>
                          </div>
                        ) : (
                          subjects.map(subject => (
                            <SelectItem key={subject.id} value={subject.name}>{subject.name}</SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="topic">Konu</Label>
                    <Input
                      id="topic"
                      value={formData.topic}
                      onChange={(e) => setFormData({...formData, topic: e.target.value})}
                      placeholder="Örn: Finansal Tablolar"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Soru Tipi</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {questionTypes.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
                            <BookOpen className="w-8 h-8 text-muted-foreground/50 mb-2" />
                            <p className="text-sm font-medium text-muted-foreground mb-1">
                              Soru tipi bulunamadı
                            </p>
                            <p className="text-xs text-muted-foreground/70">
                              Sistem yapılandırması gerekli
                            </p>
                          </div>
                        ) : (
                          questionTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="difficulty">Zorluk</Label>
                    <Select value={formData.difficulty} onValueChange={(value) => setFormData({...formData, difficulty: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {difficulties.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
                            <Filter className="w-8 h-8 text-muted-foreground/50 mb-2" />
                            <p className="text-sm font-medium text-muted-foreground mb-1">
                              Zorluk seviyesi bulunamadı
                            </p>
                            <p className="text-xs text-muted-foreground/70">
                              Sistem yapılandırması gerekli
                            </p>
                          </div>
                        ) : (
                          difficulties.map(difficulty => (
                            <SelectItem key={difficulty} value={difficulty}>{difficulty}</SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="text">Soru Metni</Label>
                  <Textarea
                    id="text"
                    value={formData.text}
                    onChange={(e) => setFormData({...formData, text: e.target.value})}
                    placeholder="Soruyu buraya yazın..."
                    rows={3}
                  />
                </div>

                {formData.type === 'Çoktan Seçmeli' && (
                  <div>
                    <Label>Seçenekler</Label>
                    <div className="space-y-2">
                      {formData.options.map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Checkbox
                            checked={option.isCorrect}
                            onCheckedChange={(checked) => 
                              handleOptionChange(index, 'isCorrect', checked as boolean)
                            }
                          />
                          <Input
                            value={option.text}
                            onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                            placeholder={`Seçenek ${index + 1}`}
                            className="flex-1"
                          />
                          {formData.options.length > 2 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeOption(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button variant="outline" size="sm" onClick={addOption}>
                        <Plus className="w-4 h-4 mr-2" />
                        Seçenek Ekle
                      </Button>
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="explanation">Açıklama</Label>
                  <Textarea
                    id="explanation"
                    value={formData.explanation}
                    onChange={(e) => setFormData({...formData, explanation: e.target.value})}
                    placeholder="Doğru cevabın açıklaması..."
                    rows={3}
                  />
                </div>

                {formData.type === 'Hesaplama' && (
                  <div>
                    <Label htmlFor="formula">Formül (Opsiyonel)</Label>
                    <Input
                      id="formula"
                      value={formData.formula}
                      onChange={(e) => setFormData({...formData, formula: e.target.value})}
                      placeholder="Hesaplama formülü..."
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <Button onClick={handleCreateQuestion} disabled={isCreating}>
                    {isCreating ? 'Oluşturuluyor...' : 'Soru Oluştur'}
                  </Button>
                  <Button variant="outline" onClick={resetForm}>
                    Sıfırla
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Questions List */}
            <Card>
              <CardHeader>
                <CardTitle>Sorular</CardTitle>
                <CardDescription>
                  {selectedSubject ? `${selectedSubject} dersindeki sorular` : 'Ders seçin'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex gap-2 mb-4">
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Ders seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
                          <GraduationCap className="w-8 h-8 text-muted-foreground/50 mb-2" />
                          <p className="text-sm font-medium text-muted-foreground mb-1">
                            Henüz ders bulunmuyor
                          </p>
                          <p className="text-xs text-muted-foreground/70 mb-3">
                            Ders yöneticisinden ders ekleyin
                          </p>
                          <Link href="/subject-manager">
                            <Button size="sm" variant="outline" className="text-xs">
                              <GraduationCap className="w-3 h-3 mr-1" />
                              Ders Ekle
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        subjects.map(subject => (
                          <SelectItem key={subject.id} value={subject.name}>{subject.name}</SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Soru ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                  <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Zorluk" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tümü</SelectItem>
                      {difficulties.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
                          <Filter className="w-8 h-8 text-muted-foreground/50 mb-2" />
                          <p className="text-sm font-medium text-muted-foreground mb-1">
                            Zorluk seviyesi bulunamadı
                          </p>
                          <p className="text-xs text-muted-foreground/70">
                            Sistem yapılandırması gerekli
                          </p>
                        </div>
                      ) : (
                        difficulties.map(difficulty => (
                          <SelectItem key={difficulty} value={difficulty}>{difficulty}</SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Questions */}
                {isLoadingSubjects ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground font-medium">Dersler yükleniyor...</p>
                  </div>
                ) : subjects.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <GraduationCap className="w-16 h-16 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Henüz ders bulunmuyor
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-sm">
                      Soru ekleyebilmek için önce ders yöneticisinden bir ders oluşturmanız gerekiyor.
                    </p>
                    <Link href="/subject-manager">
                      <Button className="gap-2">
                        <GraduationCap className="w-4 h-4" />
                        Ders Ekle
                      </Button>
                    </Link>
                  </div>
                ) : isLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground font-medium">Sorular yükleniyor...</p>
                  </div>
                ) : !selectedSubject ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Database className="w-16 h-16 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Ders Seçin
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-sm">
                      Soruları görüntülemek ve yönetmek için yukarıdan bir ders seçin.
                    </p>
                  </div>
                ) : filteredQuestions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <BookOpen className="w-16 h-16 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Bu derste henüz soru bulunmuyor
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-sm">
                      Seçili derste henüz soru eklenmemiş. Sol taraftaki formu kullanarak ilk sorunuzu oluşturabilirsiniz.
                    </p>
                    <Button 
                      variant="outline" 
                      className="gap-2"
                      onClick={() => {
                        // Scroll to form
                        document.getElementById('question-form')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      <Plus className="w-4 h-4" />
                      İlk Soruyu Ekle
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {filteredQuestions.map((question) => (
                      <div key={question.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                              {question.difficulty === 'Easy' ? 'Kolay' : question.difficulty === 'Medium' ? 'Orta' : question.difficulty === 'Hard' ? 'Zor' : question.difficulty}
                            </span>
                            <span className="bg-secondary/10 text-secondary-foreground px-2 py-1 rounded text-xs">
                              {question.topic}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm font-medium mb-2">{question.text}</p>
                        <p className="text-xs text-muted-foreground">
                          {question.options.length} seçenek • {question.type === 'multiple-choice' ? 'Çoktan Seçmeli' : question.type === 'true-false' ? 'Doğru/Yanlış' : question.type === 'calculation' ? 'Hesaplama' : question.type === 'case-study' ? 'Vaka Çalışması' : question.type}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 