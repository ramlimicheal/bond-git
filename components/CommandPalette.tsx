import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Icons } from './Icon';
import { useKeyboardShortcut, useEscapeKey } from '../hooks/useKeyboard';
import { useDebounce } from '../hooks/usePerformance';

interface Command {
    id: string;
    label: string;
    icon?: React.ReactNode;
    shortcut?: string;
    group?: string;
    action: () => void;
}

interface CommandPaletteProps {
    commands: Command[];
    isOpen: boolean;
    onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
    commands,
    isOpen,
    onClose,
}) => {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    const debouncedQuery = useDebounce(query, 150);

    // Filter commands based on query
    const filteredCommands = useMemo(() => {
        if (!debouncedQuery.trim()) return commands;
        const lowerQuery = debouncedQuery.toLowerCase();
        return commands.filter(
            cmd =>
                cmd.label.toLowerCase().includes(lowerQuery) ||
                cmd.group?.toLowerCase().includes(lowerQuery)
        );
    }, [commands, debouncedQuery]);

    // Group commands
    const groupedCommands = useMemo(() => {
        const groups = new Map<string, Command[]>();
        for (const cmd of filteredCommands) {
            const group = cmd.group || 'Actions';
            if (!groups.has(group)) {
                groups.set(group, []);
            }
            groups.get(group)!.push(cmd);
        }
        return groups;
    }, [filteredCommands]);

    // Reset selection when filter changes
    useEffect(() => {
        setSelectedIndex(0);
    }, [debouncedQuery]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 10);
        }
    }, [isOpen]);

    // Handle escape
    useEscapeKey(() => {
        if (isOpen) onClose();
    }, isOpen);

    // Keyboard navigation
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(i => Math.min(i + 1, filteredCommands.length - 1));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(i => Math.max(i - 1, 0));
                break;
            case 'Enter':
                e.preventDefault();
                if (filteredCommands[selectedIndex]) {
                    filteredCommands[selectedIndex].action();
                    onClose();
                }
                break;
        }
    }, [filteredCommands, selectedIndex, onClose]);

    // Scroll selected item into view
    useEffect(() => {
        const selectedEl = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
        selectedEl?.scrollIntoView({ block: 'nearest' });
    }, [selectedIndex]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-start justify-center pt-[15vh]">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-scaleIn">
                {/* Search Input */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                    <Icons.Search size={20} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a command or search..."
                        className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none text-sm"
                    />
                    <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-xs font-medium text-gray-400 bg-gray-100 dark:bg-gray-800 rounded">
                        ESC
                    </kbd>
                </div>

                {/* Command List */}
                <div
                    ref={listRef}
                    className="max-h-80 overflow-y-auto py-2"
                >
                    {filteredCommands.length === 0 ? (
                        <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                            No commands found
                        </div>
                    ) : (
                        Array.from(groupedCommands.entries()).map(([group, cmds]) => (
                            <div key={group}>
                                <div className="px-4 py-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                                    {group}
                                </div>
                                {cmds.map((cmd) => {
                                    const globalIndex = filteredCommands.indexOf(cmd);
                                    const isSelected = globalIndex === selectedIndex;

                                    return (
                                        <button
                                            key={cmd.id}
                                            data-index={globalIndex}
                                            onClick={() => {
                                                cmd.action();
                                                onClose();
                                            }}
                                            className={`
                        w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors
                        ${isSelected
                                                    ? 'bg-gray-50 dark:bg-gray-900/20 text-primary-600 dark:text-primary-400'
                                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                                }
                      `}
                                        >
                                            {cmd.icon && (
                                                <span className={isSelected ? 'text-primary-500' : 'text-gray-400'}>
                                                    {cmd.icon}
                                                </span>
                                            )}
                                            <span className="flex-1 text-sm font-medium">{cmd.label}</span>
                                            {cmd.shortcut && (
                                                <kbd className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                                                    {cmd.shortcut}
                                                </kbd>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
                    <span>
                        <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded mr-1">↑↓</kbd>
                        Navigate
                    </span>
                    <span>
                        <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded mr-1">↵</kbd>
                        Select
                    </span>
                </div>
            </div>
        </div>
    );
};

// Hook to manage command palette state
export function useCommandPalette() {
    const [isOpen, setIsOpen] = useState(false);

    const open = useCallback(() => setIsOpen(true), []);
    const close = useCallback(() => setIsOpen(false), []);
    const toggle = useCallback(() => setIsOpen(prev => !prev), []);

    // Global shortcut to open command palette (Cmd+Shift+P or Ctrl+Shift+P)
    useKeyboardShortcut('p', toggle, { meta: true, shift: true });

    // Also support Cmd+K
    useKeyboardShortcut('k', toggle, { meta: true });

    return { isOpen, open, close, toggle };
}
