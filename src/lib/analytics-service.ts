export type AnalyticsEvent = {
    type: 'search' | 'view_tool' | 'view_page' | 'click_cta';
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
        // Debounce logic should ideally be handled in the component, 
        // but we'll log the final query here.
        AnalyticsService.logEvent('search', { query });
    },

    trackToolView: (toolId: string) => {
        AnalyticsService.logEvent('view_tool', { toolId });
    }
};
