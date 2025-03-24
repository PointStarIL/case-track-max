
import React from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { CaseDetail as CaseDetailComponent } from '@/components/cases/CaseDetail';

export default function CaseDetail() {
  const { id } = useParams<{ id: string }>();
  
  if (!id) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Case ID not found</p>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <CaseDetailComponent id={id} />
    </Layout>
  );
}
