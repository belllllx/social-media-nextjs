"use client";

import { ICommonResponse } from "@/utils/types";
import { AlertCircle } from "lucide-react";

interface Error5xxProps {
  resetErrorBoundary: (...args: unknown[]) => void;
  error: Error;
}

export function Error5xx({ resetErrorBoundary, error }: Error5xxProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="max-w-2xl w-full p-8 md:p-12 bg-white border-2 border-gray-200 rounded-xl shadow-lg">
        <div className="flex flex-col items-center text-center space-y-6">
          {/* Error Icon */}
          <div className="relative">
            <div className="absolute inset-0 bg-red-500/10 blur-2xl rounded-full" />
            <div className="relative bg-red-50 p-6 rounded-full border-2 border-red-200">
              <AlertCircle
                className="w-16 h-16 text-red-600"
                strokeWidth={1.5}
              />
            </div>
          </div>

          {/* Error Code */}
          <div className="space-y-2">
            <h1 className="text-7xl md:text-8xl font-bold text-gray-900 font-mono tracking-tight">
              {(error as unknown as ICommonResponse).status}
            </h1>
            <div className="h-1 w-20 mx-auto bg-red-600 rounded-full" />
          </div>

          {/* Error Message */}
          <div className="space-y-4 max-w-md">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 text-balance">
              Internal Server Error
            </h2>
            <p className="text-gray-600 leading-relaxed text-pretty">
              Something went wrong on our server. {(error as unknown as ICommonResponse).message}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 w-full sm:w-auto">
            <button
              onClick={resetErrorBoundary}
              className="font-medium border-gray-300 text-gray-700 cursor-pointer"
            >
              Try Again
            </button>
          </div>

          {/* Additional Info */}
          <div className="pt-6 border-t border-gray-200 w-full" />
        </div>
      </div>
    </div>
  );
}
