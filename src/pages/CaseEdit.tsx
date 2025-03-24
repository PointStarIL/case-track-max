
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { CaseForm } from '@/components/cases/CaseForm';
import { useCasesStore } from '@/store/casesStore';

export default function CaseEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCaseById } = useCasesStore();
  
  const caseItem = getCaseById(id!);
  
  if (!caseItem) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Case not found</h2>
            <p className="text-muted-foreground mb-4">
              The case you're trying to edit doesn't exist or has been deleted.
            </p>
            <button
              onClick={() => navigate('/cases')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              Back to Cases
            </button>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Case</h1>
          <p className="text-muted-foreground">Update case information</p>
        </div>
        
        <CaseForm editMode={true} caseId={id} />
      </div>
    </Layout>
  );
}
