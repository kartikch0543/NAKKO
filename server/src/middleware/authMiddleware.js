/**
 * NAKKO Backend - Authentication & Role Verification Middleware
 */

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Missing or malformed authorization token.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Decode token or payload
    // In production: jwt.verify(token, process.env.JWT_SECRET)
    // Supports Base64 encoded payload or JWT structure
    let decoded;
    if (token.includes('.')) {
      const parts = token.split('.');
      decoded = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
    } else {
      decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session token.'
    });
  }
}

export function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const userRole = (req.user.role || '').toLowerCase();
    const normalizedAllowed = allowedRoles.map(r => r.toLowerCase());

    if (!normalizedAllowed.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access requires one of [${allowedRoles.join(', ')}] role(s).`
      });
    }

    next();
  };
}
