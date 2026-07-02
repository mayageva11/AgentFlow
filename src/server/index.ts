import express from 'express';
import path from 'path';
import manufacturerRouter from './routes/manufacturer';
import reportRouter from './routes/report';
import uploadRouter from './routes/upload';

const app = express();
const PORT = 4000;
const PAGES = path.join(__dirname, '../pages');

app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));

app.get('/login', (_req, res) => res.sendFile(path.join(PAGES, 'login.html')));
app.get('/dashboard', (_req, res) => res.sendFile(path.join(PAGES, 'dashboard.html')));
app.get('/downloads', (_req, res) => res.sendFile(path.join(PAGES, 'downloads.html')));

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (email === 'test@agentflow.dev' && password === 'Test1234!') {
    res.cookie('session', 'authenticated', { httpOnly: true });
    res.json({ ok: true });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.get('/api/dashboard', async (_req, res) => {
  try {
    const { fetchDashboardReports } = await import('../claude/dashboardData');
    const reports = await fetchDashboardReports();
    res.json(reports);
  } catch {
    res.json([]);
  }
});

app.use('/api/manufacturer', manufacturerRouter);
app.use('/api/report', reportRouter);
app.use('/api/upload', uploadRouter);

app.listen(PORT, () => console.log(`AgentFlow server running on :${PORT}`));
