import { AgentOrchestrator } from "./agents/AgentOrchestrator";
import { UserStats, UserProfile } from "./types";

// Example usage of the agentic workflow
async function exampleUsage() {
  // Initialize the orchestrator
  const orchestrator = new AgentOrchestrator();
  await orchestrator.initialize();

  // Example state (in a real app, this would come from React context or state)
  const exampleStats: UserStats = {
    strength: 65,
    intelligence: 78,
    agility: 52,
    vitality: 70,
    willpower: 60,
    social: 45,
  };

  const exampleProfile: UserProfile = {
    name: "Alex",
    primaryGoal: "Improve overall fitness and mental clarity",
    secondaryGoals: ["Increase strength to 80", "Read 30 minutes daily"],
    fitnessExperience: "intermediate",
    learningStyle: "visual",
    emotionalState: "motivated",
    barriers: ["Limited time for workouts", "Occasional procrastination"],
    scheduleNotes: "Can work out Mondays, Wednesdays, Fridays evenings",
    preferences: ["weight training", "HIIT", "podcasts while learning"],
    wellnessFocus: ["cardio", "flexibility", "mindfulness"],
    accountabilityNeeds: "Weekly check-ins with progress tracking",
  };

  const exampleQuests: any[] = []; // Simplified
  const exampleEnhancedQuests: any[] = [];
  const exampleTasks: any[] = [];

  const context = {
    stats: exampleStats,
    profile: exampleProfile,
    quests: exampleQuests,
    enhancedQuests: exampleEnhancedQuests,
    tasks: exampleTasks,
    // Optional history
    statsHistory: [], // For ProgressTracker
    statsHistoryByStat: { // For StatsMonitor
      strength: [],
      intelligence: [],
      agility: [],
      vitality: [],
      willpower: [],
      social: [],
    },
    questsHistory: [],
    level: 5,
    exp: 1200,
    expToNextLevel: 1800,
  };

  // Example 1: Process a user message through the orchestrator (main chatbot)
  const userMessage = "I want to start a workout routine to build strength but I only have 30 minutes a day.";
  const response = await orchestrator.processUserMessage(userMessage, context);
  console.log("Orchestrator Response:", response);

  // Example 2: Get specific workout advice
  const workoutAdvice = await orchestrator.getWorkoutAdvice(
    "What's a good 30-minute strength training routine for beginners?",
    context
  );
  console.log("Workout Advice:", workoutAdvice);

  // Example 3: Generate a daily quest
  const dailyQuest = await orchestrator.generateQuest("daily", context);
  console.log("Generated Daily Quest:", dailyQuest);

  // Example 4: Analyze stats and get suggestions
  const statsAnalysis = await orchestrator.analyzeStats(context);
  console.log("Stats Analysis:", statsAnalysis.content);
  if (statsAnalysis.suggestedUpdates) {
    console.log("Suggested Stat Updates:", statsAnalysis.suggestedUpdates);
  }

  // Example 5: Get HexGraph data for updating the visualization
  const hexGraphData = await orchestrator.getHexGraphData(context);
  console.log("HexGraph Data:", hexGraphData);

  // Example 6: Analyze progress over time
  const progressAnalysis = await orchestrator.analyzeProgress(context);
  console.log("Progress Analysis:", progressAnalysis);

  // Example 7: Generate a motivation message
  const motivation = await orchestrator.generateMotivation(context, "morning");
  console.log("Motivation:", motivation);
}

// Run the example if this file is executed directly
if (require.main === module) {
  exampleUsage().catch(console.error);
}