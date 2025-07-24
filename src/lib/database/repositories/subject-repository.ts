import { eq, and, desc, sql, like, count } from 'drizzle-orm';
import { db } from '../connection';
import { subjects, questions } from '../schema';

export interface Subject {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'Başlangıç' | 'Orta' | 'İleri';
  questionCount: number;
  isActive: boolean;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSubjectData {
  name: string;
  description: string;
  category: string;
  difficulty: 'Başlangıç' | 'Orta' | 'İleri';
  createdBy?: string;
}

export interface UpdateSubjectData {
  name?: string;
  description?: string;
  category?: string;
  difficulty?: 'Başlangıç' | 'Orta' | 'İleri';
  isActive?: boolean;
}

export class SubjectRepository {
  /**
   * Create a new subject
   */
  static async createSubject(data: CreateSubjectData): Promise<string> {
    try {
      const id = `subject_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await db.insert(subjects).values({
        id,
        name: data.name,
        description: data.description,
        category: data.category,
        difficulty: data.difficulty,
        questionCount: 0,
        isActive: true,
        createdBy: data.createdBy,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log(`✅ Subject created: ${id}`);
      return id;
    } catch (error) {
      console.error('❌ Error creating subject:', error);
      throw error;
    }
  }

  /**
   * Get all subjects with optional filtering
   */
  static async getAllSubjects(
    filters?: {
      category?: string;
      difficulty?: string;
      isActive?: boolean;
      search?: string;
    }
  ): Promise<Subject[]> {
    try {
      let query = db.select().from(subjects);

      if (filters?.category) {
        query = query.where(eq(subjects.category, filters.category));
      }

      if (filters?.difficulty) {
        query = query.where(eq(subjects.difficulty, filters.difficulty));
      }

      if (filters?.isActive !== undefined) {
        query = query.where(eq(subjects.isActive, filters.isActive));
      }

      if (filters?.search) {
        query = query.where(
          like(subjects.name, `%${filters.search}%`)
        );
      }

      const results = await query.orderBy(desc(subjects.createdAt));
      
      // Update question counts
      const subjectsWithCounts = await Promise.all(
        results.map(async (subject) => {
          const questionCount = await this.getQuestionCount(subject.id);
          return {
            ...subject,
            questionCount,
          };
        })
      );

      return subjectsWithCounts;
    } catch (error) {
      console.error('❌ Error getting subjects:', error);
      throw error;
    }
  }

  /**
   * Get subject by ID
   */
  static async getSubjectById(id: string): Promise<Subject | null> {
    try {
      const result = await db
        .select()
        .from(subjects)
        .where(eq(subjects.id, id))
        .limit(1);

      if (result.length === 0) {
        return null;
      }

      const subject = result[0];
      const questionCount = await this.getQuestionCount(subject.id);

      return {
        ...subject,
        questionCount,
      };
    } catch (error) {
      console.error('❌ Error getting subject by ID:', error);
      throw error;
    }
  }

  /**
   * Update subject
   */
  static async updateSubject(id: string, data: UpdateSubjectData): Promise<void> {
    try {
      const updateData: any = {
        updatedAt: new Date(),
      };

      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.category !== undefined) updateData.category = data.category;
      if (data.difficulty !== undefined) updateData.difficulty = data.difficulty;
      if (data.isActive !== undefined) updateData.isActive = data.isActive;

      await db
        .update(subjects)
        .set(updateData)
        .where(eq(subjects.id, id));

      console.log(`✅ Subject updated: ${id}`);
    } catch (error) {
      console.error('❌ Error updating subject:', error);
      throw error;
    }
  }

  /**
   * Delete subject
   */
  static async deleteSubject(id: string): Promise<void> {
    try {
      // Check if subject has questions
      const questionCount = await this.getQuestionCount(id);
      if (questionCount > 0) {
        throw new Error('Cannot delete subject with existing questions');
      }

      await db.delete(subjects).where(eq(subjects.id, id));
      console.log(`✅ Subject deleted: ${id}`);
    } catch (error) {
      console.error('❌ Error deleting subject:', error);
      throw error;
    }
  }

  /**
   * Toggle subject active status
   */
  static async toggleActive(id: string): Promise<void> {
    try {
      const subject = await this.getSubjectById(id);
      if (!subject) {
        throw new Error('Subject not found');
      }

      await db
        .update(subjects)
        .set({ 
          isActive: !subject.isActive,
          updatedAt: new Date()
        })
        .where(eq(subjects.id, id));

      console.log(`✅ Subject ${id} active status toggled to ${!subject.isActive}`);
    } catch (error) {
      console.error('❌ Error toggling subject active status:', error);
      throw error;
    }
  }

  /**
   * Get question count for a subject
   */
  static async getQuestionCount(subjectId: string): Promise<number> {
    try {
      const result = await db
        .select({ count: count() })
        .from(questions)
        .where(eq(questions.subjectId, subjectId));

      return result[0]?.count || 0;
    } catch (error) {
      console.error('❌ Error getting question count:', error);
      return 0;
    }
  }

  /**
   * Get subjects by category
   */
  static async getSubjectsByCategory(category: string): Promise<Subject[]> {
    try {
      const results = await db
        .select()
        .from(subjects)
        .where(eq(subjects.category, category))
        .orderBy(desc(subjects.createdAt));

      const subjectsWithCounts = await Promise.all(
        results.map(async (subject) => {
          const questionCount = await this.getQuestionCount(subject.id);
          return {
            ...subject,
            questionCount,
          };
        })
      );

      return subjectsWithCounts;
    } catch (error) {
      console.error('❌ Error getting subjects by category:', error);
      throw error;
    }
  }

  /**
   * Get subject statistics
   */
  static async getSubjectStats(): Promise<{
    totalSubjects: number;
    activeSubjects: number;
    subjectsByCategory: Record<string, number>;
    subjectsByDifficulty: Record<string, number>;
  }> {
    try {
      const allSubjects = await this.getAllSubjects();
      
      const stats = {
        totalSubjects: allSubjects.length,
        activeSubjects: allSubjects.filter(s => s.isActive).length,
        subjectsByCategory: {} as Record<string, number>,
        subjectsByDifficulty: {} as Record<string, number>,
      };

      // Count by category
      allSubjects.forEach(subject => {
        stats.subjectsByCategory[subject.category] = 
          (stats.subjectsByCategory[subject.category] || 0) + 1;
      });

      // Count by difficulty
      allSubjects.forEach(subject => {
        stats.subjectsByDifficulty[subject.difficulty] = 
          (stats.subjectsByDifficulty[subject.difficulty] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('❌ Error getting subject stats:', error);
      throw error;
    }
  }
} 