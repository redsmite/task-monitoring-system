import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export default forwardRef(function TextInput(
    { type = 'text', className = '', isFocused = false, ...props },
    ref
) {
    const localRef = useRef(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <input
            {...props}
            type={type}
            ref={localRef}
            className={[
                // Base
                'w-full rounded-md px-3 py-2 text-sm transition-colors',

                // Background
                'bg-white text-gray-900',
                'dark:bg-stone-900 dark:text-gray-100',

                // Border
                'border border-gray-300',
                'dark:border-stone-700',

                // Placeholder
                'placeholder-gray-400',
                'dark:placeholder-gray-500',

                // Focus
                'focus:outline-none focus:ring-2 focus:ring-indigo-500',
                'focus:border-indigo-500',
                'dark:focus:ring-indigo-400',

                // Disabled
                'disabled:bg-gray-100 disabled:text-gray-500',
                'dark:disabled:bg-stone-800 dark:disabled:text-gray-400',

                className,
            ].join(' ')}
        />
    );
});
