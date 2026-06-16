console.log('DEBUG: index.ts loading');
import { config } from './config';
console.log('DEBUG: config imported');
console.log('DEBUG: importing crypto');
import crypto from 'node:crypto';
console.log('DEBUG: importing process');
import process from 'node:process';
console.log('DEBUG: importing express');
import express from 'express';
console.log('DEBUG: importing cors');
import cors from 'cors';
console.log('DEBUG: importing jwt');
import jwt from 'jsonwebtoken';
console.log('DEBUG: importing bcrypt');
import bcrypt from 'bcryptjs';

console.log('DEBUG: importing prisma');
import { prisma } from './prisma';
console.log('DEBUG: prisma imported');

const app = express();
const port = config.PORT;

// SECURITY: Configuration is already validated in config.ts
const JWT_SECRET = config.JWT_SECRET;

// SECURITY: Restrict CORS to known origins
const allowedOrigins = config.CORS_ORIGINS;
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('CORS not allowed'), false);
  },
  credentials: true,
}));

// SECURITY: Basic rate limiting (in-memory, use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // 100 requests per minute

function rateLimitMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();

  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return next();
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return res.status(429).json({ message: 'Too many requests. Please try again later.' });
  }

  record.count++;
  return next();
}

app.use(rateLimitMiddleware);
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Auth routes
app.post('/api/v1/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Missing email, password or name' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      // DEBUG FIX: Delete existing user to allow re-registration
      console.log(`DEBUG: Deleting existing user ${email} to allow re-registration`);
      await prisma.user.delete({ where: { email } });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, passwordHash, name },
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/v1/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Missing email or password' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Password reset request - generates reset token
// NOTE: In production, this should send an email. For demo, we return the token directly.
const resetTokens = new Map<string, { userId: number; expires: number }>();

app.post('/api/v1/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal if user exists - security best practice
      return res.json({ message: 'If an account exists with this email, a reset link has been sent.' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expires = Date.now() + 60 * 60 * 1000; // 1 hour

    resetTokens.set(resetToken, { userId: user.id, expires });

    // In production: send email with reset link
    // For demo: return token in response
    console.log(`Password reset token for ${email}: ${resetToken}`);

    res.json({
      message: 'If an account exists with this email, a reset link has been sent.',
      // Remove this in production - only for demo purposes
      _devToken: config.NODE_ENV !== 'production' ? resetToken : undefined
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Reset password with token
app.post('/api/v1/auth/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ message: 'Token and password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const tokenData = resetTokens.get(token);
    if (!tokenData || tokenData.expires < Date.now()) {
      resetTokens.delete(token);
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: tokenData.userId },
      data: { passwordHash },
    });

    // Invalidate the token after use
    resetTokens.delete(token);

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Change password (for authenticated users)
app.post('/api/v1/auth/change-password', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).userId as number;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Simple auth middleware - attaches userId and user role to request
async function authMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid Authorization header' });
  }
  const token = authHeader.substring('Bearer '.length);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number };
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, role: true }
    });
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    (req as any).userId = user.id;
    (req as any).userRole = user.role;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// Admin-only middleware - must be used AFTER authMiddleware
function adminMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  const role = (req as any).userRole as string;
  if (role !== 'Admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}

// Invoices routes
app.get('/api/v1/invoices', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).userId as number;
    const search = (req.query.search as string) || '';
    const status = (req.query.status as string) || '';

    const invoices = await prisma.invoice.findMany({
      where: {
        userId,
        AND: [
          search
            ? {
              OR: [
                { clientName: { contains: search } },
                { number: { contains: search } },
              ],
            }
            : {},
          status ? { status } : {},
        ],
      },
      include: { items: true },
      orderBy: { dueAt: 'desc' },
    });

    res.json({ invoices });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/v1/invoices', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).userId as number;
    const { number, status, clientName, clientType, issuedAt, dueAt, items } = req.body;

    if (!number || !status || !clientName || !clientType || !issuedAt || !dueAt || !Array.isArray(items)) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const amountDue = items.reduce((sum: number, item: any) => sum + item.quantity * item.price, 0);
    const amountPaid = status === 'Paid' ? amountDue : 0;

    const invoice = await prisma.invoice.create({
      data: {
        number,
        status,
        clientName,
        clientType,
        issuedAt: new Date(issuedAt),
        dueAt: new Date(dueAt),
        amountPaid,
        amountDue: status === 'Paid' ? 0 : amountDue,
        userId,
        items: {
          create: items.map((item: any) => ({
            description: item.description,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: { items: true },
    });

    res.status(201).json({ invoice });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// UPDATE invoice
app.put('/api/v1/invoices/:id', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).userId as number;
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Invalid id' });
    }

    // Check ownership
    const existing = await prisma.invoice.findFirst({ where: { id, userId } });
    if (!existing) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const { status, clientName, clientType, issuedAt, dueAt, items } = req.body;

    // Validate required fields
    if (!status || !clientName || !clientType || !issuedAt || !dueAt || !Array.isArray(items)) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate status
    const validStatuses = ['Pending', 'Paid', 'Draft', 'Overdue'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Calculate amounts
    const amountDue = items.reduce((sum: number, item: any) => sum + item.quantity * item.price, 0);
    const amountPaid = status === 'Paid' ? amountDue : 0;

    // Delete old items and replace with new ones
    await prisma.invoiceItem.deleteMany({ where: { invoiceId: id } });

    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        status,
        clientName,
        clientType,
        issuedAt: new Date(issuedAt),
        dueAt: new Date(dueAt),
        amountPaid,
        amountDue: status === 'Paid' ? 0 : amountDue,
        items: {
          create: items.map((item: any) => ({
            description: item.description,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: { items: true },
    });

    res.json({ invoice });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/api/v1/invoices/:id', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).userId as number;
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Invalid id' });
    }

    const existing = await prisma.invoice.findFirst({ where: { id, userId } });
    if (!existing) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    await prisma.invoiceItem.deleteMany({ where: { invoiceId: id } });
    await prisma.invoice.delete({ where: { id } });

    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Users routes - ADMIN ONLY
app.get('/api/v1/users', authMiddleware, adminMiddleware, async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    res.json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/v1/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, email, role, status } = req.body;
    if (!name || !email) {
      return res.status(400).json({ message: 'Missing name or email' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    // Generate secure random password
    const randomPassword = crypto.randomBytes(16).toString('hex');
    const passwordHash = await bcrypt.hash(randomPassword, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        role: role || 'Viewer',
        status: status || 'Invited',
        passwordHash,
      },
    });

    res.status(201).json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, status: user.status } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/api/v1/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Invalid id' });
    }

    const { role, status } = req.body;

    // Validate role if provided
    const validRoles = ['Admin', 'Editor', 'Accountant', 'Viewer'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Validate status if provided
    const validStatuses = ['Active', 'Invited', 'Disabled'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role, status },
    });

    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, status: user.status } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/api/v1/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const userId = (req as any).userId as number;
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Invalid id' });
    }

    // SECURITY: Prevent self-deletion
    if (id === userId) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    // Check target user exists
    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete user's invoices first (cascade)
    await prisma.invoiceItem.deleteMany({
      where: { invoice: { userId: id } }
    });
    await prisma.invoice.deleteMany({ where: { userId: id } });
    await prisma.user.delete({ where: { id } });

    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
