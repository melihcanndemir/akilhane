import { Quiz } from '@/components/quiz';
import React from 'react';

export default function QuizPage() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <Quiz />
    </React.Suspense>
  );
}
