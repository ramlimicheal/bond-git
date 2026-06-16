import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';

/**
 * Debounce a value - useful for search inputs
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}

/**
 * Debounced callback function
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
    callback: T,
    delay: number = 300
): T {
    const callbackRef = useRef(callback);
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

    // Update the callback ref when callback changes
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return useCallback(
        ((...args: Parameters<T>) => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(() => {
                callbackRef.current(...args);
            }, delay);
        }) as T,
        [delay]
    );
}

/**
 * Throttle a callback - limits how often it can be called
 */
export function useThrottle<T extends (...args: any[]) => any>(
    callback: T,
    limit: number = 300
): T {
    const lastRunRef = useRef(Date.now());
    const callbackRef = useRef(callback);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    return useCallback(
        ((...args: Parameters<T>) => {
            const now = Date.now();
            if (now - lastRunRef.current >= limit) {
                lastRunRef.current = now;
                return callbackRef.current(...args);
            }
        }) as T,
        [limit]
    );
}

/**
 * Track if component is mounted (prevent state updates after unmount)
 */
export function useIsMounted(): () => boolean {
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    return useCallback(() => isMountedRef.current, []);
}

/**
 * Previous value hook - track the previous value of a state
 */
export function usePrevious<T>(value: T): T | undefined {
    const ref = useRef<T>();

    useEffect(() => {
        ref.current = value;
    }, [value]);

    return ref.current;
}

/**
 * Lazy initial state - useful for expensive computations
 */
export function useLazyRef<T>(initializer: () => T): React.MutableRefObject<T> {
    const ref = useRef<T | null>(null);

    if (ref.current === null) {
        ref.current = initializer();
    }

    return ref as React.MutableRefObject<T>;
}

/**
 * LocalStorage state hook with SSR safety
 */
export function useLocalStorage<T>(
    key: string,
    initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === 'undefined') {
            return initialValue;
        }
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    const setValue = useCallback(
        (value: T | ((prev: T) => T)) => {
            try {
                const valueToStore = value instanceof Function ? value(storedValue) : value;
                setStoredValue(valueToStore);
                if (typeof window !== 'undefined') {
                    window.localStorage.setItem(key, JSON.stringify(valueToStore));
                }
            } catch (error) {
                console.error(`Error setting localStorage key "${key}":`, error);
            }
        },
        [key, storedValue]
    );

    return [storedValue, setValue];
}

/**
 * Intersection Observer hook for lazy loading
 */
export function useIntersectionObserver(
    options?: IntersectionObserverInit
): [React.RefCallback<Element>, boolean] {
    const [isIntersecting, setIsIntersecting] = useState(false);
    const [element, setElement] = useState<Element | null>(null);

    useEffect(() => {
        if (!element) return;

        const observer = new IntersectionObserver(([entry]) => {
            setIsIntersecting(entry.isIntersecting);
        }, options);

        observer.observe(element);

        return () => {
            observer.disconnect();
        };
    }, [element, options]);

    return [setElement, isIntersecting];
}
