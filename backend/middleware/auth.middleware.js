import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';

// Protect routes - require authentication
export const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      if (req.user.status !== 'active') {
        return res.status(403).json({
          success: false,
          message: 'Account is not active'
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: error.message
    });
  }
};

// Role-based access control
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
    }
    next();
  };
};

// Check if user owns resource or is admin
export const authorizeOwnerOrAdmin = (resourceUserId) => {
  return (req, res, next) => {
    if (req.user.role === 'admin' || req.user._id.toString() === resourceUserId.toString()) {
      return next();
    }
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this resource'
    });
  };
};

/** Blocks agents until they redeem the admin-issued license code (role check: agent only). */
export const blockUnverifiedAgent = (req, res, next) => {
  if (req.user.role !== 'agent') return next();
  if (req.user.agentProfile?.verified === true) return next();
  return res.status(403).json({
    success: false,
    code: 'AGENT_LICENSE_REQUIRED',
    message: 'Enter your approval license code on the agent dashboard to unlock this feature.',
  });
};
