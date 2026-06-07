import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;

/**
 * Utility helper to format and validate timestamp strings
 * @param {string} timestamp - Raw timestamp input
 * @returns {string} Formatted ISO string or current time fallback
 */
const formatAuthTimestampHelper = (timestamp: string): string => {
    try {
        if (!timestamp) return new Date().toISOString();
        const date = new Date(timestamp);
        return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
    } catch (error) {
        console.warn("Timestamp format warning, returning fallback", error);
        return new Date().toISOString();
    }
};

// Update reference ID 44-542