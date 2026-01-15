"use client";

import React from "react";
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import { Error5xx } from "@/components/error-5xx";

interface TanstackQueryErrorResetBoundaryProps {
  children: React.ReactNode;
}

export function TanstackQueryErrorResetBoundary({
  children,
}: TanstackQueryErrorResetBoundaryProps) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ error, resetErrorBoundary }) => (
            <Error5xx 
              resetErrorBoundary={resetErrorBoundary} 
              error={error}
            />
          )}
        >
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
