'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  BookOpen, 
  Eye,
  EyeOff
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

const difficultyColors = {
  'Başlangıç': 'bg-green-100 text-green-800',
  'Orta': 'bg-yellow-100 text-yellow-800',
  'İleri': 'bg-red-100 text-red-800'
};

const categories = [
  'Matematik',
  'Ekonomi',
  'Finans',
  'Muhasebe',
  'İstatistik',
  'Yönetim',
  'Pazarlama',
  'Hukuk',
  'Bilgisayar',
  'Diğer'
];

interface SubjectManagerProps {
  onStatsUpdate?: () => void;
}

export default function SubjectManager({ onStatsUpdate }: SubjectManagerProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [newSubject, setNewSubject] = useState({
    name: '',
    description: '',
    category: 'Matematik',
    difficulty: 'Orta' as 'Başlangıç' | 'Orta' | 'İleri'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/subjects');
      
      if (!response.ok) {
        throw new Error('Failed to load subjects');
      }
      
      const data = await response.json();
      setSubjects(data);
    } catch (error) {
      console.error('Error loading subjects:', error);
      toast({
        title: "Hata",
        description: "Dersler yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSubject = async () => {
    if (!newSubject.name.trim() || !newSubject.description.trim()) {
      toast({
        title: "Hata",
        description: "Lütfen tüm alanları doldurun.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/subjects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSubject),
      });

      if (!response.ok) {
        throw new Error('Failed to create subject');
      }

      toast({
        title: "Başarılı",
        description: "Ders başarıyla oluşturuldu.",
      });

      setNewSubject({
        name: '',
        description: '',
        category: 'Matematik',
        difficulty: 'Orta'
      });
      setIsAddDialogOpen(false);
      loadSubjects();
      onStatsUpdate?.();
    } catch (error) {
      console.error('Error creating subject:', error);
      toast({
        title: "Hata",
        description: "Ders oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const handleEditSubject = async () => {
    if (!editingSubject || !editingSubject.name.trim() || !editingSubject.description.trim()) {
      toast({
        title: "Hata",
        description: "Lütfen tüm alanları doldurun.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/subjects/${editingSubject.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingSubject),
      });

      if (!response.ok) {
        throw new Error('Failed to update subject');
      }

      toast({
        title: "Başarılı",
        description: "Ders başarıyla güncellendi.",
      });

      setEditingSubject(null);
      setIsEditDialogOpen(false);
      loadSubjects();
      onStatsUpdate?.();
    } catch (error) {
      console.error('Error updating subject:', error);
      toast({
        title: "Hata",
        description: "Ders güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSubject = async (subjectId: string) => {
    if (!confirm('Bu dersi silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/subjects/${subjectId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error?.includes('existing questions')) {
          toast({
            title: "Hata",
            description: "Bu dersin soruları olduğu için silinemez.",
            variant: "destructive",
          });
          return;
        }
        throw new Error('Failed to delete subject');
      }

      toast({
        title: "Başarılı",
        description: "Ders başarıyla silindi.",
      });

      loadSubjects();
      onStatsUpdate?.();
    } catch (error) {
      console.error('Error deleting subject:', error);
      toast({
        title: "Hata",
        description: "Ders silinirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (subjectId: string) => {
    try {
      const response = await fetch(`/api/subjects/${subjectId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'toggle-active' }),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle subject status');
      }

      toast({
        title: "Başarılı",
        description: "Ders durumu güncellendi.",
      });

      loadSubjects();
      onStatsUpdate?.();
    } catch (error) {
      console.error('Error toggling subject status:', error);
      toast({
        title: "Hata",
        description: "Ders durumu güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (subject: Subject) => {
    setEditingSubject({ ...subject });
    setIsEditDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch = subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subject.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || subject.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || subject.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="container mx-auto">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-muted-foreground">Dersler yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Ders Yöneticisi</h1>
          <p className="text-muted-foreground">Dersleri yönetin ve organize edin</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Yeni Ders Ekle
        </Button>
      </div>

      {/* Filters */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtreler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Arama</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Ders ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="category">Kategori</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Tüm kategoriler" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm kategoriler</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="difficulty">Zorluk</Label>
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger>
                  <SelectValue placeholder="Tüm zorluklar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm zorluklar</SelectItem>
                  <SelectItem value="Başlangıç">Başlangıç</SelectItem>
                  <SelectItem value="Orta">Orta</SelectItem>
                  <SelectItem value="İleri">İleri</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedDifficulty('all');
                }}
                className="w-full"
              >
                Filtreleri Temizle
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subjects List */}
      <div className="grid gap-6">
        {filteredSubjects.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="text-center py-8">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Henüz ders bulunmuyor</h3>
              <p className="text-muted-foreground mb-4">
                İlk dersinizi ekleyerek başlayın
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                İlk Dersi Ekle
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredSubjects.map((subject) => (
            <Card key={subject.id} className="glass-card transition-shadow">
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <CardTitle className="text-xl">{subject.name}</CardTitle>
                      <Badge className={difficultyColors[subject.difficulty]}>
                        {subject.difficulty}
                      </Badge>
                      <Badge variant={subject.isActive ? "default" : "secondary"}>
                        {subject.isActive ? "Aktif" : "Pasif"}
                      </Badge>
                    </div>
                    <CardDescription className="text-base">
                      {subject.description}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(subject.id)}
                    >
                      {subject.isActive ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(subject)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSubject(subject.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Kategori:</span>
                    <p className="text-muted-foreground">{subject.category}</p>
                  </div>
                  <div>
                    <span className="font-medium">Soru Sayısı:</span>
                    <p className="text-muted-foreground">{subject.questionCount}</p>
                  </div>
                  <div>
                    <span className="font-medium">Oluşturulma:</span>
                    <p className="text-muted-foreground">{formatDate(subject.createdAt)}</p>
                  </div>
                  <div>
                    <span className="font-medium">Güncelleme:</span>
                    <p className="text-muted-foreground">{formatDate(subject.updatedAt)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add Subject Dialog */}
      {isAddDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md glass-card">
            <CardHeader>
              <CardTitle>Yeni Ders Ekle</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Ders Adı</Label>
                <Input
                  id="name"
                  value={newSubject.name}
                  onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                  placeholder="Ders adını girin"
                />
              </div>
              <div>
                <Label htmlFor="description">Açıklama</Label>
                <Textarea
                  id="description"
                  value={newSubject.description}
                  onChange={(e) => setNewSubject({ ...newSubject, description: e.target.value })}
                  placeholder="Ders açıklamasını girin"
                />
              </div>
              <div>
                <Label htmlFor="category">Kategori</Label>
                <Select value={newSubject.category} onValueChange={(value) => setNewSubject({ ...newSubject, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="difficulty">Zorluk</Label>
                <Select value={newSubject.difficulty} onValueChange={(value: 'Başlangıç' | 'Orta' | 'İleri') => setNewSubject({ ...newSubject, difficulty: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Başlangıç">Başlangıç</SelectItem>
                    <SelectItem value="Orta">Orta</SelectItem>
                    <SelectItem value="İleri">İleri</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleAddSubject} className="flex-1">
                  Ekle
                </Button>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1">
                  İptal
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Subject Dialog */}
      {isEditDialogOpen && editingSubject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md glass-card">
            <CardHeader>
              <CardTitle>Ders Düzenle</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Ders Adı</Label>
                <Input
                  id="edit-name"
                  value={editingSubject.name}
                  onChange={(e) => setEditingSubject({ ...editingSubject, name: e.target.value })}
                  placeholder="Ders adını girin"
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Açıklama</Label>
                <Textarea
                  id="edit-description"
                  value={editingSubject.description}
                  onChange={(e) => setEditingSubject({ ...editingSubject, description: e.target.value })}
                  placeholder="Ders açıklamasını girin"
                />
              </div>
              <div>
                <Label htmlFor="edit-category">Kategori</Label>
                <Select value={editingSubject.category} onValueChange={(value) => setEditingSubject({ ...editingSubject, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-difficulty">Zorluk</Label>
                <Select value={editingSubject.difficulty} onValueChange={(value: 'Başlangıç' | 'Orta' | 'İleri') => setEditingSubject({ ...editingSubject, difficulty: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Başlangıç">Başlangıç</SelectItem>
                    <SelectItem value="Orta">Orta</SelectItem>
                    <SelectItem value="İleri">İleri</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-active"
                  checked={editingSubject.isActive}
                  onCheckedChange={(checked) => setEditingSubject({ ...editingSubject, isActive: checked })}
                />
                <Label htmlFor="edit-active">Aktif</Label>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleEditSubject} className="flex-1">
                  Güncelle
                </Button>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1">
                  İptal
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 