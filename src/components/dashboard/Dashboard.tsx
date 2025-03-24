
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCasesStore } from '@/store/casesStore';
import { AreaChart, PieChart } from '@/components/ui/chart';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Briefcase, 
  Calendar, 
  Check, 
  Clock, 
  PlusCircle,
  LucideIcon
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { CaseStatus } from '@/types/case';

interface StatusCount {
  status: CaseStatus;
  count: number;
  color: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
}

const statusColors: Record<CaseStatus, string> = {
  new: '#3b82f6', // blue-500
  pending: '#eab308', // yellow-500
  in_progress: '#a855f7', // purple-500
  awaiting_response: '#f97316', // orange-500
  awaiting_hearing: '#0ea5e9', // sky-500
  closed: '#6b7280', // gray-500
  won: '#22c55e', // green-500
  lost: '#ef4444', // red-500
  settled: '#14b8a6', // teal-500
};

function StatCard({ title, value, description, icon: Icon, trend }: StatCardProps) {
  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            <Badge
              variant="outline"
              className={`text-xs ${
                trend.positive ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {trend.positive ? '+' : ''}{trend.value}%
            </Badge>
            <span className="text-xs text-muted-foreground">{trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function Dashboard() {
  const { cases } = useCasesStore();
  const navigate = useNavigate();
  
  // Count cases by status
  const statusCounts = useMemo(() => {
    const counts: Record<CaseStatus, number> = {
      new: 0,
      pending: 0,
      in_progress: 0,
      awaiting_response: 0,
      awaiting_hearing: 0,
      closed: 0,
      won: 0,
      lost: 0,
      settled: 0,
    };
    
    cases.forEach(c => {
      counts[c.status] = (counts[c.status] || 0) + 1;
    });
    
    return Object.entries(counts)
      .filter(([_, count]) => count > 0)
      .map(([status, count]) => ({
        status: status as CaseStatus,
        count,
        color: statusColors[status as CaseStatus],
      })) as StatusCount[];
  }, [cases]);
  
  // Calculate total number of tasks and completed tasks
  const taskStats = useMemo(() => {
    let totalTasks = 0;
    let completedTasks = 0;
    
    cases.forEach(c => {
      totalTasks += c.tasks.length;
      completedTasks += c.tasks.filter(t => t.completed).length;
    });
    
    return {
      total: totalTasks,
      completed: completedTasks,
      completion: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    };
  }, [cases]);
  
  // Get upcoming hearings
  const upcomingHearings = useMemo(() => {
    const now = new Date();
    return cases
      .filter(c => c.nextHearingDate && c.nextHearingDate > now)
      .sort((a, b) => a.nextHearingDate!.getTime() - b.nextHearingDate!.getTime())
      .slice(0, 5);
  }, [cases]);
  
  // Get recent cases
  const recentCases = useMemo(() => {
    return [...cases]
      .sort((a, b) => b.openDate.getTime() - a.openDate.getTime())
      .slice(0, 5);
  }, [cases]);
  
  // Data for charts
  const pieChartData = useMemo(() => {
    return statusCounts.map(item => ({
      name: item.status.replace('_', ' '),
      value: item.count,
      color: item.color,
    }));
  }, [statusCounts]);
  
  // Create dummy chart data for activity
  const activityData = useMemo(() => {
    // This is just for demonstration purposes
    const data = [];
    const date = new Date();
    for (let i = 30; i >= 0; i--) {
      const pastDate = new Date(date);
      pastDate.setDate(date.getDate() - i);
      data.push({
        date: pastDate.toISOString().split('T')[0],
        Cases: Math.floor(Math.random() * 3),
        Tasks: Math.floor(Math.random() * 5),
      });
    }
    return data;
  }, []);
  
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Button onClick={() => navigate('/cases/new')} className="gap-1">
          <PlusCircle className="h-4 w-4" />
          <span>New Case</span>
        </Button>
      </div>
      
      {cases.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Briefcase className="h-16 w-16 text-muted-foreground mb-4 opacity-20" />
          <h2 className="text-2xl font-medium mb-2">No cases yet</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Get started by creating your first case. Track important details, manage tasks, and stay on top of your legal work.
          </p>
          <Button onClick={() => navigate('/cases/new')} className="gap-1">
            <PlusCircle className="h-4 w-4" />
            <span>Create Your First Case</span>
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title="Total Cases" 
              value={cases.length} 
              description="Active and closed cases"
              icon={Briefcase}
            />
            
            <StatCard 
              title="Active Cases" 
              value={cases.filter(c => c.status !== 'closed' && c.status !== 'won' && 
                c.status !== 'lost' && c.status !== 'settled').length} 
              description="Cases requiring attention"
              icon={Clock}
            />
            
            <StatCard 
              title="Tasks" 
              value={`${taskStats.completed}/${taskStats.total}`} 
              description={`${taskStats.completion}% completion rate`}
              icon={Check}
            />
            
            <StatCard 
              title="Upcoming Hearings" 
              value={upcomingHearings.length} 
              description="Scheduled court dates"
              icon={Calendar}
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="glass-card lg:col-span-2">
              <CardHeader>
                <CardTitle>Activity</CardTitle>
                <CardDescription>
                  Case and task activity over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <AreaChart
                    data={activityData}
                    index="date"
                    categories={["Cases", "Tasks"]}
                    colors={["blue", "green"]}
                    valueFormatter={(value: number) => `${value}`}
                    showLegend={true}
                    showGridLines={false}
                    startEndOnly={true}
                    className="h-[300px]"
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Case Status</CardTitle>
                <CardDescription>
                  Distribution by current status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full flex items-center justify-center">
                  {pieChartData.length > 0 ? (
                    <PieChart
                      data={pieChartData}
                      index="name"
                      category="value"
                      colors={pieChartData.map(item => item.color)}
                      valueFormatter={(value: number) => `${value} case${value !== 1 ? 's' : ''}`}
                      className="h-[300px]"
                    />
                  ) : (
                    <div className="text-center text-muted-foreground">
                      No status data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle>Recent Cases</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/cases')}>
                    View all
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentCases.length > 0 ? (
                    recentCases.map(caseItem => (
                      <div key={caseItem.id} className="flex justify-between items-center pb-3 border-b last:border-0 last:pb-0">
                        <div>
                          <div className="font-medium">{caseItem.clientName}</div>
                          <div className="text-sm text-muted-foreground">
                            Case #{caseItem.caseNumber}
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <Badge className={`mb-1 bg-${caseItem.status === 'in_progress' ? 'purple' : statusColors[caseItem.status].replace('#', '')}`}>
                            {caseItem.status.replace('_', ' ')}
                          </Badge>
                          <div className="text-xs text-muted-foreground">
                            {formatDistanceToNow(caseItem.openDate, { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No cases available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle>Upcoming Hearings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingHearings.length > 0 ? (
                    upcomingHearings.map(caseItem => (
                      <div key={caseItem.id} className="flex justify-between items-center pb-3 border-b last:border-0 last:pb-0">
                        <div>
                          <div className="font-medium">{caseItem.clientName}</div>
                          <div className="text-sm text-muted-foreground">
                            Case #{caseItem.caseNumber}
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="flex items-center text-sm mb-1">
                            <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                            <span>{caseItem.nextHearingDate?.toLocaleDateString()}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatDistanceToNow(caseItem.nextHearingDate!, { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No upcoming hearings
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => navigate('/cases/new')}
                >
                  Schedule New Hearing
                </Button>
              </CardFooter>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
