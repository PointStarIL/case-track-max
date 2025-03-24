
import React, { useMemo } from 'react';
import { useCasesStore } from '@/store/casesStore';
import { Layout } from '@/components/layout/Layout';
import { CaseStatus } from '@/types/case';
import { BarChart, DonutChart, LineChart } from '@/components/ui/chart';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

export default function Reports() {
  const { cases } = useCasesStore();
  
  // Status distribution data
  const statusData = useMemo(() => {
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
        name: status.replace('_', ' '),
        value: count,
        color: statusColors[status as CaseStatus],
      }));
  }, [cases]);
  
  // Monthly case distribution
  const monthlyData = useMemo(() => {
    const monthData: Record<string, number> = {};
    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 5);
    
    // Initialize months
    for (let i = 0; i < 6; i++) {
      const month = new Date(sixMonthsAgo);
      month.setMonth(sixMonthsAgo.getMonth() + i);
      const monthKey = month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      monthData[monthKey] = 0;
    }
    
    // Count cases by month
    cases.forEach(c => {
      const caseMonth = c.openDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (c.openDate >= sixMonthsAgo) {
        monthData[caseMonth] = (monthData[caseMonth] || 0) + 1;
      }
    });
    
    return Object.entries(monthData).map(([month, count]) => ({
      month,
      cases: count,
    }));
  }, [cases]);
  
  // Case outcome data
  const outcomeData = useMemo(() => {
    const completed = cases.filter(c => 
      c.status === 'closed' || 
      c.status === 'won' || 
      c.status === 'lost' || 
      c.status === 'settled'
    );
    
    const won = completed.filter(c => c.status === 'won').length;
    const lost = completed.filter(c => c.status === 'lost').length;
    const settled = completed.filter(c => c.status === 'settled').length;
    const closed = completed.filter(c => c.status === 'closed').length;
    
    return [
      { name: 'Won', value: won, color: statusColors.won },
      { name: 'Lost', value: lost, color: statusColors.lost },
      { name: 'Settled', value: settled, color: statusColors.settled },
      { name: 'Closed', value: closed, color: statusColors.closed },
    ].filter(item => item.value > 0);
  }, [cases]);
  
  // Task completion data
  const taskCompletionData = useMemo(() => {
    let completedTasks = 0;
    let pendingTasks = 0;
    
    cases.forEach(c => {
      completedTasks += c.tasks.filter(t => t.completed).length;
      pendingTasks += c.tasks.filter(t => !t.completed).length;
    });
    
    return [
      { name: 'Completed', value: completedTasks, color: '#22c55e' },
      { name: 'Pending', value: pendingTasks, color: '#f97316' },
    ].filter(item => item.value > 0);
  }, [cases]);
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        </div>
        
        {cases.length === 0 ? (
          <Alert>
            <AlertDescription>
              No cases available to generate reports. Create cases to see statistics and insights.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Case Status Distribution</CardTitle>
                <CardDescription>
                  Overview of current case statuses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <DonutChart
                    data={statusData}
                    index="name"
                    category="value"
                    colors={statusData.map(item => item.color)}
                    valueFormatter={(value: number) => `${value} case${value !== 1 ? 's' : ''}`}
                    className="h-[300px]"
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Monthly Case Volume</CardTitle>
                <CardDescription>
                  Cases opened in the last 6 months
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <BarChart
                    data={monthlyData}
                    index="month"
                    categories={["cases"]}
                    colors={["#3b82f6"]}
                    valueFormatter={(value: number) => `${value} case${value !== 1 ? 's' : ''}`}
                    className="h-[300px]"
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Case Outcomes</CardTitle>
                <CardDescription>
                  Resolution statistics for completed cases
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  {outcomeData.length > 0 ? (
                    <DonutChart
                      data={outcomeData}
                      index="name"
                      category="value"
                      colors={outcomeData.map(item => item.color)}
                      valueFormatter={(value: number) => `${value} case${value !== 1 ? 's' : ''}`}
                      className="h-[300px]"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-center">
                      <div className="text-muted-foreground">
                        No completed cases to show outcome statistics
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Task Completion Status</CardTitle>
                <CardDescription>
                  Overview of completed vs pending tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  {taskCompletionData[0].value + taskCompletionData[1].value > 0 ? (
                    <DonutChart
                      data={taskCompletionData}
                      index="name"
                      category="value"
                      colors={taskCompletionData.map(item => item.color)}
                      valueFormatter={(value: number) => `${value} task${value !== 1 ? 's' : ''}`}
                      className="h-[300px]"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-center">
                      <div className="text-muted-foreground">
                        No tasks available to show completion statistics
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}
