// useAdminAnalytics
// Encapsulates analytics state, initialization, and fetch logic.
import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import { toast } from 'react-hot-toast';

export function useAdminAnalytics() {
  const [analytics, setAnalytics] = useState([]);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [analyticsError, setAnalyticsError] = useState('');

  // Initialize last 7 days
  useEffect(() => {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    const fmt = (d) => d.toISOString().slice(0, 10);
    setDateRange({ startDate: fmt(sevenDaysAgo), endDate: fmt(today) });
  }, []);

  const totalRevenue = useMemo(() => analytics.reduce((sum, item) => sum + item.totalRevenue, 0), [analytics]);
  const totalHours = useMemo(() => analytics.reduce((sum, item) => sum + item.totalHours, 0), [analytics]);
  const averageRate = useMemo(() => (totalHours > 0 ? (totalRevenue / totalHours).toFixed(0) : 0), [totalHours, totalRevenue]);

  const handleGetAnalytics = async () => {
    const { startDate, endDate } = dateRange;
    if (!startDate || !endDate) {
      toast.error('Please select start and end dates');
      return;
    }
    setLoadingAnalytics(true);
    setAnalyticsError('');
    try {
      const data = await api.getAnalytics(startDate, endDate);
      setAnalytics(data || []);
    } catch (e) {
      setAnalyticsError(e.message || 'Failed to load analytics');
    } finally {
      setLoadingAnalytics(false);
    }
  };

  return {
    analytics,
    dateRange,
    setDateRange,
    loadingAnalytics,
    analyticsError,
    handleGetAnalytics,
    totalRevenue,
    totalHours,
    averageRate,
  };
}