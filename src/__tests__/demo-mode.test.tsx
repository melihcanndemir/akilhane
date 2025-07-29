import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { shouldUseDemoData, toggleDemoMode } from '@/data/demo-data';
import DemoPage from '@/app/demo/page';
import QuizComponent from '@/components/quiz';

// Mock the router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock the toast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

describe('Demo Mode Functionality', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset window.location
    delete (window as any).location;
    (window as any).location = { search: '', reload: jest.fn() };
  });

  describe('shouldUseDemoData', () => {
    it('should default to true for first-time visitors', () => {
      const result = shouldUseDemoData();
      expect(result).toBe(true);
      expect(localStorage.getItem('btk_demo_mode')).toBe('true');
    });

    it('should respect URL parameter over localStorage', () => {
      localStorage.setItem('btk_demo_mode', 'false');
      (window as any).location.search = '?demo=true';
      
      const result = shouldUseDemoData();
      expect(result).toBe(true);
    });

    it('should use localStorage value when no URL parameter', () => {
      localStorage.setItem('btk_demo_mode', 'false');
      
      const result = shouldUseDemoData();
      expect(result).toBe(false);
    });
  });

  describe('toggleDemoMode', () => {
    it('should update localStorage when toggled', () => {
      toggleDemoMode(true);
      expect(localStorage.getItem('btk_demo_mode')).toBe('true');

      toggleDemoMode(false);
      expect(localStorage.getItem('btk_demo_mode')).toBe('false');
    });
  });

  describe('Demo Page', () => {
    it('should render demo mode switch', () => {
      render(<DemoPage />);
      
      const demoSwitch = screen.getByRole('switch', { name: /demo modu/i });
      expect(demoSwitch).toBeInTheDocument();
    });

    it('should activate demo mode on mount if not already active', async () => {
      localStorage.setItem('btk_demo_mode', 'false');
      
      render(<DemoPage />);
      
      await waitFor(() => {
        expect(localStorage.getItem('btk_demo_mode')).toBe('true');
      });
    });

    it('should toggle demo mode when switch is clicked', async () => {
      render(<DemoPage />);
      
      const demoSwitch = screen.getByRole('switch', { name: /demo modu/i });
      
      // Initially should be checked (demo mode active)
      expect(demoSwitch).toBeChecked();
      
      // Click to toggle off
      fireEvent.click(demoSwitch);
      
      await waitFor(() => {
        expect(localStorage.getItem('btk_demo_mode')).toBe('false');
      });
    });
  });

  describe('Quiz Component Mock Data Loading', () => {
    const mockSubject = 'Matematik';

    it('should load demo questions when in demo mode', async () => {
      render(<QuizComponent subject={mockSubject} isDemoMode={true} />);
      
      await waitFor(() => {
        // Should show demo questions
        expect(screen.getByText(/demo soru/i)).toBeInTheDocument();
      });
    });

    it('should offer to load demo questions when no questions available', async () => {
      // Mock window.confirm
      window.confirm = jest.fn(() => true);
      
      // Clear any existing questions
      localStorage.removeItem('exam_training_questions');
      
      render(<QuizComponent subject={mockSubject} isDemoMode={false} />);
      
      await waitFor(() => {
        expect(window.confirm).toHaveBeenCalledWith(
          expect.stringContaining('Demo sorularla devam etmek ister misiniz?')
        );
      });
    });

    it('should show loading state with appropriate message', () => {
      render(<QuizComponent subject={mockSubject} isDemoMode={true} />);
      
      expect(screen.getByText('Demo sorular hazırlanıyor...')).toBeInTheDocument();
    });

    it('should show fallback UI when questions cannot be loaded', async () => {
      render(<QuizComponent subject={mockSubject} isDemoMode={false} />);
      
      const reloadButton = await screen.findByText('Sayfayı Yenile');
      expect(reloadButton).toBeInTheDocument();
    });
  });
});