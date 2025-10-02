'use client';

import { trpc } from '@/lib/trpc';
import React from 'react';

export function TestTRPC() {
  const { data, isLoading, error } = trpc.healthcheck.useQuery();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>tRPC Test</h2>
      <p>Health check: {JSON.stringify(data)}</p>
    </div>
  );
}