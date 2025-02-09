import React, { Component, ErrorInfo } from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
          <div className="bg-white dark:bg-gray-700 p-8 rounded-xl shadow-2xl text-center max-w-md mx-4">
            <h1 className="text-3xl font-extrabold text-red-600 dark:text-red-400 mb-4">
              Oops! Something went wrong.
            </h1>
            <p className="text-lg text-gray-700 dark:text-gray-200 mb-6">
              An unexpected error occurred. Please refresh or contact support.
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
