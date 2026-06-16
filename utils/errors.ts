// API Error handling utilities

export class ApiError extends Error {
    constructor(
        message: string,
        public statusCode: number,
        public code?: string
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

// Common error messages for user display
export const ERROR_MESSAGES: Record<string, string> = {
    NETWORK_ERROR: 'Unable to connect. Please check your internet connection.',
    UNAUTHORIZED: 'Your session has expired. Please log in again.',
    FORBIDDEN: 'You don\'t have permission to perform this action.',
    NOT_FOUND: 'The requested resource was not found.',
    VALIDATION_ERROR: 'Please check your input and try again.',
    SERVER_ERROR: 'Something went wrong on our end. Please try again later.',
    RATE_LIMITED: 'Too many requests. Please wait a moment and try again.',
    DEFAULT: 'An unexpected error occurred. Please try again.',
};

// Parse API error response
export async function parseApiError(response: Response): Promise<ApiError> {
    let message = ERROR_MESSAGES.DEFAULT;
    let code: string | undefined;

    try {
        const data = await response.json();
        if (data.message) {
            message = data.message;
        }
        if (data.code) {
            code = data.code;
        }
    } catch {
        // Response wasn't JSON, use status-based message
    }

    // Map HTTP status to user-friendly message if no specific message
    if (message === ERROR_MESSAGES.DEFAULT) {
        switch (response.status) {
            case 400:
                message = ERROR_MESSAGES.VALIDATION_ERROR;
                break;
            case 401:
                message = ERROR_MESSAGES.UNAUTHORIZED;
                break;
            case 403:
                message = ERROR_MESSAGES.FORBIDDEN;
                break;
            case 404:
                message = ERROR_MESSAGES.NOT_FOUND;
                break;
            case 429:
                message = ERROR_MESSAGES.RATE_LIMITED;
                break;
            case 500:
            case 502:
            case 503:
                message = ERROR_MESSAGES.SERVER_ERROR;
                break;
        }
    }

    return new ApiError(message, response.status, code);
}

// Handle common error scenarios
export function handleApiError(error: unknown): string {
    if (error instanceof ApiError) {
        return error.message;
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
        return ERROR_MESSAGES.NETWORK_ERROR;
    }

    if (error instanceof Error) {
        return error.message || ERROR_MESSAGES.DEFAULT;
    }

    return ERROR_MESSAGES.DEFAULT;
}

// Check if error is an auth error (should redirect to login)
export function isAuthError(error: unknown): boolean {
    return error instanceof ApiError && error.statusCode === 401;
}

// Check if error is a network error
export function isNetworkError(error: unknown): boolean {
    return (
        error instanceof TypeError &&
        (error.message.includes('fetch') || error.message.includes('network'))
    );
}
