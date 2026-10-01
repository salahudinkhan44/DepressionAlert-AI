// Express app assembly.
// Middleware: JSON parsing, CORS (CLIENT_URL), auth, consent, errors.
// Routers mounted under /api per SRS 6.2 interfaces:
//   /api/auth            register, login, logout, password reset
//   /api/users           profile + consent + settings + viewer caseload
//   /api/submissions     manual text submission + CSV upload + posts
//   /api/analysis        latest result + analysis history + detail
//   /api/trends          behavioral-trend retrieval
//   /api/alerts          alert retrieval + status updates (Viewed/Dismissed)
//   /api/crisis-support  crisis-support resource retrieval
//   /api/dashboard       aggregated summary + live monitor feed (M6)
import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { notFound, errorHandler } from './middleware/errorHandler.middleware.js';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import submissionRoutes from './routes/submission.routes.js';
import analysisRoutes from './routes/analysis.routes.js';
import trendRoutes from './routes/trend.routes.js';
import alertRoutes from './routes/alert.routes.js';
import crisisSupportRoutes from './routes/crisisSupport.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';

const app = express();

app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));
app.use(cors({
  origin: config.clientUrl,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.get('/api/health', (req, res) => res.json({ ok: true, service: 'depressionalert-ai-backend' }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/trends', trendRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/crisis-support', crisisSupportRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
