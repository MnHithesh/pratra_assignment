/*
 * Local mock API for the flight search app.
 *
 * Plain json-server handles the REST resources (airports, flights, bookings).
 * A few custom routes sit in front of it for things json-server can't do on
 * its own: login/signup, attaching the logged-in user to bookings and keeping
 * the users collection private.
 *
 * db.json is created from seed.json on first start and is git-ignored, so
 * `npm run mock:reset` gets you back to a clean state.
 */
const fs = require('fs');
const path = require('path');
const jsonServer = require('json-server');

const PORT = Number(process.env.MOCK_API_PORT) || 3000;
// Small artificial delay so loading states are actually visible in the UI.
const LATENCY_MS = Number(process.env.MOCK_API_LATENCY) || 600;

const seedFile = path.join(__dirname, 'seed.json');
const dbFile = path.join(__dirname, 'db.json');

if (!fs.existsSync(dbFile)) {
  fs.copyFileSync(seedFile, dbFile);
}

const server = jsonServer.create();
const router = jsonServer.router(dbFile);
const db = router.db;

server.use(jsonServer.defaults({ logger: true }));
server.use(jsonServer.bodyParser);
server.use((req, res, next) => setTimeout(next, LATENCY_MS));

// --- auth helpers ---------------------------------------------------------
// The token is just base64 encoded JSON. It is NOT secure and only exists so
// the frontend has something realistic to store and send back.
const TOKEN_TTL_MS = 1000 * 60 * 60 * 8;

function createToken(user) {
  const payload = { sub: user.id, email: user.email, exp: Date.now() + TOKEN_TTL_MS };
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

function readToken(req) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return null;

  try {
    const payload = JSON.parse(Buffer.from(token, 'base64url').toString('utf8'));
    if (!payload.exp || payload.exp < Date.now()) return null;
    return db.get('users').find({ id: payload.sub }).value() || null;
  } catch {
    return null;
  }
}

function publicUser(user) {
  const { password, ...rest } = user;
  return rest;
}

function requireAuth(req, res, next) {
  const user = readToken(req);
  if (!user) {
    return res.status(401).json({ message: 'Your session has expired. Please log in again.' });
  }
  req.user = user;
  next();
}

// --- custom routes --------------------------------------------------------
server.post('/auth/login', (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const user = db.get('users').find(u => u.email.toLowerCase() === email).value();

  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Incorrect email or password.' });
  }
  res.json({ token: createToken(user), user: publicUser(user) });
});

server.post('/auth/signup', (req, res) => {
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');

  if (!name || !email || password.length < 5) {
    return res.status(400).json({ message: 'Name, email and a password of at least 5 characters are required.' });
  }
  if (db.get('users').find(u => u.email.toLowerCase() === email).value()) {
    return res.status(409).json({ message: 'An account with this email already exists.' });
  }

  const users = db.get('users');
  const id = Math.max(0, ...users.map('id').value()) + 1;
  const user = { id, name, email, password };
  users.push(user).write();

  res.status(201).json({ token: createToken(user), user: publicUser(user) });
});

// Never expose the users collection (it has passwords in it).
server.use('/users', (req, res) => res.status(404).json({ message: 'Not found' }));

// Bookings belong to the logged-in user.
server.use('/bookings', requireAuth);

server.get('/bookings', (req, res, next) => {
  req.query.userId = String(req.user.id);
  next();
});

server.get('/bookings/:id', (req, res, next) => {
  const booking = db.get('bookings').find({ id: req.params.id }).value();
  if (booking && booking.userId !== req.user.id) {
    return res.status(404).json({ message: 'Booking not found' });
  }
  next();
});

server.post('/bookings', (req, res, next) => {
  const flight = db.get('flights').find({ id: String(req.body.flightId) }).value();
  if (!flight) {
    return res.status(400).json({ message: 'That flight is no longer available.' });
  }
  if (!Array.isArray(req.body.passengers) || req.body.passengers.length === 0) {
    return res.status(400).json({ message: 'At least one passenger is required.' });
  }

  req.body.id = Date.now().toString(36);
  req.body.userId = req.user.id;
  req.body.reference = makeReference();
  req.body.status = 'CONFIRMED';
  req.body.createdAt = new Date().toISOString();
  next();
});

// Only allow reads/creates on bookings, no edits or deletes through the API.
server.use('/bookings', (req, res, next) => {
  if (['PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    return res.status(405).json({ message: 'Not allowed' });
  }
  next();
});

function makeReference() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let ref = '';
  for (let i = 0; i < 6; i++) ref += chars[Math.floor(Math.random() * chars.length)];
  return ref;
}

server.use(router);

server.listen(PORT, () => {
  console.log(`Mock API running at http://localhost:${PORT}`);
});
