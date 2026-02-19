'use client';

import { useEffect } from 'react';
import { AnalyticsService } from '@/lib/analytics-service';

export default function VisitorTracker() {
    useEffect(() => {
        AnalyticsService.trackVisit();
    }, []);

    return null;
}
