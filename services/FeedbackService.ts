import { offlineManager } from '../utils/OfflineManager';
import { errorReporter } from '../utils/ErrorReporter';

export interface Feedback {
  id?: string;
  rating: number;
  comment: string;
  category: string;
  timestamp: number;
  userId?: string;
  deviceInfo?: {
    platform: string;
    version: string;
  };
}

class FeedbackService {
  private readonly API_ENDPOINT = 'https://api.example.com/feedback';

  public async submitFeedback(feedback: Feedback): Promise<void> {
    try {
      const feedbackWithId = {
        ...feedback,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };

      if (navigator.onLine) {
        await this.sendFeedbackToServer(feedbackWithId);
      } else {
        await this.queueFeedbackForSync(feedbackWithId);
      }
    } catch (error) {
      errorReporter.reportError(error as Error, { feedback });
      throw error;
    }
  }

  private async sendFeedbackToServer(feedback: Feedback): Promise<void> {
    try {
      const response = await fetch(this.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedback),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      await this.queueFeedbackForSync(feedback);
      throw error;
    }
  }

  private async queueFeedbackForSync(feedback: Feedback): Promise<void> {
    await offlineManager.addToSyncQueue('create', 'feedback', feedback);
  }

  public async getFeedbackAnalysis(): Promise<{
    averageRating: number;
    categoryDistribution: Record<string, number>;
    recentFeedback: Feedback[];
  }> {
    try {
      const response = await fetch(`${this.API_ENDPOINT}/analysis`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      errorReporter.reportError(error as Error);
      throw error;
    }
  }

  public async getFeedbackByCategory(category: string): Promise<Feedback[]> {
    try {
      const response = await fetch(`${this.API_ENDPOINT}/category/${category}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      errorReporter.reportError(error as Error, { category });
      throw error;
    }
  }

  public async getFeedbackByTimeRange(
    startTime: number,
    endTime: number
  ): Promise<Feedback[]> {
    try {
      const response = await fetch(
        `${this.API_ENDPOINT}/time-range?start=${startTime}&end=${endTime}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      errorReporter.reportError(error as Error, { startTime, endTime });
      throw error;
    }
  }
}

export const feedbackService = new FeedbackService(); 