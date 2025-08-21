// Topic Explainer LocalStorage Service - Now using UnifiedStorageService
export interface TopicStepData {
  id: string;
  title: string;
  content: string;
  examples: string[];
  tips: string[];
  difficulty: "easy" | "medium" | "hard";
  estimatedTime: number;
  visualDescription?: string;
  confidence?: number;
}

export interface SavedTopicContent {
  id: string;
  topic: string;
  subject: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  stepData?: TopicStepData[];
}

// Import UnifiedStorageService
import { UnifiedStorageService } from "./unified-storage-service";

class TopicExplainerLocalStorageService {
  // Now using UnifiedStorageService methods

  static getSavedTopics(): SavedTopicContent[] {
    return UnifiedStorageService.getSavedTopics();
  }

  static saveTopic(topic: string, subject: string, content: string, stepData?: TopicStepData[]): SavedTopicContent {
    return UnifiedStorageService.saveTopic(topic, subject, content, stepData);
  }

  static updateTopic(id: string, updates: Partial<Omit<SavedTopicContent, 'id'>>): boolean {
    return UnifiedStorageService.updateTopic(id, updates);
  }

  static deleteTopic(id: string): boolean {
    return UnifiedStorageService.deleteTopic(id);
  }

  static getTopicById(id: string): SavedTopicContent | null {
    return UnifiedStorageService.getTopicById(id);
  }

  static getTopicsBySubject(subject: string): SavedTopicContent[] {
    return UnifiedStorageService.getTopicsBySubject(subject);
  }

  static getTopicsByTopic(topic: string): SavedTopicContent[] {
    return UnifiedStorageService.getTopicsByTopic(topic);
  }

  // Additional method to clear topics by subject
  static clearTopicsBySubject(subject: string): number {
    return UnifiedStorageService.clearTopicsBySubject(subject);
  }
}

export default TopicExplainerLocalStorageService;
