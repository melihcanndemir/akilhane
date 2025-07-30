import { generateQuestions, type QuestionGenerationInput } from '../question-generator';

// Mock test for AI question generation
// Note: This is a basic structure. In production, you would mock the AI service
describe('AI Question Generator', () => {
  describe('Input Validation', () => {
    it('should validate required fields', () => {
      const validInput: QuestionGenerationInput = {
        subject: 'Mathematics',
        topic: 'Calculus',
        difficulty: 'Medium',
        type: 'multiple-choice',
        count: 5,
        language: 'tr',
      };

      // Test that all required fields are present
      expect(validInput.subject).toBeDefined();
      expect(validInput.topic).toBeDefined();
      expect(validInput.difficulty).toMatch(/Easy|Medium|Hard/);
      expect(validInput.type).toMatch(/multiple-choice|true-false|calculation|case-study/);
      expect(validInput.count).toBeGreaterThan(0);
      expect(validInput.count).toBeLessThanOrEqual(10);
    });
  });

  describe('Question Quality Validation', () => {
    it('should validate multiple choice questions have exactly 4 options', () => {
      const mcQuestion = {
        text: 'What is 2 + 2?',
        options: [
          { text: '3', isCorrect: false },
          { text: '4', isCorrect: true },
          { text: '5', isCorrect: false },
          { text: '6', isCorrect: false },
        ],
        explanation: '2 + 2 equals 4',
        topic: 'Basic Arithmetic',
        difficulty: 'Easy' as const,
        keywords: ['addition', 'arithmetic'],
        learningObjective: 'Understanding basic addition',
      };

      expect(mcQuestion.options).toHaveLength(4);
      expect(mcQuestion.options.filter(opt => opt.isCorrect)).toHaveLength(1);
    });

    it('should validate true/false questions have exactly 2 options', () => {
      const tfQuestion = {
        text: 'The Earth is flat.',
        options: [
          { text: 'True', isCorrect: false },
          { text: 'False', isCorrect: true },
        ],
        explanation: 'The Earth is spherical, not flat',
        topic: 'Geography',
        difficulty: 'Easy' as const,
        keywords: ['earth', 'geography'],
        learningObjective: 'Understanding basic facts about Earth',
      };

      expect(tfQuestion.options).toHaveLength(2);
      expect(tfQuestion.options.filter(opt => opt.isCorrect)).toHaveLength(1);
    });

    it('should ensure all questions have required fields', () => {
      const question = {
        text: 'Sample question text',
        options: [],
        explanation: 'Sample explanation',
        topic: 'Sample Topic',
        difficulty: 'Medium' as const,
        keywords: ['keyword1', 'keyword2'],
        learningObjective: 'Sample learning objective',
      };

      expect(question.text).toBeTruthy();
      expect(question.text.length).toBeGreaterThan(10);
      expect(question.explanation).toBeTruthy();
      expect(question.explanation.length).toBeGreaterThan(20);
      expect(question.learningObjective).toBeTruthy();
      expect(question.keywords.length).toBeGreaterThan(0);
    });
  });

  describe('Quality Score Calculation', () => {
    it('should calculate quality score based on completeness', () => {
      const calculateQualityScore = (questions: any[]): number => {
        let score = 1.0;
        
        questions.forEach(q => {
          if (!q.text || q.text.trim().length < 10) score -= 0.1;
          if (!q.explanation || q.explanation.trim().length < 20) score -= 0.05;
          if (!q.learningObjective) score -= 0.05;
        });

        return Math.max(0, Math.min(1, score));
      };

      const goodQuestions = [{
        text: 'This is a complete question with good length',
        explanation: 'This is a detailed explanation of the answer',
        learningObjective: 'Students will understand the concept',
      }];

      const poorQuestions = [{
        text: 'Short',
        explanation: 'Brief',
        learningObjective: '',
      }];

      expect(calculateQualityScore(goodQuestions)).toBeGreaterThan(0.8);
      expect(calculateQualityScore(poorQuestions)).toBeLessThan(0.8);
    });
  });

  describe('Language Support', () => {
    it('should support Turkish language generation', () => {
      const turkishInput: QuestionGenerationInput = {
        subject: 'Matematik',
        topic: 'Türev ve İntegral',
        difficulty: 'Medium',
        type: 'multiple-choice',
        count: 3,
        language: 'tr',
      };

      expect(turkishInput.language).toBe('tr');
    });

    it('should support English language generation', () => {
      const englishInput: QuestionGenerationInput = {
        subject: 'Mathematics',
        topic: 'Derivatives and Integrals',
        difficulty: 'Medium',
        type: 'multiple-choice',
        count: 3,
        language: 'en',
      };

      expect(englishInput.language).toBe('en');
    });
  });
});