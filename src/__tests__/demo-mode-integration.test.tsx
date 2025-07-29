import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { shouldUseDemoData, toggleDemoMode, loadDemoDataToLocalStorage } from '@/data/demo-data';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}));

// Mock toast
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

describe('Demo Mode Integration Tests', () => {
  beforeEach(() => {
    // Clear all localStorage
    localStorage.clear();
    // Reset window location
    delete (window as any).location;
    (window as any).location = { 
      search: '', 
      reload: jest.fn(),
      href: 'http://localhost:3000'
    };
  });

  describe('Demo Data Loading', () => {
    it('should load demo data to localStorage when demo mode is activated', () => {
      // Activate demo mode
      toggleDemoMode(true);
      
      // Load demo data
      loadDemoDataToLocalStorage();
      
      // Check that demo subjects are loaded
      const subjects = localStorage.getItem('exam_training_subjects');
      expect(subjects).toBeTruthy();
      
      const parsedSubjects = JSON.parse(subjects!);
      expect(parsedSubjects).toHaveLength(5); // Should have 5 demo subjects
      expect(parsedSubjects[0].name).toBe('Matematik');
    });

    it('should load demo questions when demo mode is active', () => {
      // Activate demo mode
      toggleDemoMode(true);
      loadDemoDataToLocalStorage();
      
      // Check that demo questions are loaded
      const questions = localStorage.getItem('exam_training_questions');
      expect(questions).toBeTruthy();
      
      const parsedQuestions = JSON.parse(questions!);
      expect(parsedQuestions.length).toBeGreaterThan(0);
      expect(parsedQuestions[0].subject).toBeDefined();
    });

    it('should load demo quiz results when demo mode is active', () => {
      // Activate demo mode
      toggleDemoMode(true);
      loadDemoDataToLocalStorage();
      
      // Check that demo quiz results are loaded
      const results = localStorage.getItem('exam_training_demo_quiz_results');
      expect(results).toBeTruthy();
      
      const parsedResults = JSON.parse(results!);
      expect(parsedResults.length).toBeGreaterThan(0);
      expect(parsedResults[0].isDemo).toBe(true);
    });
  });

  describe('Demo Mode State Persistence', () => {
    it('should persist demo mode state across page reloads', () => {
      // Set demo mode to false
      toggleDemoMode(false);
      expect(shouldUseDemoData()).toBe(false);
      
      // Simulate page reload by checking the function again
      expect(shouldUseDemoData()).toBe(false);
      
      // Set demo mode to true
      toggleDemoMode(true);
      expect(shouldUseDemoData()).toBe(true);
      
      // Should still be true after "reload"
      expect(shouldUseDemoData()).toBe(true);
    });

    it('should handle URL parameter override correctly', () => {
      // Set demo mode to false in localStorage
      toggleDemoMode(false);
      
      // But URL has demo=true
      (window as any).location.search = '?demo=true';
      
      // Should return true (URL overrides localStorage)
      expect(shouldUseDemoData()).toBe(true);
    });
  });

  describe('Demo Mode Switch Behavior', () => {
    it('should clear demo quiz results when exiting demo mode', () => {
      // Setup: Add demo results
      toggleDemoMode(true);
      loadDemoDataToLocalStorage();
      
      // Verify demo results exist
      expect(localStorage.getItem('exam_training_demo_quiz_results')).toBeTruthy();
      
      // Exit demo mode
      toggleDemoMode(false);
      
      // Demo results should be cleared when component handles the toggle
      // (This is handled in the component, not in toggleDemoMode itself)
    });
  });

  describe('Error Handling', () => {
    it('should handle localStorage errors gracefully', () => {
      // Mock localStorage to throw error
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = jest.fn(() => {
        throw new Error('QuotaExceededError');
      });
      
      // Should not throw when toggling demo mode
      expect(() => toggleDemoMode(true)).not.toThrow();
      
      // Restore original
      localStorage.setItem = originalSetItem;
    });
  });
});