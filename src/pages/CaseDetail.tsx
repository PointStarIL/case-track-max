
import React from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { CaseDetail as CaseDetailComponent } from '@/components/cases/CaseDetail';

export default function CaseDetail() {
  const { id } = useParams<{ id: string }>();
  
  return (
    <Layout>
      <CaseDetailComponent />
    </Layout>
  );
}
