export interface Task {
  id: string;
  name: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: number; // in minutes
  completed: boolean;
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
}