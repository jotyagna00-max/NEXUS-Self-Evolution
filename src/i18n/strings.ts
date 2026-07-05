/**
 * R-09 — bilingual UI string catalog.
 *
 * One source of truth for every user-visible string. To add a new language:
 *   1. Add a key here
 *   2. Add translations under each language
 *   3. Wrap the UI in t('key')
 *
 * Japanese uses tactical / HUD register — appropriate to the NEXUS aesthetic.
 * Honorifics are applied to Manager voice references only (already handled in
 * services/agentService.ts via the archetype voice block).
 */

export type Language = 'en' | 'ja';

export const STRINGS: Record<Language, Record<string, string>> = {
  en: {
    // Top-level navigation (tabs)
    'tab.overview':    'Overview',
    'tab.trainer':     'AI Coach',
    'tab.training':    'Training',
    'tab.quests':      'Quests',
    'tab.story':       'Story',
    'tab.debrief':     'Review',
    'tab.books':       'Books',
    'tab.habits':      'Habits',
    'tab.store':       'Store',
    'tab.feedback':    'Feedback',
    'tab.changelog':   'Changelog',

    // Header
    'header.systemAccess': 'Menu',
    'header.neuralInterface': 'Profile',
    'header.manager':     'Coach',
    'header.operatorFallback': 'Your Name',
    'header.neuralSync':  'AI Status',
    'header.securityLevel': 'Rank',
    'header.coreTemp':    'Status',

    // Menu overlay
    'menu.main':          'Main Menu',
    'menu.checkUpdate':   'Check for Update',
    'menu.checking':      'Checking...',

    // Common buttons
    'btn.addProtocol':    'Add Routine',
    'btn.logSession':     'Log Session',
    'btn.logging':        'Saving...',
    'btn.logReadSession': 'Log Reading',
    'btn.mastered':       'Mastered',
    'btn.refresh':        'Refresh',
    'btn.acknowledge':    'Got it',
    'btn.save':           'Save',
    'btn.cancel':         'Cancel',
    'btn.continue':       'Continue',
    'btn.viewChangelog':  'View full changelog',

    // Notifications
    'notif.effortLogged.title': 'Session Logged',
    'notif.effortLogged.desc':  '{title} · +{gain} {stat} · Stats updated',
    'notif.restTokenSpent.title': 'Rest Day Used',
    'notif.restTokenSpent.desc':  'Today is logged as rest. Streak window intact.',
    'notif.levelUp.title': 'Level Up! Now Level {level}',
    'notif.updateAvailable': 'Update v{version} Available',
    'notif.upToDate': 'Up to Date',
    'notif.updateFailed': 'Update Check Failed',

    // Trainer / Manager copy
    'trainer.greeting.fallback': '{name}. Sit. We have work to do.',

    // Story Archive
    'story.subtitle':     'Story',
    'story.title':        'Story Archive',
    'story.progress':     '{read} / {total} chapters read',
    'story.locked':       'Locked. Requires Level {level}',
    'story.transcribed':  'Read',

    // Mission Debrief
    'debrief.subtitle':   'Daily Review',
    'debrief.title':      'Daily Review',
    'debrief.progress':   '{done} / {total} efforts logged today',
    'debrief.manager':    'Coach',
    'debrief.ackLabel':   'Acknowledged',
    'debrief.cleared':    'Rest Day',
    'debrief.push':       'Push Day',
    'debrief.wake':       'Wake Up',
    'debrief.complete':   'Review Logged',

    // Calendar Heatmap
    'heatmap.title':      'Effort Heatmap',
    'heatmap.activeDays': 'Active Days',
    'heatmap.exp28d':     'EXP · 28d',
    'heatmap.credits28d': 'Credits · 28d',
    'heatmap.theme':      'Theme',
    'heatmap.range':      'Last 28 days',

    // Changelog
    'changelog.title':    'Changelog',
    'changelog.latest':   'Latest',
    'changelog.download': 'Download latest build',
    'changelog.fallback': 'Update server unreachable. Showing bundled changelog.',

    // Consistency
    'consistency.title':  'Consistency',
    'consistency.run':    'Run',
    'consistency.best':   'Best',
    'consistency.recoveries': 'Recoveries',
    'consistency.window.alive': 'Streak window alive · {count}/7 active',
    'consistency.window.risk':  'Window at risk · {count}/7 active — log today or spend a token',
    'consistency.3of7':   '3-of-7',
    'consistency.spendToken':  'Spend Rest Token',
    'consistency.spendHelp':   'Mark today as rest. Streak window stays alive.',
    'consistency.copy.high': "Excellent consistency. You're building identity.",
    'consistency.copy.mid': 'Good rhythm. Three of seven keeps the window alive.',
    'consistency.copy.tokens': '{n} rest token{s} remaining this week. Spend them when you need to recover.',
    'consistency.copy.low': 'Every day is a fresh start. One task is enough.',

    // Profile
    'profile.title':      'Configure Profile',
    'profile.archetypes': 'Coach Persona',
    'profile.save':       'Save Profile',

    // Feedback / export
    'feedback.title':     'Feedback',
    'feedback.transmitting': 'Sending...',
    'feedback.transmit':  'Send Feedback',
    'feedback.export.full': 'Export Full Backup',
    'feedback.export.csv': 'Export CSV',
    'feedback.export.section': 'Export {label}',
    'feedback.import.btn': 'Import Backup',
    'feedback.import.success': 'Imported {n} keys. Reloading…',
    'baseline.title': 'Daily Baseline',
    'baseline.fixed': 'Fixed Mode',
    'baseline.custom': 'Custom Mode',
    'baseline.complete': 'Baseline Complete',
    'baseline.addTask': 'Add Custom Task',
  },

  ja: {
    // Top-level navigation
    'tab.overview':    'システム概要',
    'tab.trainer':     'AI トレーナー',
    'tab.training':    '進化プロトコル',
    'tab.quests':      '運命の任務',
    'tab.story':       'ストーリー記録',
    'tab.debrief':     '作戦報告',
    'tab.books':       '読書修練',
    'tab.habits':      '習慣研究所',
    'tab.store':       'ネクサス商店',
    'tab.feedback':    'システム通信',
    'tab.changelog':   '更新履歴',

    // Header
    'header.systemAccess': 'システム起動',
    'header.neuralInterface': '神経接続',
    'header.manager':     '指令官',
    'header.operatorFallback': 'オペレーター・ネクサス',
    'header.neuralSync':  '同期状態',
    'header.securityLevel': '防壁レベル',
    'header.coreTemp':    '中枢温度',

    // Menu overlay
    'menu.main':          'メインメニュー',
    'menu.checkUpdate':   '更新を確認',
    'menu.checking':      '確認中…',

    // Common buttons
    'btn.addProtocol':    'プロトコル追加',
    'btn.logSession':     '訓練を記録',
    'btn.logging':        '記録中…',
    'btn.logReadSession': '読書を記録',
    'btn.mastered':       '修得済',
    'btn.refresh':        '更新',
    'btn.acknowledge':    '確認',
    'btn.save':           '保存',
    'btn.cancel':         '取消',
    'btn.continue':       '続行',
    'btn.viewChangelog':  '完全な更新履歴を見る',

    // Notifications
    'notif.effortLogged.title': '努力を記錄',
    'notif.effortLogged.desc':  '{title} · {stat} +{gain} · 鏡が更新されました',
    'notif.restTokenSpent.title': '休息トークンを使用',
    'notif.restTokenSpent.desc':  '本日は休息として記録。連続記録の窓は維持されます。',
    'notif.levelUp.title': 'レベルアップ！レベル {level}',
    'notif.updateAvailable': '更新 v{version} が利用可能',
    'notif.upToDate': '最新版です',
    'notif.updateFailed': '更新の確認に失敗',

    // Trainer / Manager
    'trainer.greeting.fallback': '{name}殿。座り給え。仕事がある。',

    // Story Archive
    'story.subtitle':     'オペレーター年代記',
    'story.title':        'ストーリー記録',
    'story.progress':     '{read} / {total} 章を記録済',
    'story.locked':       '封印中。レベル {level} が必要',
    'story.transcribed':  '記録済',

    // Mission Debrief
    'debrief.subtitle':   '日終報告',
    'debrief.title':      '作戦報告',
    'debrief.progress':   '{done} / {total} 努力を記録',
    'debrief.manager':    '指令官',
    'debrief.ackLabel':   '確認済',
    'debrief.cleared':    '完了',
    'debrief.push':       '推進',
    'debrief.wake':       '覚醒',
    'debrief.complete':   '報告を記録',

    // Calendar Heatmap
    'heatmap.title':      '努力の熱図',
    'heatmap.activeDays': '活動日数',
    'heatmap.exp28d':     'EXP・28日',
    'heatmap.credits28d': 'NC・28日',
    'heatmap.theme':      '基調色',
    'heatmap.range':      '直近28日間',

    // Changelog
    'changelog.title':    '更新履歴',
    'changelog.latest':   '最新',
    'changelog.download': '最新ビルドをダウンロード',
    'changelog.fallback': '更新サーバーに接続できません。内蔵履歴を表示中。',

    // Consistency
    'consistency.title':  '継続性',
    'consistency.run':    '連続',
    'consistency.best':   '最長',
    'consistency.recoveries': '回復',
    'consistency.window.alive': '継続窓は有効 · {count}/7 活動',
    'consistency.window.risk':  '窓が危険 · {count}/7 活動 — 記録せよ',
    'consistency.3of7':   '3/7',
    'consistency.spendToken':  '休息トークンを使用',
    'consistency.spendHelp':   '本日を休息として記録。窓は維持される。',
    'consistency.copy.high': '見事な継続。Identity が築かれている。',
    'consistency.copy.mid': '良いリズム。七日のうち三日で窓は維持される。',
    'consistency.copy.tokens': '今週残り {n} トークン。必要な時に使え。',
    'consistency.copy.low': '毎日が新たな始まり。一つで十分。',

    // Profile
    'profile.title':      'プロファイル設定',
    'profile.archetypes': '指令官アーキタイプ',
    'profile.save':       'プロファイル保存',

    // Feedback / export
    'feedback.title':     '直接通信',
    'feedback.transmitting': '送信中…',
    'feedback.transmit':  '送信を開始',
    'feedback.export.full': '完全バックアップを書き出す',
    'feedback.export.csv': 'CSV を書き出す',
    'feedback.export.section': '{label} を書き出す',
    'feedback.import.btn': 'バックアップを読込む',
    'feedback.import.success': '{n} 件を読込。再起動中…',
    'baseline.title': '日次ベースライン',
    'baseline.fixed': '固定モード',
    'baseline.custom': 'カスタムモード',
    'baseline.complete': 'ベースライン完了',
    'baseline.addTask': 'カスタムタスク追加',
  },
};

/**
 * Look up a string for the current language. Falls back to English if the
 * key is missing in the target language. Supports simple `{name}` tokens.
 */
export function t(language: Language, key: string, vars?: Record<string, string | number>): string {
  const raw = STRINGS[language]?.[key] ?? STRINGS.en[key] ?? key;
  if (!vars) return raw;
  return Object.entries(vars).reduce((acc, [k, v]) => acc.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v)), raw);
}