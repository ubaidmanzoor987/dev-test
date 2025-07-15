"use client";

import MainContainer from "@/shared/components/layout/MainContainer";
import { Button } from "@/shared/components/ui/button";
import { useEffect } from "react";

const ErrorBoundary = ({ error }: { error: Error & { digest?: string } }) => {
  useEffect(() => {
    // TODO: Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <MainContainer className="justify-center">
      <div className="lg:p8 rounded-lg border-2 border-red-500 p-4 text-center sm:p-6">
        <h1 className="text-3xl font-bold text-red-500">
          Something went wrong!
        </h1>
        <p className="text-lg text-wrap">
          {error.message ?? "An unexpected error has occurred."}
        </p>
        <Button
          variant="destructive"
          size="lg"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Reload Page
        </Button>
      </div>
    </MainContainer>
  );
};

export default ErrorBoundary;
