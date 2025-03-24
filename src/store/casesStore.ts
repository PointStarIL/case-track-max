
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Case, CaseFormData, CaseStatus, Task, TaskFormData } from '@/types/case';

interface CasesState {
  cases: Case[];
  isLoading: boolean;
  error: string | null;
  
  // Case operations
  addCase: (caseData: CaseFormData) => void;
  updateCase: (id: string, caseData: Partial<CaseFormData>) => void;
  deleteCase: (id: string) => void;
  getCaseById: (id: string) => Case | undefined;
  
  // Task operations
  addTask: (caseId: string, taskData: TaskFormData) => void;
  updateTask: (caseId: string, taskId: string, taskData: Partial<TaskFormData>) => void;
  toggleTaskCompletion: (caseId: string, taskId: string) => void;
  deleteTask: (caseId: string, taskId: string) => void;
  
  // Zapier integration
  setWebhookUrl: (url: string) => void;
  getWebhookUrl: () => string;
  
  // Utility function for exporting data
  exportData: () => string;
  importData: (jsonData: string) => void;
}

export const useCasesStore = create<CasesState>()(
  persist(
    (set, get) => ({
      cases: [],
      isLoading: false,
      error: null,
      webhookUrl: '',
      
      addCase: (caseData: CaseFormData) => {
        const newCase: Case = {
          id: uuidv4(),
          ...caseData,
          openDate: new Date(caseData.openDate),
          nextHearingDate: caseData.nextHearingDate ? new Date(caseData.nextHearingDate) : undefined,
          tasks: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        set((state) => ({ 
          cases: [...state.cases, newCase],
        }));
        
        // Try to trigger webhook if available
        const webhookUrl = get().getWebhookUrl();
        if (webhookUrl) {
          fetch(webhookUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'case_created',
              caseId: newCase.id,
              caseNumber: newCase.caseNumber,
              clientName: newCase.clientName,
              timestamp: new Date().toISOString()
            })
          }).catch(error => console.error('Failed to trigger webhook:', error));
        }
      },
      
      updateCase: (id: string, caseData: Partial<CaseFormData>) => {
        set((state) => ({
          cases: state.cases.map((c) => {
            if (c.id === id) {
              const updatedCase = {
                ...c,
                ...caseData,
                openDate: caseData.openDate ? new Date(caseData.openDate) : c.openDate,
                nextHearingDate: caseData.nextHearingDate 
                  ? new Date(caseData.nextHearingDate) 
                  : c.nextHearingDate,
                updatedAt: new Date(),
              };
              
              // Try to trigger webhook if available
              const webhookUrl = get().getWebhookUrl();
              if (webhookUrl) {
                fetch(webhookUrl, {
                  method: 'POST',
                  mode: 'no-cors',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    action: 'case_updated',
                    caseId: updatedCase.id,
                    caseNumber: updatedCase.caseNumber,
                    clientName: updatedCase.clientName,
                    timestamp: new Date().toISOString()
                  })
                }).catch(error => console.error('Failed to trigger webhook:', error));
              }
              
              return updatedCase;
            }
            return c;
          }),
        }));
      },
      
      deleteCase: (id: string) => {
        // Get case before deletion for webhook
        const caseToDelete = get().getCaseById(id);
        
        set((state) => ({
          cases: state.cases.filter((c) => c.id !== id),
        }));
        
        // Try to trigger webhook if available
        if (caseToDelete) {
          const webhookUrl = get().getWebhookUrl();
          if (webhookUrl) {
            fetch(webhookUrl, {
              method: 'POST',
              mode: 'no-cors',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'case_deleted',
                caseId: caseToDelete.id,
                caseNumber: caseToDelete.caseNumber,
                clientName: caseToDelete.clientName,
                timestamp: new Date().toISOString()
              })
            }).catch(error => console.error('Failed to trigger webhook:', error));
          }
        }
      },
      
      getCaseById: (id: string) => {
        return get().cases.find((c) => c.id === id);
      },
      
      addTask: (caseId: string, taskData: TaskFormData) => {
        const newTask: Task = {
          id: uuidv4(),
          caseId,
          title: taskData.title,
          description: taskData.description,
          dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
          completed: false,
          createdAt: new Date(),
        };
        
        set((state) => ({
          cases: state.cases.map((c) => {
            if (c.id === caseId) {
              const updatedCase = {
                ...c,
                tasks: [...c.tasks, newTask],
                updatedAt: new Date(),
              };
              
              // Try to trigger webhook if available
              const webhookUrl = get().getWebhookUrl();
              if (webhookUrl) {
                fetch(webhookUrl, {
                  method: 'POST',
                  mode: 'no-cors',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    action: 'task_created',
                    caseId: updatedCase.id,
                    caseNumber: updatedCase.caseNumber,
                    taskId: newTask.id,
                    taskTitle: newTask.title,
                    timestamp: new Date().toISOString()
                  })
                }).catch(error => console.error('Failed to trigger webhook:', error));
              }
              
              return updatedCase;
            }
            return c;
          }),
        }));
      },
      
      updateTask: (caseId: string, taskId: string, taskData: Partial<TaskFormData>) => {
        set((state) => ({
          cases: state.cases.map((c) => {
            if (c.id === caseId) {
              const updatedTasks = c.tasks.map((t) => {
                if (t.id === taskId) {
                  return {
                    ...t,
                    ...taskData,
                    dueDate: taskData.dueDate ? new Date(taskData.dueDate) : t.dueDate,
                  };
                }
                return t;
              });
              
              return {
                ...c,
                tasks: updatedTasks,
                updatedAt: new Date(),
              };
            }
            return c;
          }),
        }));
      },
      
      toggleTaskCompletion: (caseId: string, taskId: string) => {
        set((state) => ({
          cases: state.cases.map((c) => {
            if (c.id === caseId) {
              const updatedTasks = c.tasks.map((t) => {
                if (t.id === taskId) {
                  const completed = !t.completed;
                  
                  // Try to trigger webhook if available
                  const webhookUrl = get().getWebhookUrl();
                  if (webhookUrl) {
                    fetch(webhookUrl, {
                      method: 'POST',
                      mode: 'no-cors',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        action: completed ? 'task_completed' : 'task_reopened',
                        caseId: c.id,
                        caseNumber: c.caseNumber,
                        taskId: t.id,
                        taskTitle: t.title,
                        timestamp: new Date().toISOString()
                      })
                    }).catch(error => console.error('Failed to trigger webhook:', error));
                  }
                  
                  return {
                    ...t,
                    completed,
                  };
                }
                return t;
              });
              
              return {
                ...c,
                tasks: updatedTasks,
                updatedAt: new Date(),
              };
            }
            return c;
          }),
        }));
      },
      
      deleteTask: (caseId: string, taskId: string) => {
        set((state) => ({
          cases: state.cases.map((c) => {
            if (c.id === caseId) {
              return {
                ...c,
                tasks: c.tasks.filter((t) => t.id !== taskId),
                updatedAt: new Date(),
              };
            }
            return c;
          }),
        }));
      },
      
      setWebhookUrl: (url: string) => {
        localStorage.setItem('zapier-webhook-url', url);
      },
      
      getWebhookUrl: () => {
        return localStorage.getItem('zapier-webhook-url') || '';
      },
      
      exportData: () => {
        return JSON.stringify(get().cases, null, 2);
      },
      
      importData: (jsonData: string) => {
        try {
          const importedCases = JSON.parse(jsonData);
          if (Array.isArray(importedCases)) {
            // Convert string dates back to Date objects
            const processedCases = importedCases.map(c => ({
              ...c,
              openDate: new Date(c.openDate),
              nextHearingDate: c.nextHearingDate ? new Date(c.nextHearingDate) : undefined,
              createdAt: new Date(c.createdAt),
              updatedAt: new Date(c.updatedAt),
              tasks: c.tasks.map((t: any) => ({
                ...t,
                dueDate: t.dueDate ? new Date(t.dueDate) : undefined,
                createdAt: new Date(t.createdAt),
              })),
            }));
            
            set({ cases: processedCases });
          } else {
            throw new Error('Imported data is not an array');
          }
        } catch (error) {
          console.error('Failed to import data:', error);
          set({ error: 'Failed to import data. Invalid JSON format.' });
        }
      },
    }),
    {
      name: 'case-management-storage', // name for the localStorage key
    }
  )
);
