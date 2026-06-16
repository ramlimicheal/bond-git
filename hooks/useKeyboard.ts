import { useEffect, useCallback, useRef } from 'react';

type KeyHandler = (event: KeyboardEvent) => void;

interface ShortcutConfig {
    key: string;
    ctrl?: boolean;
    meta?: boolean;
    alt?: boolean;
    shift?: boolean;
    handler: KeyHandler;
    description?: string;
    preventDefault?: boolean;
}

/**
 * Hook for handling keyboard shortcuts
 */
export function useKeyboardShortcut(
    key: string,
    callback: KeyHandler,
    options: {
        ctrl?: boolean;
        meta?: boolean;
        alt?: boolean;
        shift?: boolean;
        preventDefault?: boolean;
        enabled?: boolean;
    } = {}
) {
    const {
        ctrl = false,
        meta = false,
        alt = false,
        shift = false,
        preventDefault = true,
        enabled = true,
    } = options;

    const callbackRef = useRef(callback);
    callbackRef.current = callback;

    useEffect(() => {
        if (!enabled) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            // Check if modifier keys match
            const ctrlMatch = ctrl ? event.ctrlKey : !event.ctrlKey || meta;
            const metaMatch = meta ? event.metaKey : !event.metaKey || ctrl;
            const altMatch = alt ? event.altKey : !event.altKey;
            const shiftMatch = shift ? event.shiftKey : !event.shiftKey;

            // Support both Ctrl and Cmd (for Mac compatibility)
            const modifierMatch = (ctrl || meta)
                ? (event.ctrlKey || event.metaKey) && altMatch && shiftMatch
                : ctrlMatch && metaMatch && altMatch && shiftMatch;

            if (event.key.toLowerCase() === key.toLowerCase() && modifierMatch) {
                if (preventDefault) {
                    event.preventDefault();
                }
                callbackRef.current(event);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [key, ctrl, meta, alt, shift, preventDefault, enabled]);
}

/**
 * Hook for handling multiple keyboard shortcuts at once
 */
export function useKeyboardShortcuts(
    shortcuts: ShortcutConfig[],
    enabled: boolean = true
) {
    useEffect(() => {
        if (!enabled) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            for (const shortcut of shortcuts) {
                const ctrlMatch = shortcut.ctrl ? event.ctrlKey : true;
                const metaMatch = shortcut.meta ? event.metaKey : true;
                const altMatch = shortcut.alt ? event.altKey : !event.altKey;
                const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;

                // Support both Ctrl and Cmd
                const modifierMatch = (shortcut.ctrl || shortcut.meta)
                    ? (event.ctrlKey || event.metaKey) && altMatch && shiftMatch
                    : altMatch && shiftMatch;

                if (
                    event.key.toLowerCase() === shortcut.key.toLowerCase() &&
                    modifierMatch
                ) {
                    if (shortcut.preventDefault !== false) {
                        event.preventDefault();
                    }
                    shortcut.handler(event);
                    break;
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [shortcuts, enabled]);
}

/**
 * Hook for Escape key handling (common pattern)
 */
export function useEscapeKey(callback: () => void, enabled: boolean = true) {
    useKeyboardShortcut('Escape', callback, { enabled, preventDefault: false });
}

/**
 * Hook for Enter key handling
 */
export function useEnterKey(callback: KeyHandler, enabled: boolean = true) {
    useKeyboardShortcut('Enter', callback, { enabled });
}

// Common keyboard shortcut presets
export const KEYBOARD_SHORTCUTS = {
    // Navigation
    GO_HOME: { key: 'h', meta: true, description: 'Go to Dashboard' },
    GO_ACCOUNTS: { key: 'u', meta: true, description: 'Go to Accounts' },

    // Actions
    NEW_INVOICE: { key: 'n', meta: true, description: 'Create new invoice' },
    SEARCH: { key: 'k', meta: true, description: 'Open search' },
    OPEN_COMMAND_PALETTE: { key: 'p', meta: true, shift: true, description: 'Open command palette' },

    // Edit
    SAVE: { key: 's', meta: true, description: 'Save' },
    DELETE: { key: 'Backspace', meta: true, description: 'Delete selected' },
    SELECT_ALL: { key: 'a', meta: true, description: 'Select all' },

    // View
    TOGGLE_DARK_MODE: { key: 'd', meta: true, shift: true, description: 'Toggle dark mode' },
    TOGGLE_SIDEBAR: { key: 'b', meta: true, description: 'Toggle sidebar' },
} as const;
