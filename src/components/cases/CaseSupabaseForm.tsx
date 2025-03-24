
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { supabase } from '@/integrations/supabase/client';

const formSchema = z.object({
  ClientName: z.string().min(1, { message: 'שם לקוח נדרש' }),
  CaseNum: z.coerce.number().min(1, { message: 'מספר תיק נדרש' }), // Using coerce.number() to properly convert string to number
  CaseOpenDate: z.string().min(1, { message: 'תאריך פתיחה נדרש' }),
  CaseDescription: z.string().min(1, { message: 'תיאור התיק נדרש' }),
  OpposingParty: z.string().optional().nullable(),
  OpposingPartyLAW: z.string().optional().nullable(),
  Status: z.string().min(1, { message: 'סטטוס נדרש' }),
  CaseType: z.string().min(1, { message: 'סוג תיק נדרש' }),
  DiscussionDate: z.string().optional().nullable(),
});

const statusOptions = [
  { value: 'new', label: 'חדש' },
  { value: 'pending', label: 'בהמתנה' },
  { value: 'in_progress', label: 'בטיפול' },
  { value: 'awaiting_response', label: 'ממתין לתגובה' },
  { value: 'awaiting_hearing', label: 'ממתין לדיון' },
  { value: 'closed', label: 'סגור' },
  { value: 'won', label: 'זכינו' },
  { value: 'lost', label: 'הפסדנו' },
  { value: 'settled', label: 'הושגה פשרה' },
];

const caseTypeOptions = [
  { value: 'civil', label: 'אזרחי' },
  { value: 'criminal', label: 'פלילי' },
  { value: 'family', label: 'משפחה' },
  { value: 'labor', label: 'עבודה' },
  { value: 'administrative', label: 'מנהלי' },
  { value: 'other', label: 'אחר' },
];

type FormData = z.infer<typeof formSchema>;

export function CaseSupabaseForm() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ClientName: '',
      CaseNum: undefined, // Changed to undefined for number type
      CaseOpenDate: new Date().toISOString().split('T')[0],
      CaseDescription: '',
      OpposingParty: '',
      OpposingPartyLAW: '',
      Status: 'new',
      CaseType: 'civil',
      DiscussionDate: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('tblCases')
        .insert([
          {
            ClientName: data.ClientName,
            CaseNum: data.CaseNum, // Now properly typed as number
            CaseOpenDate: data.CaseOpenDate,
            CaseDescription: data.CaseDescription,
            OpposingParty: data.OpposingParty,
            OpposingPartyLAW: data.OpposingPartyLAW,
            Status: data.Status,
            CaseType: data.CaseType,
            DiscussionDate: data.DiscussionDate || null,
          }
        ]);
      
      if (error) {
        toast.error('שגיאה בשמירת התיק: ' + error.message);
        console.error('Error saving case:', error);
      } else {
        toast.success('התיק נשמר בהצלחה!');
        navigate('/cases');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('שגיאה לא צפויה התרחשה');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full shadow animate-scale-in rtl">
      <CardHeader>
        <CardTitle>יצירת תיק חדש במסד הנתונים</CardTitle>
        <CardDescription>
          מלא את פרטי התיק כדי לשמור אותו במסד הנתונים
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="ClientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>שם הלקוח</FormLabel>
                    <FormControl>
                      <Input placeholder="הזן את שם הלקוח" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="CaseNum"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>מספר תיק</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="הזן מספר תיק" 
                        {...field} 
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="CaseOpenDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>תאריך פתיחה</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="DiscussionDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>תאריך דיון (אופציונלי)</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value || null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="CaseType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>סוג תיק</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="בחר סוג תיק" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {caseTypeOptions.map((option) => (
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
            </div>

            <FormField
              control={form.control}
              name="CaseDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>תיאור התיק</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="הזן תיאור של התיק" 
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
                name="OpposingParty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>צד שכנגד</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="הזן את שם הצד שכנגד" 
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
                name="OpposingPartyLAW"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>באי כוח הצד שכנגד</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="הזן את שם עורך הדין של הצד שכנגד" 
                        {...field} 
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="Status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>סטטוס</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="בחר סטטוס" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statusOptions.map((option) => (
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
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/cases')}
            >
              ביטול
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'שומר...' : 'שמור תיק'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
