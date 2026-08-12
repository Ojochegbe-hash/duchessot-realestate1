import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

// @ts-ignore
export class ErrorBoundary extends React.Component<Props, State> {
  // @ts-ignore
  state: State = {
    hasError: false,
  };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('Uncaught error in React tree:', error, errorInfo);
  }

  render() {
    // @ts-ignore
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-stone-900 text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md bg-stone-800 border border-stone-700 p-8 rounded-2xl shadow-2xl">
            <h1 className="text-2xl font-bold text-amber-500 mb-3">DUCHESSOT Real Estate</h1>
            <p className="text-stone-300 text-sm mb-6">
              Something went wrong loading this page. Please refresh or click below to return home.
            </p>
            <button
              onClick={() => {
                // @ts-ignore
                this.setState({ hasError: false });
                window.location.href = '/';
              }}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-stone-950 font-semibold rounded-xl transition-all shadow-md cursor-pointer"
            >
              Reload Website
            </button>
          </div>
        </div>
      );
    }

    // @ts-ignore
    return this.props.children;
  }
}
