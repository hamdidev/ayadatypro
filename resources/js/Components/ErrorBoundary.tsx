/// <reference types="vite/client" />

import { Component, ReactNode, ErrorInfo } from "react";

interface Props {
    children: ReactNode;
    fallback: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: ErrorInfo): void {
        // Log to console in dev; swap for Sentry/Bugsnag in production
        if (import.meta.env.DEV) {
            console.error(
                "[ErrorBoundary] Caught error:",
                error,
                info.componentStack,
            );
        }
    }

    render(): ReactNode {
        if (this.state.hasError) {
            return this.props.fallback;
        }
        return this.props.children;
    }
}
