import { AgentBase } from "./AgentBase";
import { UserStats, UserProfile } from "../types";

export interface BookMasteryContext {
  stats: UserStats;
  profile: UserProfile;
  // maybe current reading list
}

export class BookMasteryAgent extends AgentBase {
  constructor() {
    super("BOOK_MASTERY");
  }

  /**
   * Generate a reading plan or book mastery advice.
   * @param userMessage - The user's message.
   * @param context - Current state.
   * @returns Response content and reasoning.
   */
  async generateBookAdvice(
    userMessage: string,
    context: BookMasteryContext
  ): Promise<{ content: string }> {
    const systemInstruction = `
You are the BOOK_MASTERY agent. You focus EXCLUSIVELY on reading comprehension, knowledge extraction, application of learned concepts, and mastery of subjects through books. Your advice should be based on proven learning techniques (e.g., active recall, spaced repetition, Feynman technique) and tailored to the Operator's goals and learning style.

When providing advice:
1. Tailor recommendations to the Operator's current intelligence, learning style, and goals.
2. Be specific: suggest books, reading schedules, note-taking methods, and application exercises.
3. Address the user as 'Operator'.
4. If the request is about a specific subject or skill, focus on that.
5. Consider any barriers mentioned in the profile (e.g., time constraints, distractions).
`;

    return this.generateResponse(
      systemInstruction,
      userMessage,
      {
        stats: context.stats,
        profile: context.profile,
      },
      { temperature: 0.7, max_tokens: 1024 }
    );
  }

  /**
   * Suggest intelligence update based on book mastery activities.
   * @param activity - Description of the reading/mastery activity completed.
   * @param context - Current state.
   * @returns Suggested intelligence update.
   */
  async suggestIntelligenceFromBookActivity(
    activity: string,
    context: BookMasteryContext
  ): Promise<{ intelligence?: number; reasoning: string }> {
    const systemInstruction = `
You are the BOOK_MASTERY agent. Based on the book-related activity completed by the Operator, suggest an appropriate increase to their intelligence stat. Consider the depth of material, time spent, and application of knowledge.

Return a JSON object with an optional intelligence increase (number) and a reasoning string.
Example: { "intelligence": 4, "reasoning": "Completed reading and applying concepts from 'Deep Work' by Cal Newport, including note-taking and implementing the strategies." }
`;

    const { content } = await this.generateResponse(
      systemInstruction,
      `Book mastery activity completed: "${activity}"`,
      {
        stats: context.stats,
        profile: context.profile,
      },
      { temperature: 0.5, max_tokens: 256 }
    );

    try {
      const parsed = JSON.parse(content);
      return {
        intelligence: parsed.intelligence,
        reasoning: parsed.reasoning || "No reasoning provided.",
      };
    } catch (e) {
      return { intelligence: undefined, reasoning: "Failed to parse intelligence update from book activity." };
    }
  }

  /**
   * Generate a reading quest based on the Operator's profile and goals.
   * @param context - Current state.
   * @returns A quest focused on reading/book mastery.
   */
  async generateReadingQuest(
    context: BookMasteryContext
  ): Promise<any> { // We'll return an EnhancedQuest-like object
    const systemInstruction = `
You are the BOOK_MASTERY agent. Generate a quest that encourages the Operator to engage in book mastery activities aligned with their goals and current stats.

The quest should have:
- title: Engaging title
- description: What the quest entails (reading, note-taking, application)
- category: "mental"
- difficulty: Number 1-100
- rewardExp: Experience points
- rewardStatPoints: Stat points (likely for intelligence)
- statAffected: "intelligence" or "multiple"
- timeLimit: Optional time in minutes
- expiresAt: Optional expiration

Consider the Operator's:
- Current stats: ${JSON.stringify(context.stats)}
- Profile: ${JSON.stringify(context.profile)}
`;

    const { content } = await this.generateResponse(
      systemInstruction,
      `Generate a book mastery quest for the Operator.`,
      {
        stats: context.stats,
        profile: context.profile,
      },
      { temperature: 0.8, max_tokens: 1024 }
    );

    let questData: any;
    try {
      questData = JSON.parse(content);
    } catch (e) {
      questData = {
        title: "Book Mastery Quest",
        description: "Read a chapter from a relevant book and apply one concept.",
        category: "mental",
        difficulty: 60,
        rewardExp: 150,
        rewardStatPoints: 2,
        statAffected: "intelligence",
      };
    }

    // Return a quest-like object (the system will convert to EnhancedQuest)
    return {
      id: `book_quest_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      title: questData.title || "Book Mastery Quest",
      description: questData.description || "Engage in book mastery activities.",
      category: questData.category || "mental",
      difficulty: questData.difficulty ?? 60,
      rewardExp: questData.rewardExp ?? 150,
      rewardStatPoints: questData.rewardStatPoints ?? 2,
      statAffected: questData.statAffected || "intelligence",
      timeLimit: questData.timeLimit,
      expiresAt: questData.expiresAt,
      completed: false,
      failed: false,
    };
  }

  async generateBookQuiz(bookTitle: string, bookAuthor: string): Promise<{ question: string; options: string[]; correctIndex: number }[]> {
    const systemInstruction = `
You are the BOOK_MASTERY agent. Generate a 3-question quiz for the specified book to test comprehension.
Each question must have 4 options with exactly one correct answer.
Return a JSON array of objects with: question (string), options (string[4]), correctIndex (number 0-3).
Make questions specific enough that someone who hasn't read the book cannot guess easily.
Focus on key concepts, themes, and practical takeaways from the book.`;

    const { content } = await this.generateResponse(
      systemInstruction,
      `Generate a comprehension quiz for the book "${bookTitle}" by ${bookAuthor}.`,
      {},
      { temperature: 0.7, max_tokens: 1024 }
    );

    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const questions = JSON.parse(jsonMatch[0]);
        if (Array.isArray(questions) && questions.length >= 2) return questions;
      }
    } catch (e) {
      console.error('Failed to parse quiz JSON:', e);
    }

    return [
      { question: `What is a key concept from "${bookTitle}"?`, options: ['Discipline', 'Talent', 'Luck', 'Genetics'], correctIndex: 0 },
      { question: `How does the author of "${bookTitle}" suggest applying its lessons?`, options: ['Daily practice', 'Occasional review', 'Passive reading', 'Memorization'], correctIndex: 0 },
      { question: `What is the main takeaway from "${bookTitle}"?`, options: ['Consistency over intensity', 'Work harder', 'Find shortcuts', 'Wait for inspiration'], correctIndex: 0 },
    ];
  }
}