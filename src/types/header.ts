export interface HeaderProps {
  activeTab?: string;
  onToggleSidebar?: () => void;
  isIndividualChat?: boolean;
  onSetMessageTimer?: (time: number) => void;
  currentTimer?: number;
} 