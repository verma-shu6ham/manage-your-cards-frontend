import React from 'react';
import { formatError } from '../../utils/errorHandler';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const { message, statusCode } = formatError(this.state.error);
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <p>{message}</p>
          <p>Status Code: {statusCode}</p>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export const withErrorBoundary = (Component) => {
  return (props) => (
    <ErrorBoundary>
      <Component {...props} />
    </ErrorBoundary>
  );
};
