export interface Task {
  id: string;
  name: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: number; // in minutes
  completed: boolean;
  status?: 'completed' | 'skipped' | 'rescheduled' | 'pending';
  completedAt?: Date;
  rescheduledFrom?: Date;
}

export interface UserInput {
  tasks: Task[];
  startTime: string;
  endTime: string;
  mood: 'energized' | 'balanced' | 'tired' | 'stressed';
  energy: number; // 1-10 scale
}

export interface ScheduleItem {
  id: string;
  taskId: string;
  startTime: string;
  endTime: string;
  type: 'work' | 'break' | 'wellness';
  title: string;
  description?: string;
}

export interface BalanceScore {
  overall: number; // 0-100
  productivity: number;
  wellness: number;
  consistency: number;
  points?: number;
  streak?: number;
  level?: number;
}

export interface TaskAction {
  type: 'complete' | 'skip' | 'reschedule';
  taskId: string;
  timestamp: Date;
  points: number;
  reason?: string;
}

export interface GameStats {
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  level: number;
  achievements: Achievement[];
  taskActions: TaskAction[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  requirements: {
    type: 'streak' | 'points' | 'completion_rate' | 'wellness_balance';
    target: number;
  };
}

export interface AIsuggestion {
  id: string;
  message: string;
  type: 'motivation' | 'adjustment' | 'wellness' | 'productivity';
  actionSuggestion?: {
    type: 'reschedule' | 'break' | 'split_task' | 'swap_tasks';
    data?: any;
  };
}