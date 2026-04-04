require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { createToken, verifyToken } = require('./auth');

// ── GROQ AI SETUP ─────────────────────────────
const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(express.json());

// ── DATA HELPERS ──────────────────────────────
function readData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return {
      users: [],
      tasks: [],
      subjects: ['Math', 'Science', 'English', 'History', 'Programming']
    };
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

if (!fs.existsSync(DATA_FILE)) {
  writeData({ users: [], tasks: [], subjects: ['Math', 'Science', 'English', 'History', 'Programming'] });
}

// ── AUTH MIDDLEWARE ───────────────────────────
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: 'Invalid or expired token' });
  req.user = payload;
  next();
}

// ── AUTH ROUTES ───────────────────────────────
app.post('/api/auth/signup', (req, res) => {
  const { email, password } = req.body || {};
  const trimmedEmail = (email || '').trim().toLowerCase();
  if (!trimmedEmail || !password)
    return res.status(400).json({ error: 'Email and password are required' });
  if (password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters' });

  const data = readData();
  if (!data.users) data.users = [];

  if (data.users.find(u => u.email === trimmedEmail))
    return res.status(409).json({ error: 'An account with this email already exists' });

  const passwordHash = bcrypt.hashSync(password, 10);
  const user = { id: Date.now().toString(), email: trimmedEmail, passwordHash, createdAt: new Date().toISOString() };
  data.users.push(user);
  writeData(data);

  const token = createToken(user);
  res.status(201).json({ user: { id: user.id, email: user.email }, token });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  const trimmedEmail = (email || '').trim().toLowerCase();
  if (!trimmedEmail || !password)
    return res.status(400).json({ error: 'Email and password are required' });

  const data = readData();
  const user = (data.users || []).find(u => u.email === trimmedEmail);
  if (!user || !bcrypt.compareSync(password, user.passwordHash))
    return res.status(401).json({ error: 'Invalid email or password' });

  const token = createToken(user);
  res.json({ user: { id: user.id, email: user.email }, token });
});

app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: 'Invalid or expired token' });
  res.json({ user: { id: payload.id, email: payload.email } });
});

// ── PROTECTED ROUTES ──────────────────────────
app.use('/api/tasks', authMiddleware);
app.use('/api/subjects', authMiddleware);
app.use('/api/growth', authMiddleware);
app.use('/api/nova', authMiddleware);

// ── TASKS ─────────────────────────────────────
app.get('/api/tasks', (req, res) => {
  const data = readData();
  const tasks = (data.tasks || []).filter(t => t.userId === req.user.id);
  res.json(tasks);
});

app.post('/api/tasks', (req, res) => {
  const data = readData();
  if (!data.tasks) data.tasks = [];
  const task = {
    id: Date.now().toString(),
    userId: req.user.id,
    title: (req.body.title || 'Untitled').trim(),
    subject: (req.body.subject || 'General').trim(),
    dueDate: req.body.dueDate || null,
    priority: req.body.priority || 'medium',
    status: req.body.status || 'todo',
    completedAt: null,
    createdAt: new Date().toISOString(),
  };
  data.tasks.push(task);
  writeData(data);
  res.status(201).json(task);
});

app.put('/api/tasks/:id', (req, res) => {
  const data = readData();
  const idx = (data.tasks || []).findIndex(t => t.id === req.params.id && t.userId === req.user.id);
  if (idx === -1) return res.status(404).json({ error: 'Task not found' });
  const updated = { ...data.tasks[idx], ...req.body };
  if (req.body.status === 'done' && !data.tasks[idx].completedAt)
    updated.completedAt = new Date().toISOString();
  data.tasks[idx] = updated;
  writeData(data);
  res.json(updated);
});

app.delete('/api/tasks/:id', (req, res) => {
  const data = readData();
  const idx = (data.tasks || []).findIndex(t => t.id === req.params.id && t.userId === req.user.id);
  if (idx === -1) return res.status(404).json({ error: 'Task not found' });
  data.tasks.splice(idx, 1);
  writeData(data);
  res.status(204).send();
});

// ── ADMIN ROUTES (view in Postman) ────────────
app.get('/api/admin/users', (req, res) => {
  const data = readData();
  const users = (data.users || []).map(({ passwordHash, ...u }) => u);
  res.json(users);
});

app.get('/api/admin/tasks', (req, res) => {
  const data = readData();
  res.json(data.tasks || []);
});

// ── AI SUGGESTIONS ────────────────────────────
app.post('/api/tasks/suggest', (req, res) => {
  const data = readData();
  const subjects = data.subjects || [];
  const subjectTasks = {
    'Math': [{ title: 'Practice calculus problems', priority: 'high' }, { title: 'Review algebra fundamentals', priority: 'medium' }],
    'Science': [{ title: 'Complete physics lab report', priority: 'high' }, { title: 'Study biology cell structure', priority: 'low' }],
    'English': [{ title: 'Read assigned chapter', priority: 'high' }, { title: 'Write essay outline', priority: 'medium' }],
    'History': [{ title: 'Read history textbook chapter', priority: 'high' }, { title: 'Prepare for history quiz', priority: 'high' }],
    'Programming': [{ title: 'Complete coding challenge', priority: 'high' }, { title: 'Review data structures', priority: 'medium' }],
  };
  let suggestions = [];
  subjects.forEach(subject => {
    const pool = subjectTasks[subject] || [{ title: `Review ${subject} notes`, priority: 'medium' }];
    const count = Math.min(2, 5 - suggestions.length);
    for (let i = 0; i < count && i < pool.length; i++) suggestions.push({ ...pool[i], subject });
  });
  res.json({ suggestions: suggestions.slice(0, 5) });
});

// ── SUBJECTS ──────────────────────────────────
app.get('/api/subjects', (req, res) => {
  const data = readData();
  res.json(data.subjects || []);
});

app.post('/api/subjects', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Subject name required' });
  const data = readData();
  if (!data.subjects) data.subjects = [];
  if (!data.subjects.includes(name.trim())) {
    data.subjects.push(name.trim());
    writeData(data);
  }
  res.json(data.subjects);
});

// ── GROWTH STATS ──────────────────────────────
app.get('/api/growth', (req, res) => {
  const data = readData();
  const tasks = (data.tasks || []).filter(t => t.userId === req.user.id);
  const now = new Date();
  const completed = tasks.filter(t => t.status === 'done' && t.completedAt);
  const byWeek = {}, bySubject = {};
  const last7Days = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    last7Days.push({ date: d.toISOString().slice(0, 10), count: 0, label: d.toLocaleDateString('en-US', { weekday: 'short' }) });
  }

  completed.forEach(t => {
    const date = t.completedAt.slice(0, 10);
    const weekKey = date.slice(0, 7);
    byWeek[weekKey] = (byWeek[weekKey] || 0) + 1;
    bySubject[t.subject] = (bySubject[t.subject] || 0) + 1;
    const dayIdx = last7Days.findIndex(d => d.date === date);
    if (dayIdx !== -1) last7Days[dayIdx].count++;
  });

  const weeklyTrend = Object.entries(byWeek).sort().slice(-6).map(([week, count]) => ({ week, count }));
  res.json({
    totalTasks: tasks.length,
    completedCount: completed.length,
    completionRate: tasks.length ? Math.round((completed.length / tasks.length) * 100) : 0,
    bySubject: Object.entries(bySubject).map(([name, count]) => ({ name, count })),
    weeklyTrend,
    last7Days,
  });
});

// ── NOVA AI CHAT (Groq) ───────────────────────
app.post('/api/nova/chat', async (req, res) => {
  try {
    const { messages, system } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0)
      return res.status(400).json({ error: 'messages array is required' });

    const groqMessages = messages.map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    }));

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: system || 'You are Nova, a helpful AI study assistant for students.' },
        ...groqMessages,
      ],
      max_tokens: 512,
      temperature: 0.7,
    });

    const text = completion.choices[0]?.message?.content || "Sorry, I couldn't respond right now.";
    res.json({ content: [{ text }] });
  } catch (error) {
    console.error('Nova AI Error:', error.message);
    res.status(500).json({ error: 'AI service failed', details: error.message });
  }
});

// ── ROOT ──────────────────────────────────────
app.get('/', (req, res) => res.json({ message: 'TaskNova Server Running ✅', port: PORT }));

app.listen(PORT, () => console.log(`\n🚀 Server running on http://localhost:${PORT}\n`));