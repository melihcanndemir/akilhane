# 🏗️ AkılHane - Comprehensive Project Analysis

## 📋 Table of Contents
1. [General Architecture Structure](#1--general-architecture-structure)
2. [Folder Structure and Purposes](#2--folder-structure-and-purposes)
3. [Main Component Communication](#3--main-component-communication)
4. [Code Quality Analysis](#4--code-quality-analysis)
5. [Security and Performance](#5--security-and-performance)
6. [Testing Structure](#6--testing-structure)
7. [Refactoring Recommendations](#7--refactoring-recommendations)
8. [Technical Documentation Summary](#8--technical-documentation-summary)

## 1. 📐 General Architecture Structure

### **Technology Stack:**
- **Frontend:** Next.js 15.3.3 (React 18.3.1) + TypeScript
- **Styling:** Tailwind CSS + Radix UI + Framer Motion
- **Backend:** Next.js API Routes + Server Actions
- **Database:** PostgreSQL (Supabase) + Drizzle ORM
- **AI Integration:** Google Genkit + Gemini AI
- **Auth:** Supabase Auth
- **Storage:** Cloudinary (avatar management)
- **PWA:** next-pwa

### **Layers:**

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│  (React Components + Next.js Pages + Tailwind CSS)      │
├─────────────────────────────────────────────────────────┤
│                    Business Logic Layer                  │
│     (Services + API Routes + Server Actions)            │
├─────────────────────────────────────────────────────────┤
│                      AI Layer                           │
│        (Genkit Flows + Google Gemini)                   │
├─────────────────────────────────────────────────────────┤
│                   Data Access Layer                      │
│      (Drizzle ORM + Repository Pattern)                 │
├─────────────────────────────────────────────────────────┤
│                    Database Layer                        │
│         (PostgreSQL via Supabase)                       │
└─────────────────────────────────────────────────────────┘
```

## 2. 📁 Folder Structure and Purposes

### **`/src/app/` - Next.js App Router**
- **Page Routes:** Each folder represents a route
  - `dashboard/` - Main control panel
  - `quiz/` - Quiz solving module
  - `flashcard/` - Flashcard learning system
  - `ai-chat/` - AI chat interface
  - `subject-manager/` - Subject management
  - `question-manager/` - Question management
  - `profile/` - User profile
  - `settings/` - Settings
  - `auth/` - Authentication pages

### **`/src/ai/` - AI Integration**
- `flows/` - Genkit AI flows
  - `ai-tutor.ts` - AI teacher assistant
  - `ai-chat.ts` - Chat system
  - `flashcard-recommendation.ts` - Personalized card recommendations
  - `personalize-question-difficulty.ts` - Difficulty level personalization

### **`/src/components/` - React Components**
- `ui/` - Basic UI components (Button, Card, Dialog, etc.)
- `ai/` - AI-powered components
- Main components (Quiz, Dashboard, FlashCard, etc.)

### **`/src/lib/` - Helper Libraries**
- `database/` - Database configuration
  - `schema.ts` - Drizzle ORM schemas
  - `connection.ts` - DB connection management
  - `repositories/` - Repository pattern implementation

### **`/src/services/` - Business Logic Services**
- `performance-service.ts` - Performance analytics
- `supabase-service.ts` - Supabase integration
- `localStorage-service.ts` - Local storage management

### **`/src/hooks/` - Custom React Hooks**
- `useAuth.ts` - Authentication hook
- `useLocalAuth.ts` - Local auth management
- `use-toast.ts` - Notification system

## 3. 🔄 Main Component Communication

### **API Endpoints:**
```typescript
// Quiz API
POST /api/quiz - Create test
GET  /api/quiz - Get test results

// Subjects API  
GET  /api/subjects - List subjects
POST /api/subjects - Add new subject
PUT  /api/subjects/[id] - Update subject
DELETE /api/subjects/[id] - Delete subject

// Questions API
GET  /api/questions - List questions
POST /api/questions - Add new question
PUT  /api/questions/[id] - Update question
DELETE /api/questions/[id] - Delete question

// AI Chat API
POST /api/ai-chat/sessions - Start new session
POST /api/ai-chat/messages - Send message
GET  /api/ai-chat/history - Chat history

// Analytics API
GET  /api/analytics - Performance analytics

// Avatar API
POST /api/upload-avatar - Upload avatar
DELETE /api/delete-avatar - Delete avatar
```

### **Data Flow:**
```
User Action → React Component → API Route/Server Action
                                        ↓
                               Service Layer
                                        ↓
                               Repository Layer
                                        ↓
                                  Database
```

### **AI Flow Example:**
```typescript
// AI Tutor Flow
1. User requests help with question
2. Component → AI Tutor API call
3. Genkit Flow → Google Gemini
4. Structured response → UI display
```

## 4. 📊 Code Quality Analysis

### **✅ Strengths:**
1. **TypeScript Strict Mode:** Full type safety
2. **Repository Pattern:** Clean data access layer
3. **Modular Structure:** Well-organized folder structure
4. **AI Integration:** Structured AI flows with Genkit
5. **Modern UI:** Radix UI + Tailwind CSS combination
6. **PWA Support:** Offline working capability
7. **Responsive Design:** Compatible across all devices
8. **Gradient Design Language:** Consistent visual language

### **⚠️ Areas for Improvement:**
1. **Missing Tests:** No test files present
2. **Missing Error Boundary:** No global error handling
3. **TypeScript Build Errors:** Using `ignoreBuildErrors: true`
4. **ESLint Disabled:** Using `ignoreDuringBuilds: true`
5. **Environment Variable Validation:** Missing .env validation
6. **API Rate Limiting:** No DDoS protection
7. **Logging System:** Missing centralized log management

## 5. 🔒 Security and Performance

### **Security:**
- ✅ Supabase RLS (Row Level Security) implementation
- ✅ TypeScript type safety
- ✅ Secure file uploads with Cloudinary
- ✅ JWT token management
- ✅ HTTPS enforcement
- ⚠️ Missing API rate limiting
- ⚠️ Input sanitization missing in some areas
- ⚠️ Missing CSRF protection
- ⚠️ Missing security headers

### **Performance:**
- ✅ Next.js SSR/SSG optimizations
- ✅ PWA with offline support
- ✅ Lazy loading components
- ✅ Image optimization (Next/Image)
- ✅ Code splitting
- ⚠️ Bundle size optimization can be improved
- ⚠️ Database query optimization may be needed
- ⚠️ Redis cache layer can be added
- ⚠️ CDN integration can be implemented

## 6. 🧪 Testing Structure

### **Current Status:** 
No test files present ❌

### **Recommended Testing Strategy:**
```typescript
src/
  __tests__/
    unit/
      services/
        - performance-service.test.ts
        - supabase-service.test.ts
      hooks/
        - useAuth.test.ts
        - useLocalAuth.test.ts
      utils/
        - helpers.test.ts
    integration/
      api/
        - quiz.test.ts
        - subjects.test.ts
        - questions.test.ts
      database/
        - repositories.test.ts
    e2e/
      user-flows/
        - quiz-flow.test.ts
        - auth-flow.test.ts
```

### **Recommended Testing Tools:**
- **Unit Tests:** Jest + React Testing Library
- **Integration Tests:** Jest + Supertest
- **E2E Tests:** Playwright or Cypress
- **AI Flow Tests:** Genkit Test Utils

## 7. 🔧 Refactoring Recommendations

### **1. Code Duplication:**
```typescript
// Problem: Repeated Supabase auth checks
const { data: { user } } = await supabase.auth.getUser();

// Solution: Custom hook
function useSupabaseUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Centralized user management
  }, []);
  
  return { user, loading };
}
```

### **2. Complex Functions:**
```typescript
// Problem: handleAnswer function in Quiz component is too long

// Solution: Break into smaller parts
const answerHandlers = {
  validate: validateAnswer,
  updateScore: updateScore,
  saveProgress: saveProgress,
  moveNext: moveToNext
};

function handleAnswer(answer: string) {
  Object.values(answerHandlers).forEach(handler => handler(answer));
}
```

### **3. API Response Standardization:**
```typescript
// Recommended response wrapper
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: string;
    version: string;
    requestId: string;
  };
}

// Usage
export function createApiResponse<T>(
  data?: T, 
  error?: any
): ApiResponse<T> {
  return {
    success: !error,
    data,
    error,
    metadata: {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      requestId: generateRequestId()
    }
  };
}
```

### **4. Error Handling Standardization:**
```typescript
// Global error handler
class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
  }
}

// Error boundary component
function ErrorBoundary({ children }: { children: React.ReactNode }) {
  // Implementation
}
```

### **5. Environment Variables Validation:**
```typescript
// env.schema.ts
import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
  DATABASE_URL: z.string().url(),
});

export function validateEnv() {
  return envSchema.parse(process.env);
}
```

## 8. 📚 Technical Documentation Summary

### **Quick Start:**
```bash
# 1. Clone repository
git clone https://github.com/melihcanndemir/akilhane.git
cd akilhane

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local file

# 4. Prepare database
npm run db:generate
npm run db:migrate
npm run db:init

# 5. Start development server
npm run dev

# 6. Genkit UI (optional)
npm run genkit:dev
```

### **Core Data Models:**

#### **Users Table:**
- `id`: CUID2 primary key
- `email`: Unique email
- `name`: User name
- `createdAt`, `updatedAt`: Timestamps

#### **Subjects Table:**
- `id`: CUID2 primary key
- `name`: Subject name
- `description`: Description
- `category`: Category
- `difficulty`: Difficulty level
- `questionCount`: Question count
- `isActive`: Active status

#### **Questions Table:**
- `id`: CUID2 primary key
- `subjectId`: Foreign key to subjects
- `type`: Question type (multiple-choice, true-false, etc.)
- `text`: Question text
- `options`: JSON array of options
- `correctAnswer`: Correct answer
- `explanation`: Explanation

#### **Quiz Results Table:**
- `id`: CUID2 primary key
- `userId`: Foreign key to users
- `subject`: Subject
- `score`: Score
- `totalQuestions`: Total questions
- `timeSpent`: Time spent
- `weakTopics`: Weak topics (JSON)

### **Critical Dependencies:**
```json
{
  "next": "15.3.3",
  "react": "18.3.1",
  "@supabase/supabase-js": "2.52.1",
  "drizzle-orm": "0.37.0",
  "genkit": "1.15.5",
  "@genkit-ai/googleai": "1.15.5",
  "@radix-ui/react-*": "latest",
  "tailwindcss": "3.4.1"
}
```

### **Deployment Checklist:**
- [ ] Create Supabase project
- [ ] Set up Cloudinary account
- [ ] Get Google AI API key
- [ ] Configure environment variables
- [ ] Run database migrations
- [ ] Deploy to Vercel/Railway
- [ ] Set up custom domain
- [ ] Enable SSL certificate
- [ ] Set up monitoring
- [ ] Define backup strategy

### **Monitoring and Maintenance:**
- **Error Tracking:** Sentry integration recommended
- **Analytics:** Google Analytics or Plausible
- **Performance:** Lighthouse CI integration
- **Uptime:** UptimeRobot or Pingdom
- **Logs:** Vercel Logs or custom solution

This project is an AI-powered educational platform following modern web development best practices. Code quality is high, architecture is solid, but test coverage and some security optimizations should be added.
