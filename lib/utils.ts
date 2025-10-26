import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function unescapeString(str: string): string {
  return str
    .replace(/\\"/g, '"') // Unescape double quotes
    .replace(/\\'/g, "'") // Unescape single quotes
    .replace(/\\n/g, "\n") // Unescape newlines
    .replace(/\\t/g, "\t") // Unescape tabs
    .replace(/\\r/g, "\r") // Unescape carriage returns
    .replace(/\\\\/g, "\\"); // Unescape backslashes (must be last)
}
