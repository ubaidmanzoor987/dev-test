"use client";

import ErrorBoundary from "@/shared/components/ErrorBoundary";

const Error = ({ error }: { error: Error & { digest?: string } }) =>
  ErrorBoundary({ error });

export default Error;
