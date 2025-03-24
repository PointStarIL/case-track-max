
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { CaseSupabaseForm } from '@/components/cases/CaseSupabaseForm';

export default function CaseSupabaseNew() {
  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6 text-right">תיק חדש במסד הנתונים</h1>
        <CaseSupabaseForm />
      </div>
    </Layout>
  );
}
