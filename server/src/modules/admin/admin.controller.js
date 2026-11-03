/**
 * NAKKO Backend - Admin & Developer Controller
 * Platform telemetry, live event logging & cooperative governance config
 */

let platformConfig = {
  commissionPercent: 12,
  payoutWindowHours: 24,
  minBookingAmount: 100,
  maintenanceMode: false,
  newRegistrationsAllowed: true,
  instantKycEnabled: true
};

const serverLogs = [
  { id: 1, level: 'INFO', message: 'Express.js backend server listening on port 5000', timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: 2, level: 'INFO', message: 'Worker Ramesh Kumar toggled status to AVAILABLE', timestamp: new Date(Date.now() - 1800000).toISOString() },
  { id: 3, level: 'INFO', message: 'Booking #NK-0042 created with escrow ₹450 held', timestamp: new Date(Date.now() - 600000).toISOString() },
  { id: 4, level: 'WARN', message: 'SMS gateway latency spike: 420ms (retry scheduled)', timestamp: new Date(Date.now() - 300000).toISOString() }
];

export function getMetrics(req, res) {
  return res.json({
    success: true,
    data: {
      grossVolume: '₹4.82L',
      grossVolumeGrowth: '+24.3%',
      registeredWorkers: 12480,
      registeredWorkersGrowth: '+340 this week',
      jobCompletionRate: '98.4%',
      jobCompletionQuality: '+0.3% quality index',
      apiLatencyP99: '42ms',
      apiStatus: 'Operational & Fast',
      timestamp: new Date().toISOString()
    }
  });
}

export function getLogs(req, res) {
  const { level } = req.query;
  let logs = [...serverLogs];

  if (level && level.toUpperCase() !== 'ALL') {
    logs = logs.filter(l => l.level.toUpperCase() === level.toUpperCase());
  }

  return res.json({
    success: true,
    count: logs.length,
    data: logs
  });
}

export function addLogEntry(level, message) {
  serverLogs.unshift({
    id: serverLogs.length + 1,
    level: level.toUpperCase(),
    message,
    timestamp: new Date().toISOString()
  });
  if (serverLogs.length > 200) serverLogs.pop();
}

export function getConfig(req, res) {
  return res.json({
    success: true,
    data: platformConfig
  });
}

export function updateConfig(req, res) {
  const { commissionPercent, payoutWindowHours, minBookingAmount, maintenanceMode } = req.body;

  if (commissionPercent !== undefined) platformConfig.commissionPercent = Number(commissionPercent);
  if (payoutWindowHours !== undefined) platformConfig.payoutWindowHours = Number(payoutWindowHours);
  if (minBookingAmount !== undefined) platformConfig.minBookingAmount = Number(minBookingAmount);
  if (maintenanceMode !== undefined) platformConfig.maintenanceMode = Boolean(maintenanceMode);

  addLogEntry('INFO', `Platform config updated by admin: commission=${platformConfig.commissionPercent}%`);

  return res.json({
    success: true,
    message: 'Platform configuration updated successfully.',
    data: platformConfig
  });
}

