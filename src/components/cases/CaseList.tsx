
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { useCasesStore } from '@/store/casesStore';
import { Case, CaseStatus } from '@/types/case';
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Calendar, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const statusColors: Record<CaseStatus, string> = {
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

export function CaseList() {
  const { cases } = useCasesStore();
  const isMobile = useIsMobile();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const filteredCases = useMemo(() => {
    return cases.filter(c => {
      const matchesSearch = 
        c.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.courtCaseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.opponent.toLowerCase().includes(searchQuery.toLowerCase());
        
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [cases, searchQuery, statusFilter]);
  
  const sortedCases = useMemo(() => {
    return [...filteredCases].sort((a, b) => 
      b.openDate.getTime() - a.openDate.getTime()
    );
  }, [filteredCases]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search cases..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={setStatusFilter}
        >
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="awaiting_response">Awaiting Response</SelectItem>
            <SelectItem value="awaiting_hearing">Awaiting Hearing</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
            <SelectItem value="won">Won</SelectItem>
            <SelectItem value="lost">Lost</SelectItem>
            <SelectItem value="settled">Settled</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {sortedCases.length === 0 && (
        <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg">
          <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No cases found</h3>
          <p className="text-muted-foreground">
            {cases.length === 0 
              ? "You haven't created any cases yet." 
              : "No cases match your search criteria."}
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedCases.map((caseItem) => (
          <Link to={`/cases/${caseItem.id}`} key={caseItem.id}>
            <Card className="glass-card h-full hover:shadow-glass-hover hover:-translate-y-1 transition-all duration-300">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <Badge className={`${statusColors[caseItem.status]}`}>
                    {caseItem.status.replace('_', ' ')}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(caseItem.openDate, { addSuffix: true })}
                  </span>
                </div>
                <CardTitle className="line-clamp-1">{caseItem.clientName}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-muted-foreground">Case Number</div>
                    <div className="text-sm">{caseItem.caseNumber}</div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-muted-foreground">Court Case Number</div>
                    <div className="text-sm">{caseItem.courtCaseNumber}</div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-muted-foreground">Description</div>
                    <div className="text-sm line-clamp-2">{caseItem.description}</div>
                  </div>
                  
                  {caseItem.nextHearingDate && (
                    <div className="flex items-center text-sm mt-2 pt-2 border-t">
                      <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span>
                        Next hearing: {caseItem.nextHearingDate.toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
