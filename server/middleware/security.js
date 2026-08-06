import helmet from 'helmet';
import hpp from 'hpp';

/**
 * Input Sanitization Middleware to prevent XSS & Injection attacks
 */
export function sanitizeInputs(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    sanitizeObject(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    sanitizeObject(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    sanitizeObject(req.params);
  }
  next();
}

function sanitizeObject(obj) {
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      // Clean script tags, HTML injection, and dangerous characters
      obj[key] = obj[key]
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/--|\/\*|\*\//g, ''); // Strip SQL comment markers
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitizeObject(obj[key]);
    }
  }
}

/**
 * Comprehensive Express Security Middleware Pipeline
 */
export function applySecurityMiddleware(app) {
  // 1. Hide Server Signature
  app.disable('x-powered-by');

  // 2. Helmet HTTP Header Security Hardening
  app.use(
    helmet({
      contentSecurityPolicy: false, // Allowed for inline React dynamic assets
      crossOriginEmbedderPolicy: false,
      frameguard: { action: 'deny' }, // Clickjacking protection
      noSniff: true, // MIME-type sniffing protection
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
    })
  );

  // 3. HTTP Parameter Pollution Protection
  app.use(hpp());

  // 4. Input Sanitization
  app.use(sanitizeInputs);
}
