
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCasesStore } from '@/store/casesStore';
import { 
  Calendar, 
  User, 
  Edit, 
  Trash2, 
  Clock, 
  PlusCircle, 
  FileText,
  UserMinus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { TaskList } from '../tasks/TaskList';
import { TaskForm } from '../tasks/TaskForm';

const statusColors: Record<string, string> = {
  new: 'bg-blue-500',
  pending: 'bg-yellow-500',
  in_progress: 'bg-purple-500',
  awaiting_response: 'bg-orange-500',
  awaiting_hearing: 'bg-sky-500',
  closed: 'bg-gray-500',
  won: 'bg-green-500',
  lost: 'bg-red-500',
  settled: 'bg-teal-500',
};

interface CaseDetailProps {
  id: string;
}

export function CaseDetail({ id }: CaseDetailProps) {
  const navigate = useNavigate();
  const { getCaseById, deleteCase } = useCasesStore();
  const [openTaskForm, setOpenTaskForm] = React.useState(false);

  const caseItem = getCaseById(id);

  const handleDeleteCase = () => {
    deleteCase(id);
    toast.success('Case deleted successfully');
    navigate('/cases');
  };

  if (!caseItem) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Case not found</h2>
          <p className="text-muted-foreground mb-4">
            The case you're looking for doesn't exist or has been deleted.
          </p>
          <Button onClick={() => navigate('/cases')}>
            Back to Cases
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold tracking-tight">{caseItem.clientName}</h1>
            <Badge className={`${statusColors[caseItem.status]}`}>
              {caseItem.status.replace('_', ' ')}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Case #{caseItem.caseNumber} | Court Case #{caseItem.courtCaseNumber}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/cases/edit/${id}`)}
            className="gap-1"
          >
            <Edit className="h-4 w-4" />
            <span>Edit</span>
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="gap-1">
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="glass-effect">
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this case and all associated tasks. 
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDeleteCase}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Case Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">Description</div>
                  <div className="text-base">{caseItem.description}</div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">Opponent</div>
                  <div className="flex items-center gap-1">
                    <UserMinus className="h-4 w-4 text-muted-foreground" />
                    <span className="text-base">{caseItem.opponent}</span>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">Open Date</div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{caseItem.openDate.toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">Client</div>
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{caseItem.clientName}</span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">Next Hearing</div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {caseItem.nextHearingDate 
                        ? caseItem.nextHearingDate.toLocaleDateString() 
                        : 'Not scheduled'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-6">
            <Tabs defaultValue="tasks">
              <div className="flex justify-between items-center mb-4">
                <TabsList>
                  <TabsTrigger value="tasks">Tasks</TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                </TabsList>
                
                <Button
                  onClick={() => setOpenTaskForm(!openTaskForm)}
                  variant="outline"
                  className="gap-1"
                >
                  {openTaskForm ? (
                    <>Cancel</>
                  ) : (
                    <>
                      <PlusCircle className="h-4 w-4" />
                      <span>Add Task</span>
                    </>
                  )}
                </Button>
              </div>
              
              <TabsContent value="tasks" className="mt-0">
                {openTaskForm && (
                  <div className="mb-6 glass-card p-4 rounded-lg animate-scale-in">
                    <TaskForm 
                      caseId={id!} 
                      onComplete={() => setOpenTaskForm(false)} 
                    />
                  </div>
                )}
                
                <TaskList caseId={id!} />
              </TabsContent>
              
              <TabsContent value="notes" className="mt-0">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Case Notes</CardTitle>
                    <CardDescription>
                      Add notes and observations about this case
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center h-32 text-center">
                      <FileText className="h-10 w-10 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">
                        Notes functionality will be available in the next version
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="documents" className="mt-0">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Documents</CardTitle>
                    <CardDescription>
                      Upload and manage documents related to this case
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center h-32 text-center">
                      <FileText className="h-10 w-10 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">
                        Document management will be available in the next version
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        <div>
          <Card className="glass-card sticky top-24">
            <CardHeader>
              <CardTitle>Case Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Status</div>
                  <Badge className={`${statusColors[caseItem.status]}`}>
                    {caseItem.status.replace('_', ' ')}
                  </Badge>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Tasks</div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="bg-background">
                      Total: {caseItem.tasks.length}
                    </Badge>
                    <Badge variant="outline" className="bg-background">
                      Completed: {caseItem.tasks.filter(t => t.completed).length}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Timeline</div>
                  <div className="text-sm">
                    <div className="flex items-center mb-1">
                      <Calendar className="h-4 w-4 text-muted-foreground mr-1" />
                      <span>Opened: {caseItem.openDate.toLocaleDateString()}</span>
                    </div>
                    {caseItem.nextHearingDate && (
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-muted-foreground mr-1" />
                        <span>
                          Next Hearing: {caseItem.nextHearingDate.toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => navigate(`/cases/edit/${id}`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Case Details
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
