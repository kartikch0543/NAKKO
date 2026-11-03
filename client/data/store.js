/**
 * NAKKO Platform - In-Memory Data Store & State Management
 * Provides realistic seed data and operations for workers, bookings, users, metrics, and logs.
 */

'use strict';

const services = [
  { id: 'srv-plumb', name: 'Plumbing', emoji: '🔧', rate: 250, unit: 'hr', desc: 'Pipe repair, leakage fixes, fixture installation' },
  { id: 'srv-carp', name: 'Carpentry', emoji: '🪚', rate: 300, unit: 'hr', desc: 'Furniture repair, door fitting, custom woodwork' },
  { id: 'srv-elec', name: 'Electrical', emoji: '⚡', rate: 200, unit: 'hr', desc: 'Switchboards, wiring, fan & light installation' },
  { id: 'srv-paint', name: 'Painting', emoji: '🎨', rate: 400, unit: 'hr', desc: 'Wall painting, touch-ups, waterproofing' },
  { id: 'srv-clean', name: 'Cleaning', emoji: '🧹', rate: 350, unit: 'job', desc: 'Deep home cleaning, kitchen & bathroom sanitization' },
  { id: 'srv-garden', name: 'Gardening', emoji: '🌿', rate: 200, unit: 'hr', desc: 'Lawn trimming, plant care, hedge cutting' },
  { id: 'srv-ac', name: 'AC Repair', emoji: '❄️', rate: 450, unit: 'job', desc: 'Gas filling, servicing, cooling diagnostics' },
  { id: 'srv-appliance', name: 'Appliances', emoji: '🔌', rate: 300, unit: 'job', desc: 'Washing machine, microwave & TV repair' }
];

const workers = [
  {
    id: 'w-101',
    name: 'Ramesh Kumar',
    skill: 'Plumbing',
    rating: 4.9,
    reviewsCount: 284,
    experience: '8 years',
    phone: '+91 91234 56789',
    city: 'Noida, Uttar Pradesh',
    avatar: 'R',
    avatarBg: '#d8f3dc',
    avatarColor: '#2d6a4f',
    isAvailable: true,
    distanceKm: 1.2,
    etaMinutes: 12,
    completionRate: 98,
    earningsThisMonth: 18450,
    earningsToday: 1250,
    totalJobs: 142
  },
  {
    id: 'w-102',
    name: 'Mohan Singh',
    skill: 'Plumbing',
    rating: 4.7,
    reviewsCount: 164,
    experience: '5 years',
    phone: '+91 98765 12340',
    city: 'Greater Noida, UP',
    avatar: 'M',
    avatarBg: '#e8f4f8',
    avatarColor: '#457b9d',
    isAvailable: true,
    distanceKm: 2.5,
    etaMinutes: 25,
    completionRate: 95,
    earningsThisMonth: 14200,
    earningsToday: 800,
    totalJobs: 98
  },
  {
    id: 'w-103',
    name: 'Sunita Devi',
    skill: 'Cleaning',
    rating: 4.95,
    reviewsCount: 312,
    experience: '6 years',
    phone: '+91 94567 89012',
    city: 'Sector 62, Noida',
    avatar: 'S',
    avatarBg: '#fef3c7',
    avatarColor: '#d97706',
    isAvailable: true,
    distanceKm: 1.8,
    etaMinutes: 18,
    completionRate: 99,
    earningsThisMonth: 22100,
    earningsToday: 1400,
    totalJobs: 210
  },
  {
    id: 'w-104',
    name: 'Mohan Yadav',
    skill: 'Electrical',
    rating: 4.8,
    reviewsCount: 198,
    experience: '7 years',
    phone: '+91 93456 78901',
    city: 'Indirapuram, Ghaziabad',
    avatar: 'Y',
    avatarBg: '#ede9fe',
    avatarColor: '#6b46c1',
    isAvailable: false,
    distanceKm: 3.1,
    etaMinutes: 30,
    completionRate: 96,
    earningsThisMonth: 16800,
    earningsToday: 0,
    totalJobs: 115
  },
  {
    id: 'w-105',
    name: 'Lakshmi Narayan',
    skill: 'Gardening',
    rating: 4.85,
    reviewsCount: 140,
    experience: '4 years',
    phone: '+91 92345 67890',
    city: 'Sector 15, Noida',
    avatar: 'L',
    avatarBg: '#d8f3dc',
    avatarColor: '#2d6a4f',
    isAvailable: true,
    distanceKm: 2.0,
    etaMinutes: 20,
    completionRate: 97,
    earningsThisMonth: 12600,
    earningsToday: 700,
    totalJobs: 82
  }
];

const bookings = [
  {
    id: 'NK-0042',
    userId: 'u-1',
    userName: 'Divyanshu Sharma',
    userPhone: '+91 98765 43210',
    userAddress: 'Block 4, Sector 12, Noida, UP',
    service: 'Plumbing',
    workerId: 'w-101',
    workerName: 'Ramesh Kumar',
    workerPhone: '+91 91234 56789',
    status: 'in_progress', // requested | accepted | in_progress | completed | cancelled
    date: 'Today, 2:30 PM',
    createdAt: new Date().toISOString(),
    amount: 450,
    notes: 'Kitchen sink pipe leaking water rapidly under counter',
    trackingSteps: [
      { label: 'Booking Confirmed', done: true, time: '2:15 PM' },
      { label: 'Worker Assigned (Ramesh K.)', done: true, time: '2:18 PM' },
      { label: 'On the Way (12 min away)', done: true, time: '2:25 PM' },
      { label: 'Work in Progress', done: true, time: '2:35 PM' },
      { label: 'Completed & Payment Released', done: false, time: 'Pending' }
    ]
  },
  {
    id: 'NK-0041',
    userId: 'u-2',
    userName: 'Priya Sharma',
    userPhone: '+91 98111 22334',
    userAddress: 'Flat 502, Tower B, ATS Greens, Noida',
    service: 'Deep Cleaning',
    workerId: 'w-103',
    workerName: 'Sunita Devi',
    workerPhone: '+91 94567 89012',
    status: 'completed',
    date: 'Oct 28, 2026',
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    amount: 600,
    notes: 'Complete 2BHK flat sanitization before festival',
    rating: 5,
    review: 'House was left spotless. Very punctual and respectful!'
  },
  {
    id: 'NK-0040',
    userId: 'u-1',
    userName: 'Divyanshu Sharma',
    userPhone: '+91 98765 43210',
    userAddress: 'Block 4, Sector 12, Noida, UP',
    service: 'Electrical Work',
    workerId: 'w-104',
    workerName: 'Mohan Yadav',
    workerPhone: '+91 93456 78901',
    status: 'completed',
    date: 'Oct 15, 2026',
    createdAt: new Date(Date.now() - 19 * 86400000).toISOString(),
    amount: 380,
    notes: 'MCB tripping repeatedly in main bedroom circuit',
    rating: 5,
    review: 'Resolved root cause quickly without extra part cost.'
  },
  {
    id: 'NK-0039',
    userId: 'u-3',
    userName: 'Aditya Menon',
    userPhone: '+91 97777 88899',
    userAddress: 'B-14, Jaypee Greens, Greater Noida',
    service: 'Gardening',
    workerId: 'w-105',
    workerName: 'Lakshmi Narayan',
    workerPhone: '+91 92345 67890',
    status: 'completed',
    date: 'Sep 30, 2026',
    createdAt: new Date(Date.now() - 34 * 86400000).toISOString(),
    amount: 350,
    notes: 'Lawn mowing and balcony plant repotting',
    rating: 4
  }
];

const logs = [
  { timestamp: '2026-11-03 21:50:12', level: 'INFO', message: 'Worker Ramesh Kumar accepted job #NK-0042' },
  { timestamp: '2026-11-03 21:48:38', level: 'INFO', message: 'Booking #NK-0042 created by user Divyanshu Sharma' },
  { timestamp: '2026-11-03 21:40:22', level: 'INFO', message: 'Payment ₹600 released to Sunita Devi for booking #NK-0041' },
  { timestamp: '2026-11-03 21:30:15', level: 'WARN', message: 'Notification latency peak at 420ms (Cloud SMS gateway)' },
  { timestamp: '2026-11-03 21:15:00', level: 'INFO', message: 'Worker Sunita Devi marked job #NK-0041 completed' },
  { timestamp: '2026-11-03 20:55:18', level: 'INFO', message: 'New worker registered: Lakshmi Narayan (Gardening)' },
  { timestamp: '2026-11-03 20:30:00', level: 'INFO', message: 'Automated database snapshot backup completed successfully' }
];

const platformConfig = {
  maintenanceMode: false,
  newRegistrations: true,
  autoKyc: false,
  emailNotifications: true,
  smsNotifications: true,
  commissionPercent: 12,
  payoutWindowHours: 48,
  minBookingAmount: 100
};

module.exports = {
  getServices() {
    return services;
  },
  getServiceById(id) {
    return services.find(s => s.id === id);
  },
  getWorkers(skill) {
    if (!skill) return workers;
    return workers.filter(w => w.skill.toLowerCase() === skill.toLowerCase());
  },
  getWorkerById(id) {
    return workers.find(w => w.id === id);
  },
  setWorkerAvailability(workerId, isAvailable) {
    const worker = workers.find(w => w.id === workerId);
    if (worker) {
      worker.isAvailable = Boolean(isAvailable);
      return worker;
    }
    return null;
  },
  getBookings() {
    return bookings;
  },
  getBookingById(id) {
    return bookings.find(b => b.id === id);
  },
  createBooking({ service, address, scheduledTime, notes, workerId }) {
    const srv = services.find(s => s.name.toLowerCase() === service.toLowerCase()) || services[0];
    const worker = workerId ? workers.find(w => w.id === workerId) : workers.find(w => w.isAvailable && w.skill === srv.name) || workers[0];
    
    const newBooking = {
      id: `NK-00${bookings.length + 43}`,
      userId: 'u-1',
      userName: 'Divyanshu Sharma',
      userPhone: '+91 98765 43210',
      userAddress: address || 'Block 4, Sector 12, Noida, UP',
      service: srv.name,
      workerId: worker ? worker.id : 'w-101',
      workerName: worker ? worker.name : 'Ramesh Kumar',
      workerPhone: worker ? worker.phone : '+91 91234 56789',
      status: 'accepted',
      date: scheduledTime || 'Today, within 1 hour',
      createdAt: new Date().toISOString(),
      amount: srv.rate,
      notes: notes || 'Standard service request',
      trackingSteps: [
        { label: 'Booking Confirmed', done: true, time: 'Just now' },
        { label: `Worker Assigned (${worker.name})`, done: true, time: 'Just now' },
        { label: `On the Way (~${worker.etaMinutes} min away)`, done: true, time: 'Pending' },
        { label: 'Work in Progress', done: false, time: 'Pending' },
        { label: 'Completed & Payment Released', done: false, time: 'Pending' }
      ]
    };

    bookings.unshift(newBooking);
    logs.unshift({
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      level: 'INFO',
      message: `Booking #${newBooking.id} (${newBooking.service}) created by user Divyanshu Sharma`
    });

    return newBooking;
  },
  updateBookingStatus(bookingId, status) {
    const b = bookings.find(item => item.id === bookingId);
    if (b) {
      b.status = status;
      if (status === 'completed') {
        b.trackingSteps.forEach(s => s.done = true);
      }
      logs.unshift({
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        level: 'INFO',
        message: `Booking #${bookingId} status updated to: ${status}`
      });
      return b;
    }
    return null;
  },
  getMetrics() {
    const activeBookingsCount = bookings.filter(b => b.status === 'in_progress' || b.status === 'accepted').length;
    const completedBookings = bookings.filter(b => b.status === 'completed');
    const totalVolume = bookings.reduce((sum, b) => sum + (b.amount || 0), 0);
    return {
      activeWorkers: workers.filter(w => w.isAvailable).length,
      totalWorkers: 12480,
      activeJobs: activeBookingsCount,
      completedJobs: 56340 + completedBookings.length,
      completionRate: '98.4%',
      avgRating: 4.88,
      platformRevenueMonth: '₹4,82,300',
      apiUptime: '99.98%',
      avgLatencyMs: 42,
      activeUsers: 34200
    };
  },
  getLogs() {
    return logs;
  },
  addLog(level, message) {
    logs.unshift({
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      level,
      message
    });
    if (logs.length > 50) logs.pop();
  },
  getConfig() {
    return platformConfig;
  },
  updateConfig(newConfig) {
    Object.assign(platformConfig, newConfig);
    return platformConfig;
  }
};

