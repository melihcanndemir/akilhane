# Contributing to AkılHane

Thank you for your interest in contributing to AkılHane! This document provides guidelines and information for contributors.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git
- Supabase account (for database features)
- Google Cloud account (for AI features)

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/melihcanndemir/akilhane.git
   cd akilhane
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```bash
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   
   # AI Configuration
   GOOGLE_GENAI_API_KEY=your_gemini_api_key
   
   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   ```

4. **Database Setup**
   ```bash
   npm run db:generate
   npm run db:push
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## 📋 Contribution Guidelines

### Code Style

We follow strict TypeScript and ESLint rules. Please ensure your code follows these standards:

#### TypeScript
- Use strict TypeScript mode
- Define proper types for all functions and variables
- Use interfaces for object shapes
- Prefer `const` over `let` when possible

#### React Components
```typescript
// ✅ Good
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  onClick 
}) => {
  return (
    <button 
      className={`btn btn-${variant}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

// ❌ Avoid
export const Button = ({ children, variant, onClick }) => {
  return <button onClick={onClick}>{children}</button>;
};
```

#### File Naming
- Components: `PascalCase.tsx` (e.g., `UserProfile.tsx`)
- Utilities: `camelCase.ts` (e.g., `formatDate.ts`)
- Pages: `kebab-case.tsx` (e.g., `user-settings.tsx`)

### Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Dashboard routes
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── ui/               # Base UI components
│   ├── forms/            # Form components
│   └── layout/           # Layout components
├── lib/                  # Utilities and configurations
│   ├── supabase.ts       # Supabase client
│   ├── utils.ts          # Utility functions
│   └── validations.ts    # Zod schemas
├── hooks/                # Custom React hooks
├── types/                # TypeScript type definitions
└── styles/               # Additional styles
```

### Git Workflow

1. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**
   - Follow the coding standards
   - Write meaningful commit messages
   - Test your changes locally

3. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add user profile component"
   ```

4. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### Commit Message Format

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

Examples:
feat(auth): add two-factor authentication
fix(ui): resolve button alignment issue
docs(readme): update installation instructions
style(components): format code according to guidelines
refactor(api): simplify user validation logic
test(quiz): add unit tests for quiz scoring
chore(deps): update dependencies to latest versions
```

### Pull Request Guidelines

1. **Title**: Use conventional commit format
2. **Description**: 
   - Explain what the PR does
   - Include screenshots for UI changes
   - Link related issues
   - Mention breaking changes if any

3. **Checklist**:
   - [ ] Code follows project standards
   - [ ] Tests pass locally
   - [ ] No console errors
   - [ ] Responsive design tested
   - [ ] Accessibility guidelines followed

## 🧪 Testing

### Running Tests
```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# All checks
npm run check-all
```

### Manual Testing Checklist
Refer to [QUALITY_ASSURANCE.md](docs/QUALITY_ASSURANCE.md) for comprehensive testing guidelines.

## 🔧 Development Tools

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript check
npm run db:generate  # Generate database migrations
npm run db:push      # Push database changes
npm run db:studio    # Open Drizzle Studio
```

### VS Code Extensions
We recommend these extensions for development:
- TypeScript and JavaScript Language Features
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- GitLens

## 🎨 UI/UX Guidelines

### Design System
- Use Tailwind CSS for styling
- Follow the existing gradient design language
- Implement glassmorphism effects where appropriate
- Ensure responsive design for all components

### Component Guidelines
```typescript
// ✅ Good - Reusable component with proper props
interface CardProps {
  title: string;
  children: React.ReactNode;
  variant?: 'default' | 'elevated';
  className?: string;
}

export const Card: React.FC<CardProps> = ({ 
  title, 
  children, 
  variant = 'default',
  className 
}) => {
  return (
    <div className={cn(
      'rounded-lg p-6',
      variant === 'elevated' && 'shadow-lg',
      className
    )}>
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      {children}
    </div>
  );
};
```

### Accessibility
- Use semantic HTML elements
- Include proper ARIA labels
- Ensure keyboard navigation works
- Test with screen readers
- Maintain color contrast ratios

## 🤖 AI Integration Guidelines

### Adding AI Features
1. **Use Genkit Framework**: All AI features should use Google Genkit
2. **Error Handling**: Implement proper error handling for AI requests
3. **Rate Limiting**: Respect API rate limits
4. **Validation**: Validate all inputs before sending to AI services

### Example AI Integration
```typescript
// ✅ Good - Proper AI integration
import { genkit } from '@genkit-ai/core';

export async function generateQuestion(topic: string, difficulty: string) {
  try {
    const result = await genkit.run('generate-question', {
      topic,
      difficulty,
      format: 'multiple-choice'
    });
    
    return result;
  } catch (error) {
    console.error('AI generation failed:', error);
    throw new Error('Failed to generate question');
  }
}
```

## 📚 Documentation

### Code Documentation
- Use JSDoc for complex functions
- Include examples in component documentation
- Document API endpoints with proper descriptions

### Example Documentation
```typescript
/**
 * Calculates the user's performance score based on quiz results
 * @param quizResults - Array of quiz result objects
 * @param totalQuestions - Total number of questions attempted
 * @returns Performance score between 0 and 100
 * @example
 * const score = calculatePerformanceScore(results, 50);
 * console.log(score); // 85.5
 */
export function calculatePerformanceScore(
  quizResults: QuizResult[], 
  totalQuestions: number
): number {
  // Implementation
}
```

## 🐛 Bug Reports

### Before Reporting
1. Check existing issues
2. Test on latest version
3. Try to reproduce the issue
4. Check browser console for errors

### Bug Report Template
```markdown
**Bug Description**
Brief description of the issue

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- OS: [e.g. Windows 10]
- Browser: [e.g. Chrome 120]
- Version: [e.g. 1.0.0]

**Additional Context**
Screenshots, console logs, etc.
```

## 💡 Feature Requests

### Before Requesting
1. Check if the feature already exists
2. Consider if it aligns with project goals
3. Think about implementation complexity

### Feature Request Template
```markdown
**Feature Description**
Brief description of the feature

**Use Case**
Why this feature is needed

**Proposed Implementation**
How you think it should work

**Alternatives Considered**
Other approaches you've considered

**Additional Context**
Any other relevant information
```

## 🏷️ Labels

We use these labels to categorize issues and PRs:
- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements to documentation
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `question` - Further information is requested
- `security` - Security-related issues

## 📞 Getting Help

- **Discussions**: Use GitHub Discussions for questions
- **Issues**: Create an issue for bugs or feature requests
- **Documentation**: Check the [docs/](docs/) folder for detailed guides

## 🎉 Recognition

Contributors will be:
- Listed in the README.md contributors section
- Mentioned in release notes
- Given credit in commit history

## 📄 License

By contributing to AkılHane, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to AkılHane! 🚀** 
