import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { clearTimeout } from "timers";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function debounce(func: () => void, wait: number) {
    let timeout: NodeJS.Timeout | null = null;
    if (timeout) {
        clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
        func();
    }, wait);
}
