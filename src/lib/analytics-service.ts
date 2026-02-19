export type AnalyticsEvent = {
    type: 'search' | 'view_tool' | 'view_page' | 'click_cta' | 'visitor';
    data: Record<string, unknown>;
    url: string;
    timestamp?: Date;
    userAgent?: string;
    ip?: string;
    userId?: string;
    createdAt?: Date | string;
};

export const AnalyticsService = {
    logEvent: async (type: AnalyticsEvent['type'], data: Record<string, unknown>) => {
        try {
            await fetch('/api/analytics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type,
                    data,
                    url: window.location.href,
                    timestamp: new Date(),
                }),
            });
        } catch (error) {
            console.error('Failed to log analytics event:', error);
        }
    },

    trackSearch: (query: string) => {
        if (!query || query.trim().length < 2) return;
        AnalyticsService.logEvent('search', { query });
    },

    trackToolView: (toolId: string) => {
        AnalyticsService.logEvent('view_tool', { toolId });
    },

    trackVisit: () => {
        if (typeof window === 'undefined') return;

        // Simple session tracking to avoid tracking every page reload as a new visit immediately
        // For real unique visitors, backend IP tracking is more reliable (which we handle in the API).
        // This frontend check just reduces unnecessary API calls.
        const LAST_VISIT_KEY = 'last_visit_timestamp';
        const now = Date.now();
        const lastVisit = localStorage.getItem(LAST_VISIT_KEY);
        const ONE_HOUR = 60 * 60 * 1000;

        if (!lastVisit || (now - parseInt(lastVisit)) > ONE_HOUR) {
            AnalyticsService.logEvent('visitor', { referrer: document.referrer });
            localStorage.setItem(LAST_VISIT_KEY, now.toString());
        }
    }
};
