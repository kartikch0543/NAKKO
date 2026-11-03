/**
 * NAKKO Platform - Authentication & User API Routes
 */

'use strict';

const express = require('express');
const router = express.Router();
const store = require('../data/store');

// Mock User Database for demo
const mockUsers = [
  { id: 'u-1', name: 'Divyanshu Sharma', email: 'divyanshu@example.com', role: 'user', phone: '+91 98765 43210' },
  { id: 'w-101', name: 'Ramesh Kumar', email: 'ramesh@nakko.in', role: 'worker', phone: '+91 91234 56789' },
  { id: 'd-1', name: 'Divyanshu (Dev)', email: 'admin@nakko.in', role: 'dev', phone: '+91 99999 88888' }
];

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide email and password' });
  }

  // Find or determine mock user by role/email
  const selectedRole = role || 'user';
  let targetUrl = '/dashboard/user';
  if (selectedRole === 'worker') targetUrl = '/dashboard/worker';
  if (selectedRole === 'dev') targetUrl = '/dashboard/dev';

  const user = mockUsers.find(u => u.email === email && u.role === selectedRole) || {
    id: `u-${Date.now()}`,
    name: email.split('@')[0],
    email,
    role: selectedRole
  };

  store.addLog('INFO', `User login: ${email} as [${selectedRole}]`);

  return res.json({
    success: true,
    message: 'Login successful',
    user,
    redirectUrl: targetUrl
  });
});

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { firstName, lastName, email, phone, password, role, skill, experience } = req.body;

  if (!firstName || !email || !password) {
    return res.status(400).json({ success: false, message: 'First name, email, and password are required' });
  }

  const selectedRole = role || 'user';
  const fullName = `${firstName} ${lastName || ''}`.trim();

  let targetUrl = '/dashboard/user';
  if (selectedRole === 'worker') targetUrl = '/dashboard/worker';
  if (selectedRole === 'dev') targetUrl = '/dashboard/dev';

  const newUser = {
    id: `u-${Date.now()}`,
    name: fullName,
    email,
    phone: phone || '',
    role: selectedRole,
    skill: skill || null,
    experience: experience || null
  };

  mockUsers.push(newUser);
  store.addLog('INFO', `New account registered: ${fullName} (${email}) as [${selectedRole}]`);

  return res.status(201).json({
    success: true,
    message: 'Account created successfully! Welcome to NAKKO 🎉',
    user: newUser,
    redirectUrl: targetUrl
  });
});

// GET /api/auth/me
router.get('/me', (req, res) => {
  // Default demo user
  res.json({
    success: true,
    user: mockUsers[0]
  });
});

module.exports = router;

