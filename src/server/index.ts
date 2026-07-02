import express from 'express';
import path from 'path';
import manufacturerRouter from './routes/manufacturer';
import reportRouter from './routes/report';
import uploadRouter from './routes/upload';

const app = express();
const PORT = 4000;
const PAGES = path.join(__dirname, '../pages');

const USERS: Record<string, { agencyId: string; password: string }> = {
  'test@agentflow.dev':     { agencyId: 'agency-a', password: 'Test1234!' },
  'agency-a@agentflow.dev': { agencyId: 'agency-a', password: 'Test1234!' },
  'agency-b@agentflow.dev': { agencyId: 'agency-b', password: 'Test1234!' },
};

app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));

app.get('/login',     (_req, res) => res.sendFile(path.join(PAGES, 'login.html')));
app.get('/dashboard', (_req, res) => res.sendFile(path.join(PAGES, 'dashboard.html')));
app.get('/downloads', (_req, res) => res.sendFile(path.join(PAGES, 'downloads.html')));

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = USERS[email];
  if (user && user.password === password) {
    res.cookie('session', JSON.stringify({ agencyId: user.agencyId }), { httpOnly: true });
    res.json({ ok: true });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.get('/api/dashboard', (_req, res) => {
  const { manufacturers, reports, uploadHistory } = require('./state') as typeof import('./state');
  res.json({
    manufacturers: manufacturers.size,
    reports:       reports.size,
    uploads:       uploadHistory.slice(0, 10),
  });
});

app.use('/api/manufacturer', manufacturerRouter);
app.use('/api/report', reportRouter);
app.use('/api/upload', uploadRouter);

app.listen(PORT, () => console.log(`AgentFlow server running on :${PORT}`));
