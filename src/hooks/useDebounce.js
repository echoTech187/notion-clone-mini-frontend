import { useEffect, useState } from 'react';

// Custom hook untuk debouncing nilai
export function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        // Set debouncedValue ke value setelah delay
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Batalkan timeout jika value berubah (atau komponen unmount)
        // agar tidak memicu update yang tidak perlu
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]); // Hanya re-run jika value atau delay berubah

    return debouncedValue;
}