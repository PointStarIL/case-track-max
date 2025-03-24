
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { CaseForm } from '@/components/cases/CaseForm';

export default function CaseNew() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Case</h1>
          <p className="text-muted-foreground">Create a new case record</p>
        </div>
        
        <CaseForm />
      </div>
    </Layout>
  );
}
