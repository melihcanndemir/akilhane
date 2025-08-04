// Topic Explainer LocalStorage Service
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

class TopicExplainerLocalStorageService {
  private static readonly STORAGE_KEY = "akilhane_topic_explainer_content";

  static getSavedTopics(): SavedTopicContent[] {
    if (typeof window === "undefined") {
      return [];
    }
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  static saveTopic(topic: string, subject: string, content: string, stepData?: TopicStepData[]): SavedTopicContent {
    const savedTopic: SavedTopicContent = {
      id: `topic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      topic,
      subject,
      content,
      ...(stepData && { stepData }),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const topics = this.getSavedTopics();
    topics.push(savedTopic);
    this.saveTopics(topics);
    return savedTopic;
  }

  static updateTopic(id: string, updates: Partial<Omit<SavedTopicContent, 'id'>>): boolean {
    const topics = this.getSavedTopics();
    const index = topics.findIndex((t) => t.id === id);
    if (index === -1) {
      return false;
    }

    topics[index] = {
      ...topics[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    } as SavedTopicContent;
    this.saveTopics(topics);
    return true;
  }

  static deleteTopic(id: string): boolean {
    const topics = this.getSavedTopics();
    const filtered = topics.filter((t) => t.id !== id);
    if (filtered.length === topics.length) {
      return false;
    }
    this.saveTopics(filtered);
    return true;
  }

  static getTopicById(id: string): SavedTopicContent | null {
    const topics = this.getSavedTopics();
    return topics.find((t) => t.id === id) || null;
  }

  static getTopicsBySubject(subject: string): SavedTopicContent[] {
    const topics = this.getSavedTopics();
    return topics.filter((t) => t.subject === subject);
  }

  static getTopicsByTopic(topic: string): SavedTopicContent[] {
    const topics = this.getSavedTopics();
    return topics.filter((t) => t.topic === topic);
  }

  private static saveTopics(topics: SavedTopicContent[]): void {
    if (typeof window === "undefined") {
      return;
    }
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(topics));
    } catch {}
  }
}

export default TopicExplainerLocalStorageService;
