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

    // Expecting a JSON object with title and body. Falls back to a generic
    // notification if parsing fails (or model wraps it in ```json fences).
    let notification: { title: string; body: string } = AgentBase.parseJson(
      content,
      {
        title: "NEXUS Notification",
        body: "System update available. Check your dashboard for details.",
      },
    );

    return notification;
  }

  /**
   * Send a notification (in a real app, this would interface with a notification service).
   * For now, we'll just log it or return it for the UI to handle.
   * @param notification - The notification object.
   */
  // NOTE: This method is intentionally a no-op. Notification display is handled
  // by the UI layer (NotificationToast). This method only logs for debugging.
  async sendNotification(notification: { title: string; body: string }): Promise<void> {
    console.log(`[NOTIFIER] ${notification.title}: ${notification.body}`);
    return Promise.resolve();
  }
}