'use client';

import { Component, ReactNode } from 'react';

interface Props {
  toolName: string;
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ToolErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-6"
        >
          <div className="flex items-start gap-3">
            <svg
              className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <h2 className="font-semibold text-red-800 dark:text-red-300">
                {this.props.toolName} encountered an error
              </h2>
              {this.state.message && (
                <p className="mt-1 text-sm font-mono text-red-700 dark:text-red-400">
                  {this.state.message}
                </p>
              )}
              <button
                onClick={() => this.setState({ hasError: false, message: '' })}
                className="mt-3 text-sm text-red-700 dark:text-red-400 underline hover:no-underline"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
