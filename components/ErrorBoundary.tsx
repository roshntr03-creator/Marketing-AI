import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ error: error });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
            <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg mx-4">
                <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">للأسف، حدث خطأ ما</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    نحن نأسف للإزعاج. لقد واجه تطبيقنا مشكلة غير متوقعة. يرجى محاولة تحديث الصفحة. إذا استمرت المشكلة، يرجى الاتصال بالدعم.
                </p>
                {this.state.error && (
                    <p className="mt-4 text-xs text-left rtl:text-right text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-900 p-2 rounded font-mono">
                        Error: {this.state.error.toString()}
                    </p>
                )}
                <button
                    onClick={() => window.location.reload()}
                    className="mt-6 px-6 py-2 font-medium tracking-wide text-white capitalize transition-colors duration-200 transform bg-primary-600 rounded-md hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                    تحديث الصفحة
                </button>
            </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
