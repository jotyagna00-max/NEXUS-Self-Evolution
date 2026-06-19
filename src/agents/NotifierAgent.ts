import { AgentBase } from "./AgentBase";
import { UserStats, UserProfile } from "../types";

export interface NotifierContext {
  stats: UserStats;
  profile: UserProfile;
  // Any pending notifications or settings
}

export class NotifierAgent extends AgentBase {
  constructor() {
    super("NOTIFIER");
  }

  /**
   * Generate a notification message based on the context and trigger.
   * @param trigger - What triggered the notification (e.g., "quest_completed", "stats_update", "reminder")
   * @param context - Current state.
   * @returns The notification content and title.
   */
  async generateNotification(
    trigger: string,
    context: NotifierContext
  ): Promise<{ title: string; body: string }> {
    const systemInstruction = `
You are the NOTIFIER agent. Your role is to create clear, concise, and motivational notifications for the Operator based on system events.

Generate a notification with a title and body based on the trigger and the Operator's current state.

Consider:
- The Operator's profile and preferences (if available)
- The current stats and any recent achievements
- The nature of the trigger

Keep the title short (under 50 characters) and the body informative and motivational (under 200 characters).
`;

    const { content } = await this.generateResponse(
      systemInstruction,
      `Trigger: "${trigger}"`,
      {
        stats: context.stats,
        profile: context.profile,
      },
      { temperature: 0.7, max_tokens: 512 }
    );

    // Expecting a JSON object with title and body
    let notification: { title: string; body: string };
    try {
      notification = JSON.parse(content);
    } catch (e) {
      // Fallback
      notification = {
        title: "NEXUS Notification",
        body: "System update available. Check your dashboard for details.",
      };
    }

    return notification;
  }

  /**
   * Send a notification (in a real app, this would interface with a notification service).
   * For now, we'll just log it or return it for the UI to handle.
   * @param notification - The notification object.
   */
  async sendNotification(notification: { title: string; body: string }): Promise<void> {
    // In a real implementation, this would use a notification API (e.g., Web Notifications, or in-app toast)
    console.log(`[NOTIFIER] ${notification.title}: ${notification.body}`);
    // We'll return the notification so the calling code can handle it (e.g., display in UI)
    return Promise.resolve();
  }
}