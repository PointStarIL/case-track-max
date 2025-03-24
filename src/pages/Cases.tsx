
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { CaseList } from '@/components/cases/CaseList';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Cases() {
  const navigate = useNavigate();
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Cases</h1>
          <Button onClick={() => navigate('/cases/new')} className="gap-1">
            <PlusCircle className="h-4 w-4" />
            <span>New Case</span>
          </Button>
        </div>
        
        <CaseList />
      </div>
    </Layout>
  );
}
