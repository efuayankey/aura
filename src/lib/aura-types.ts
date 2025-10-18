export interface NavItem {
  id: string;
  label: string;
  icon: string;
  onClick: () => void;
}

export interface DashboardCardData {
  id: string;
  title: string;
  emoji: string;
  subtitle: string;
  items: string[];
  suggestionText: string;
}

export interface CardItem {
  id: string;
  text: string;
}
