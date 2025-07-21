import type { Question } from './types';

export const questions: Question[] = [
  // Financial Statement Analysis
  {
    id: 'fsa1',
    subject: 'Financial Statement Analysis',
    type: 'multiple-choice',
    difficulty: 'Easy',
    text: 'What does the Current Ratio measure?',
    options: [
      { text: 'Profitability', isCorrect: false },
      { text: 'Liquidity', isCorrect: true },
      { text: 'Debt', isCorrect: false },
      { text: 'Efficiency', isCorrect: false },
    ],
    explanation: 'The Current Ratio (Current Assets / Current Liabilities) is a liquidity ratio that measures a company\'s ability to pay short-term obligations.',
  },
  {
    id: 'fsa2',
    subject: 'Financial Statement Analysis',
    type: 'calculation',
    difficulty: 'Medium',
    text: 'A company has Current Assets of $500,000 and Current Liabilities of $250,000. What is its Current Ratio?',
    options: [
        { text: '2.0', isCorrect: true },
        { text: '0.5', isCorrect: false },
        { text: '2.5', isCorrect: false },
        { text: '1.0', isCorrect: false },
    ],
    explanation: 'Current Ratio = Current Assets / Current Liabilities = $500,000 / $250,000 = 2.0.',
    formula: 'Current Ratio = Current Assets / Current Liabilities',
  },
  {
    id: 'fsa3',
    subject: 'Financial Statement Analysis',
    type: 'true-false',
    difficulty: 'Easy',
    text: 'Return on Equity (ROE) is a measure of a company\'s financial leverage.',
    options: [
        { text: 'True', isCorrect: false },
        { text: 'False', isCorrect: true },
    ],
    explanation: 'False. Return on Equity (ROE) is a profitability ratio that measures the profitability of a corporation in relation to stockholders\' equity.',
  },
   {
    id: 'fsa4',
    subject: 'Financial Statement Analysis',
    type: 'multiple-choice',
    difficulty: 'Hard',
    text: 'Which of these is NOT considered a liquidity ratio?',
    options: [
      { text: 'Quick Ratio', isCorrect: false },
      { text: 'Current Ratio', isCorrect: false },
      { text: 'Cash Ratio', isCorrect: false },
      { text: 'Debt-to-Equity Ratio', isCorrect: true },
    ],
    explanation: 'The Debt-to-Equity Ratio is a debt (or leverage) ratio, not a liquidity ratio. It measures a company\'s financial leverage.',
  },

  // Decision Support Systems
  {
    id: 'dss1',
    subject: 'Decision Support Systems',
    type: 'multiple-choice',
    difficulty: 'Easy',
    text: 'What is the primary goal of a Decision Support System (DSS)?',
    options: [
      { text: 'To automate all decision-making', isCorrect: false },
      { text: 'To replace managers', isCorrect: false },
      { text: 'To help people make decisions by providing information', isCorrect: true },
      { text: 'To process daily transactions', isCorrect: false },
    ],
    explanation: 'The primary goal of a DSS is to assist humans in the decision-making process, not to automate it entirely. It provides data, models, and analysis tools.',
  },
  {
    id: 'dss2',
    subject: 'Decision Support Systems',
    type: 'true-false',
    difficulty: 'Medium',
    text: 'Linear programming is used to find the best outcome in a mathematical model whose requirements are represented by linear relationships.',
    options: [
        { text: 'True', isCorrect: true },
        { text: 'False', isCorrect: false },
    ],
    explanation: 'True. Linear programming is a method to achieve the best outcome (such as maximum profit or lowest cost) in a mathematical model whose requirements are represented by linear relationships.',
  },
  {
    id: 'dss3',
    subject: 'Decision Support Systems',
    type: 'multiple-choice',
    difficulty: 'Hard',
    text: 'Which concept is used in decision tree algorithms to measure the impurity or randomness of a dataset?',
    options: [
      { text: 'Information Gain', isCorrect: false },
      { text: 'Entropy', isCorrect: true },
      { text: 'Monte Carlo Simulation', isCorrect: false },
      { text: 'Chi-square', isCorrect: false },
    ],
    explanation: 'Entropy is a measure of the amount of uncertainty or randomness in a set of data. Decision trees use it to decide how to split the data.',
  },

  // Customer Relationship Management
  {
    id: 'crm1',
    subject: 'Customer Relationship Management',
    type: 'multiple-choice',
    difficulty: 'Easy',
    text: 'Which type of CRM focuses on the automation of customer-facing processes such as sales, marketing, and customer service?',
    options: [
      { text: 'Analytical CRM', isCorrect: false },
      { text: 'Strategic CRM', isCorrect: false },
      { text: 'Collaborative CRM', isCorrect: false },
      { text: 'Operational CRM', isCorrect: true },
    ],
    explanation: 'Operational CRM is concerned with the automation of customer-facing processes like sales force automation, marketing automation, and service automation.',
  },
   {
    id: 'crm2',
    subject: 'Customer Relationship Management',
    type: 'true-false',
    difficulty: 'Medium',
    text: 'Demographic segmentation divides customers based on their attitudes, values, and interests.',
    options: [
        { text: 'True', isCorrect: false },
        { text: 'False', isCorrect: true },
    ],
    explanation: 'False. Demographic segmentation divides customers based on variables like age, gender, income, and occupation. Psychographic segmentation is based on attitudes, values, and interests.',
  },
  {
    id: 'crm3',
    subject: 'Customer Relationship Management',
    type: 'multiple-choice',
    difficulty: 'Hard',
    text: 'A customer who consistently buys a brand out of habit, but feels little attachment to it, is demonstrating what kind of loyalty?',
    options: [
      { text: 'Emotional Loyalty', isCorrect: false },
      { text: 'Behavioral Loyalty', isCorrect: true },
      { text: 'Cognitive Loyalty', isCorrect: false },
      { text: 'Strategic Loyalty', isCorrect: false },
    ],
    explanation: 'Behavioral loyalty refers to the act of repeat purchasing, which can be driven by habit or convenience rather than a strong emotional connection to the brand.',
  },
];
