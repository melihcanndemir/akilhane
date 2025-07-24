import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { createId } from '@paralleldrive/cuid2';

// Users table
export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Subjects table
export const subjects = sqliteTable('subjects', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull().unique(),
  description: text('description').notNull(),
  category: text('category').notNull(),
  difficulty: text('difficulty').notNull(), // 'Kolay', 'Orta', 'Zor'
  questionCount: integer('question_count').notNull().default(0),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdBy: text('created_by').references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Questions table
export const questions = sqliteTable('questions', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  subjectId: text('subject_id').notNull().references(() => subjects.id),
  subject: text('subject').notNull(),
  topic: text('topic').notNull(),
  type: text('type').notNull(), // 'multiple-choice', 'true-false', 'calculation', 'case-study'
  difficulty: text('difficulty').notNull(), // 'Kolay', 'Orta', 'Zor'
  text: text('text').notNull(),
  options: text('options').notNull(), // JSON string of options
  correctAnswer: text('correct_answer').notNull(),
  explanation: text('explanation').notNull(),
  formula: text('formula'), // For calculation questions
  createdBy: text('created_by').references(() => users.id),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Quiz results table
export const quizResults = sqliteTable('quiz_results', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id),
  subject: text('subject').notNull(),
  score: integer('score').notNull(),
  totalQuestions: integer('total_questions').notNull(),
  timeSpent: integer('time_spent').notNull(), // in seconds
  weakTopics: text('weak_topics').notNull(), // JSON string
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Performance analytics table
export const performanceAnalytics = sqliteTable('performance_analytics', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id),
  subject: text('subject').notNull(),
  averageScore: real('average_score').notNull(),
  totalTests: integer('total_tests').notNull(),
  averageTimeSpent: real('average_time_spent').notNull(), // in minutes
  weakTopics: text('weak_topics').notNull(), // JSON string
  lastUpdated: integer('last_updated', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// AI recommendations table
export const aiRecommendations = sqliteTable('ai_recommendations', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id),
  subject: text('subject').notNull(),
  recommendedDifficulty: text('recommended_difficulty').notNull(), // 'Kolay', 'Orta', 'Zor'
  reasoning: text('reasoning').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Flashcard progress table
export const flashcardProgress = sqliteTable('flashcard_progress', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id),
  subject: text('subject').notNull(),
  cardId: text('card_id').notNull(),
  isKnown: integer('is_known', { mode: 'boolean' }).notNull().default(false),
  reviewCount: integer('review_count').notNull().default(0),
  lastReviewed: integer('last_reviewed', { mode: 'timestamp' }),
  nextReview: integer('next_review', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
}); 