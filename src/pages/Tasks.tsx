
import React, { useState, useMemo } from 'react';
import { useCasesStore } from '@/store/casesStore';
import { Layout } from '@/components/layout/Layout';
import { Task } from '@/types/case';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Calendar, Check, Clock, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
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
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface TaskWithCase extends Task {
  caseName: string;
  caseNumber: string;
}

export default function Tasks() {
  const { cases, toggleTaskCompletion } = useCasesStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCompleted, setFilterCompleted] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('dueDate');
  
  // Get all tasks from all cases
  const allTasks = useMemo(() => {
    const tasks: TaskWithCase[] = [];
    
    cases.forEach(c => {
      c.tasks.forEach(t => {
        tasks.push({
          ...t,
          caseName: c.clientName,
          caseNumber: c.caseNumber,
        });
      });
    });
    
    return tasks;
  }, [cases]);
  
  // Filter tasks
  const filteredTasks = useMemo(() => {
    return allTasks.filter(task => {
      const matchesSearch = 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        task.caseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.caseNumber.toLowerCase().includes(searchQuery.toLowerCase());
        
      const matchesCompleted = 
        filterCompleted === 'all' || 
        (filterCompleted === 'completed' && task.completed) ||
        (filterCompleted === 'incomplete' && !task.completed);
        
      return matchesSearch && matchesCompleted;
    });
  }, [allTasks, searchQuery, filterCompleted]);
  
  // Sort tasks
  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          // Tasks with due dates come first, sorted by date
          if (a.dueDate && b.dueDate) {
            return a.dueDate.getTime() - b.dueDate.getTime();
          }
          if (a.dueDate) return -1;
          if (b.dueDate) return 1;
          return a.createdAt.getTime() - b.createdAt.getTime();
          
        case 'createdAt':
          return a.createdAt.getTime() - b.createdAt.getTime();
          
        case 'case':
          return a.caseName.localeCompare(b.caseName);
          
        case 'title':
          return a.title.localeCompare(b.title);
          
        default:
          return 0;
      }
    });
  }, [filteredTasks, sortBy]);
  
  // Group tasks by due date
  const groupedTasks = useMemo(() => {
    const groups: Record<string, TaskWithCase[]> = {
      overdue: [],
      today: [],
      tomorrow: [],
      thisWeek: [],
      later: [],
      noDueDate: [],
    };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const endOfWeek = new Date(today);
    endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));
    
    sortedTasks.forEach(task => {
      if (!task.dueDate) {
        groups.noDueDate.push(task);
        return;
      }
      
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      
      if (dueDate < today && !task.completed) {
        groups.overdue.push(task);
      } else if (dueDate.getTime() === today.getTime()) {
        groups.today.push(task);
      } else if (dueDate.getTime() === tomorrow.getTime()) {
        groups.tomorrow.push(task);
      } else if (dueDate > tomorrow && dueDate <= endOfWeek) {
        groups.thisWeek.push(task);
      } else {
        groups.later.push(task);
      }
    });
    
    return groups;
  }, [sortedTasks]);
  
  const handleToggleTask = (caseId: string, taskId: string) => {
    toggleTaskCompletion(caseId, taskId);
  };
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..." 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select
            value={filterCompleted}
            onValueChange={setFilterCompleted}
          >
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tasks</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="incomplete">Incomplete</SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            value={sortBy}
            onValueChange={setSortBy}
          >
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dueDate">Due Date</SelectItem>
              <SelectItem value="createdAt">Created Date</SelectItem>
              <SelectItem value="case">Case Name</SelectItem>
              <SelectItem value="title">Task Title</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {sortedTasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-center border rounded-lg">
            <Check className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No tasks found</h3>
            <p className="text-muted-foreground">
              {allTasks.length === 0 
                ? "You haven't created any tasks yet." 
                : "No tasks match your search criteria."}
            </p>
          </div>
        )}
        
        <div className="space-y-6">
          {/* Overdue Tasks */}
          {groupedTasks.overdue.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-red-500">
                <Clock className="h-5 w-5" />
                Overdue
              </h2>
              <Card className="glass-card">
                <CardContent className="p-0">
                  {groupedTasks.overdue.map(task => (
                    <TaskItem 
                      key={task.id} 
                      task={task} 
                      onToggle={() => handleToggleTask(task.caseId, task.id)} 
                    />
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Today's Tasks */}
          {groupedTasks.today.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Today
              </h2>
              <Card className="glass-card">
                <CardContent className="p-0">
                  {groupedTasks.today.map(task => (
                    <TaskItem 
                      key={task.id} 
                      task={task} 
                      onToggle={() => handleToggleTask(task.caseId, task.id)} 
                    />
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Tomorrow's Tasks */}
          {groupedTasks.tomorrow.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Tomorrow
              </h2>
              <Card className="glass-card">
                <CardContent className="p-0">
                  {groupedTasks.tomorrow.map(task => (
                    <TaskItem 
                      key={task.id} 
                      task={task} 
                      onToggle={() => handleToggleTask(task.caseId, task.id)} 
                    />
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* This Week's Tasks */}
          {groupedTasks.thisWeek.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                This Week
              </h2>
              <Card className="glass-card">
                <CardContent className="p-0">
                  {groupedTasks.thisWeek.map(task => (
                    <TaskItem 
                      key={task.id} 
                      task={task} 
                      onToggle={() => handleToggleTask(task.caseId, task.id)} 
                    />
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Later Tasks */}
          {groupedTasks.later.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Later
              </h2>
              <Card className="glass-card">
                <CardContent className="p-0">
                  {groupedTasks.later.map(task => (
                    <TaskItem 
                      key={task.id} 
                      task={task} 
                      onToggle={() => handleToggleTask(task.caseId, task.id)} 
                    />
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* No Due Date Tasks */}
          {groupedTasks.noDueDate.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-5 w-5" />
                No Due Date
              </h2>
              <Card className="glass-card">
                <CardContent className="p-0">
                  {groupedTasks.noDueDate.map(task => (
                    <TaskItem 
                      key={task.id} 
                      task={task} 
                      onToggle={() => handleToggleTask(task.caseId, task.id)} 
                    />
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

function TaskItem({ 
  task, 
  onToggle 
}: { 
  task: TaskWithCase; 
  onToggle: () => void; 
}) {
  return (
    <div className={`p-4 border-b last:border-0 flex items-start gap-3 ${
      task.completed ? 'opacity-60' : ''
    }`}>
      <Checkbox 
        checked={task.completed}
        onCheckedChange={onToggle}
        className="mt-1"
      />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <div className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
              {task.title}
            </div>
            <Link 
              to={`/cases/${task.caseId}`}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {task.caseName} (Case #{task.caseNumber})
            </Link>
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
  );
}
