import { computeAnalyticsService } from '../services/analyticsService.js';

// Analytics controller: validates query params and returns aggregated data.
export async function analytics(req, res) {
  const { from, to } = req.query;
  try {
    const data = await computeAnalyticsService({ from, to });
    return res.json(data);
    //example output:
    // [
    //   { roomId: 'A101', roomName: 'Meeting Room A101', totalHours: 12.5, totalRevenue: 250.00 },
    //   { roomId: 'A102', roomName: 'Meeting Room A102', totalHours: 8.0, totalRevenue: 160.00 }
    // ]
  } catch (e) {
    const code = e.code;
    if (code === 'VALIDATION_ERROR') return res.status(400).json({ error: e.message });
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}