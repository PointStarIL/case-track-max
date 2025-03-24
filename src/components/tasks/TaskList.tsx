
import React, { useState } from 'react';
import { useCasesStore } from '@/store/casesStore';
import { Task } from '@/types/case';
import { formatDistanceToNow } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Calendar, Check, Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { TaskForm } from './TaskForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';

interface TaskListProps {
  caseId: string;
}

export function TaskList({ caseId }: TaskListProps) {
  const { getCaseById, toggleTaskCompletion, deleteTask } = useCasesStore();
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  
  const caseData = getCaseById(caseId);
  
  if (!caseData) {
    return <div>Case not found</div>;
  }
  
  const { tasks } = caseData;
  
  // Sort tasks: incomplete first, then by due date
  const sortedTasks = [...tasks].sort((a, b) => {
    // First sort by completion status
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    
    // Then sort by due date if both have due dates
    if (a.dueDate && b.dueDate) {
      return a.dueDate.getTime() - b.dueDate.getTime();
    }
    
    // Tasks with due dates come before tasks without due dates
    if (a.dueDate && !b.dueDate) return -1;
    if (!a.dueDate && b.dueDate) return 1;
    
    // Finally sort by creation date
    return a.createdAt.getTime() - b.createdAt.getTime();
  });
  
  const handleToggleTask = (taskId: string) => {
    toggleTaskCompletion(caseId, taskId);
  };
  
  const handleDeleteTask = (taskId: string) => {
    deleteTask(caseId, taskId);
    toast.success('Task deleted successfully');
  };
  
  const handleEditTask = (taskId: string) => {
    setEditingTaskId(taskId);
  };
  
  const handleCompleteEdit = () => {
    setEditingTaskId(null);
  };
  
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center border rounded-lg">
        <Check className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No tasks yet</h3>
        <p className="text-muted-foreground">
          Add your first task for this case
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {sortedTasks.map((task) => (
        <div key={task.id}>
          {editingTaskId === task.id ? (
            <div className="glass-card p-4 rounded-lg animate-scale-in">
              <TaskForm 
                caseId={caseId}
                taskId={task.id}
                editMode={true}
                onComplete={handleCompleteEdit}
              />
            </div>
          ) : (
            <div 
              className={`glass-card p-4 rounded-lg flex items-start gap-3 ${
                task.completed ? 'opacity-60' : ''
              }`}
            >
              <Checkbox 
                checked={task.completed}
                onCheckedChange={() => handleToggleTask(task.id)}
                className="mt-1"
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {task.title}
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    {task.dueDate && (
                      <Badge 
                        variant="outline"
                        className={`
                          flex items-center gap-1 bg-background
                          ${!task.completed && new Date() > task.dueDate ? 'border-red-500 text-red-500' : ''}
                        `}
                      >
                        <Calendar className="h-3 w-3" />
                        {task.dueDate.toLocaleDateString()}
                      </Badge>
                    )}
                    
                    <div className="flex items-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditTask(task.id)}
                        className="h-8 w-8"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="glass-effect">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this task?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteTask(task.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
                
                {task.description && (
                  <div className={`text-sm mt-1 ${task.completed ? 'text-muted-foreground line-through' : ''}`}>
                    {task.description}
                  </div>
                )}
                
                <div className="text-xs text-muted-foreground mt-2">
                  Created {formatDistanceToNow(task.createdAt, { addSuffix: true })}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
