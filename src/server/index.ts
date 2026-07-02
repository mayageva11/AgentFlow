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
app.use(express.static(PAGES));

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

const DASHBOARD_DEMO = [
  { manufacturer: 'מנורה מבטחים', month: '06-2025', category: 'life',     totalCommission: 128400, policyCount: 87,  status: 'processed' },
  { manufacturer: 'הפניקס ביטוח', month: '06-2025', category: 'health',   totalCommission: 94250,  policyCount: 63,  status: 'processed' },
  { manufacturer: 'הראל ביטוח',   month: '05-2025', category: 'pension',  totalCommission: 211800, policyCount: 142, status: 'processed' },
  { manufacturer: 'מגדל ביטוח',   month: '05-2025', category: 'property', totalCommission: 67900,  policyCount: 44,  status: 'pending'   },
  { manufacturer: 'כלל ביטוח',    month: '04-2025', category: 'life',     totalCommission: 154600, policyCount: 103, status: 'processed' },
];

app.get('/api/dashboard', (_req, res) => {
  const { commissionData } = require('./state') as typeof import('./state');
  res.json(commissionData.length > 0 ? commissionData : DASHBOARD_DEMO);
});

app.use('/api/manufacturer', manufacturerRouter);
app.use('/api/report', reportRouter);
app.use('/api/upload', uploadRouter);

app.listen(PORT, () => console.log(`AgentFlow server running on :${PORT}`));
