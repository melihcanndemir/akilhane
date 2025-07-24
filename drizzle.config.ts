import type { Config } from 'drizzle-kit';

export default {
  schema: './src/lib/database/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.NODE_ENV === 'production' 
      ? '/data/exam-training.db' 
      : './exam-training.db',
  },
  verbose: true,
  strict: true,
} satisfies Config; 