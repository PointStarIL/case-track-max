
export type CaseStatus = 
  | "new" 
  | "pending" 
  | "in_progress" 
  | "awaiting_response" 
  | "awaiting_hearing"
  | "closed"
  | "won"
  | "lost"
  | "settled";

export interface Task {
  id: string;
  caseId: string;
  title: string;
  description?: string;
  dueDate?: Date;
  completed: boolean;
  createdAt: Date;
}

export interface Case {
  id: string;
  caseNumber: string;
  courtCaseNumber: string; 
  description: string;
  clientName: string;
  openDate: Date;
  opponent: string;
  status: CaseStatus;
  nextHearingDate?: Date;
  tasks: Task[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CaseFormData {
  caseNumber: string;
  courtCaseNumber: string;
  description: string;
  clientName: string;
  openDate: string; // Format: YYYY-MM-DD
  opponent: string;
  status: CaseStatus;
  nextHearingDate?: string; // Format: YYYY-MM-DD
}

export interface TaskFormData {
  title: string;
  description?: string;
  dueDate?: string; // Format: YYYY-MM-DD
}
