import {
  pgTable,
  text,
  integer,
  real,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

// Users table
export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Subjects table
export const subjects = pgTable("subjects", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  difficulty: text("difficulty").notNull(), // 'Easy', 'Medium', 'Hard'
  questionCount: integer("question_count").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdBy: text("created_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Questions table
export const questions = pgTable("questions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  subjectId: text("subject_id")
    .notNull()
    .references(() => subjects.id),
  subject: text("subject").notNull(),
  topic: text("topic").notNull(),
  type: text("type").notNull(), // 'multiple-choice', 'true-false', 'calculation', 'case-study'
  difficulty: text("difficulty").notNull(), // 'Easy', 'Medium', 'Hard'
  text: text("text").notNull(),
  options: text("options").notNull(), // JSON string of options
  correctAnswer: text("correct_answer").notNull(),
  explanation: text("explanation").notNull(),
  formula: text("formula"), // For calculation questions
  createdBy: text("created_by").references(() => users.id),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Quiz results table
export const quizResults = pgTable("quiz_results", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  subject: text("subject").notNull(),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  timeSpent: integer("time_spent").notNull(), // in seconds
  weakTopics: text("weak_topics").notNull(), // JSON string
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Performance analytics table
export const performanceAnalytics = pgTable("performance_analytics", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  subject: text("subject").notNull(),
  averageScore: real("average_score").notNull(),
  totalTests: integer("total_tests").notNull(),
  averageTimeSpent: real("average_time_spent").notNull(), // in minutes
  weakTopics: text("weak_topics").notNull(), // JSON string
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
});

// AI recommendations table
export const aiRecommendations = pgTable("ai_recommendations", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  subject: text("subject").notNull(),
  recommendedDifficulty: text("recommended_difficulty").notNull(), // 'Easy', 'Medium', 'Hard'
  reasoning: text("reasoning").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Flashcard progress table
export const flashcardProgress = pgTable("flashcard_progress", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  subject: text("subject").notNull(),
  cardId: text("card_id").notNull(),
  isKnown: boolean("is_known").notNull().default(false),
  reviewCount: integer("review_count").notNull().default(0),
  lastReviewed: timestamp("last_reviewed"),
  nextReview: timestamp("next_review"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// AI Chat History table
export const aiChatHistory = pgTable("ai_chat_history", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  sessionId: text("session_id").notNull(), // Unique session identifier
  subject: text("subject").notNull(),
  role: text("role").notNull(), // 'user' or 'assistant'
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// AI Chat Sessions table
export const aiChatSessions = pgTable("ai_chat_sessions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  sessionId: text("session_id").notNull().unique(), // Unique session identifier
  subject: text("subject").notNull(),
  title: text("title"), // Auto-generated title for the session
  messageCount: integer("message_count").notNull().default(0),
  lastMessageAt: timestamp("last_message_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
