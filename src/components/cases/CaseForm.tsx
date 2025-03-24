
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { CaseFormData, CaseStatus } from '@/types/case';
import { useCasesStore } from '@/store/casesStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';

const caseStatusOptions: { value: CaseStatus; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'awaiting_response', label: 'Awaiting Response' },
  { value: 'awaiting_hearing', label: 'Awaiting Hearing' },
  { value: 'closed', label: 'Closed' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
  { value: 'settled', label: 'Settled' },
];

const formSchema = z.object({
  caseNumber: z.string().min(1, { message: 'Case number is required' }),
  courtCaseNumber: z.string().min(1, { message: 'Court case number is required' }),
  description: z.string().min(1, { message: 'Description is required' }),
  clientName: z.string().min(1, { message: 'Client name is required' }),
  openDate: z.string().min(1, { message: 'Open date is required' }),
  opponent: z.string().min(1, { message: 'Opponent is required' }),
  status: z.enum(['new', 'pending', 'in_progress', 'awaiting_response', 
    'awaiting_hearing', 'closed', 'won', 'lost', 'settled']),
  nextHearingDate: z.string().optional(),
});

interface CaseFormProps {
  editMode?: boolean;
  caseId?: string;
}

export function CaseForm({ editMode = false, caseId }: CaseFormProps) {
  const navigate = useNavigate();
  const { addCase, updateCase, getCaseById } = useCasesStore();

  // If in edit mode, get the case data
  const caseData = editMode && caseId ? getCaseById(caseId) : undefined;

  // Initialize form
  const form = useForm<CaseFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: editMode && caseData 
      ? {
          caseNumber: caseData.caseNumber,
          courtCaseNumber: caseData.courtCaseNumber,
          description: caseData.description,
          clientName: caseData.clientName,
          openDate: caseData.openDate.toISOString().split('T')[0],
          opponent: caseData.opponent,
          status: caseData.status,
          nextHearingDate: caseData.nextHearingDate 
            ? caseData.nextHearingDate.toISOString().split('T')[0] 
            : undefined,
        }
      : {
          caseNumber: '',
          courtCaseNumber: '',
          description: '',
          clientName: '',
          openDate: new Date().toISOString().split('T')[0],
          opponent: '',
          status: 'new',
          nextHearingDate: '',
        },
  });

  const onSubmit = (data: CaseFormData) => {
    if (editMode && caseId) {
      updateCase(caseId, data);
      toast.success('Case updated successfully');
      navigate(`/cases/${caseId}`);
    } else {
      addCase(data);
      toast.success('Case created successfully');
      navigate('/cases');
    }
  };

  return (
    <Card className="w-full glass-card animate-scale-in shadow">
      <CardHeader>
        <CardTitle>{editMode ? 'Edit Case' : 'New Case'}</CardTitle>
        <CardDescription>
          {editMode 
            ? 'Update the details of the existing case'
            : 'Enter the details of the new case'}
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="caseNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Case Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter case number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="courtCaseNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Court Case Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter court case number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter case description" 
                      className="resize-none min-h-24"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="clientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter client name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="opponent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Opponent</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter opponent name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="openDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Open Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {caseStatusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="nextHearingDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Next Hearing Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value || undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editMode ? 'Update Case' : 'Create Case'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
