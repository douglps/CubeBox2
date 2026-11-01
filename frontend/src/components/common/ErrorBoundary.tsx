import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from './Button';
import styles from './ErrorBoundary.module.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary capturou uma falha de renderização:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.errorContainer} role="alert">
          <div className={styles.iconWrap}>
            <AlertTriangle size={24} />
          </div>
          <h3 className={styles.title}>Falha Temporária na Exibição</h3>
          <p className={styles.message}>
            Ocorreu uma inconsistência ao renderizar este módulo. Os dados no servidor continuam íntegros.
          </p>
          {this.state.error && (
            <div className={styles.details}>
              {this.state.error.message}
            </div>
          )}
          <Button
            variant="primary"
            icon={<RotateCcw size={16} />}
            onClick={this.handleReset}
          >
            Tentar Novamente
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
