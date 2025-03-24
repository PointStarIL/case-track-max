
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { TaskFormData } from '@/types/case';
import { useCasesStore } from '@/store/casesStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { toast } from 'sonner';

const formSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  description: z.string().optional(),
  dueDate: z.string().optional(),
});

interface TaskFormProps {
  caseId: string;
  taskId?: string;
  editMode?: boolean;
  onComplete: () => void;
}

export function TaskForm({ caseId, taskId, editMode = false, onComplete }: TaskFormProps) {
  const { addTask, updateTask, getCaseById } = useCasesStore();
  
  // Get case data
  const caseData = getCaseById(caseId);
  
  // Get task data if in edit mode
  const taskData = editMode && taskId && caseData 
    ? caseData.tasks.find(t => t.id === taskId) 
    : undefined;
  
  // Initialize form
  const form = useForm<TaskFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: editMode && taskData 
      ? {
          title: taskData.title,
          description: taskData.description,
          dueDate: taskData.dueDate ? taskData.dueDate.toISOString().split('T')[0] : undefined,
        }
      : {
          title: '',
          description: '',
          dueDate: '',
        },
  });

  const onSubmit = (data: TaskFormData) => {
    if (editMode && taskId) {
      updateTask(caseId, taskId, data);
      toast.success('Task updated successfully');
    } else {
      addTask(caseId, data);
      toast.success('Task added successfully');
    }
    onComplete();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter task title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter task description" 
                  className="resize-none min-h-20"
                  {...field} 
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Due Date (Optional)</FormLabel>
              <FormControl>
                <Input 
                  type="date" 
                  {...field} 
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onComplete}
          >
            Cancel
          </Button>
          <Button type="submit">
            {editMode ? 'Update Task' : 'Add Task'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
