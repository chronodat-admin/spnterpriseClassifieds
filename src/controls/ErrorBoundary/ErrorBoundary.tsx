import * as React from 'react';
import { APP_NAME } from '../../constants';

export interface IErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface IErrorBoundaryFallbackProps {
  error: Error | undefined;
  onRetry: () => void;
}

const ErrorBoundaryFallback: React.FC<IErrorBoundaryFallbackProps> = ({ error, onRetry }) => (
  <div
    role="alert"
    style={{
      minHeight: 320,
      padding: 24,
      border: '2px solid #d13438',
      borderRadius: 8,
      background: '#fef6f6',
      color: '#201f1e',
      fontFamily: 'Segoe UI, sans-serif'
    }}
  >
    <strong>{APP_NAME} failed to render.</strong>
    <p style={{ margin: '8px 0 16px' }}>
      {error?.message ?? 'An unexpected error occurred. Please try again.'}
    </p>
    <button
      type="button"
      onClick={onRetry}
      style={{
        padding: '6px 16px',
        border: '1px solid #0078d4',
        borderRadius: 4,
        background: '#0078d4',
        color: '#ffffff',
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: 14
      }}
    >
      Try again
    </button>
  </div>
);

interface IErrorBoundaryState {
  hasError: boolean;
  error: Error | undefined;
}

export class ErrorBoundary extends React.Component<IErrorBoundaryProps, IErrorBoundaryState> {
  public constructor(props: IErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: undefined };
  }

  public static getDerivedStateFromError(error: Error): IErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.props.onError?.(error, errorInfo);
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false, error: undefined });
  };

  public render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <ErrorBoundaryFallback
          error={this.state.error}
          onRetry={this.handleRetry}
        />
      );
    }
    return this.props.children;
  }
}
