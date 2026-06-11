// ==========================================
// PAU HOUSING SYSTEM — BACKEND SERVER
// Run: node server.js
// ==========================================
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');
require('dotenv').config();

const pool = require('./db');
const app  = express();

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// Multer for image uploads
const multer  = require('multer');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename:    (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s/g, '_'))
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// ==========================================
// EMAIL SETUP (nodemailer)
// ==========================================
let transporter = null;
try {
  const nodemailer = require('nodemailer');
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      }
    });
    console.log('✅ Email notifications ready');
  }
} catch (e) {
  console.log('ℹ️  Email not configured (install nodemailer to enable)');
}

async function sendSignupEmail(name, email, role) {
  if (!transporter) return;
  try {
    await transporter.sendMail({
      from:    `"PAU Housing" <${process.env.EMAIL_USER}>`,
      to:      process.env.EMAIL_TO || process.env.EMAIL_USER,
      subject: `New ${role === 'landlord' ? 'Landlord' : 'Student'} Registration — PAU Housing`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:24px;
          background:#f4f6fb;border-radius:12px;">
          <h2 style="color:#003087;font-family:Georgia,serif;">New ${role === 'landlord' ? 'Property Owner' : 'Student'} Registered</h2>
          <table style="width:100%;border-collapse:collapse;margin-top:16px;">
            <tr><td style="padding:8px;color:#6b7280;font-size:14px;">Name</td>
                <td style="padding:8px;font-weight:600;color:#1a2340">${name}</td></tr>
            <tr style="background:white"><td style="padding:8px;color:#6b7280;font-size:14px;">Email</td>
                <td style="padding:8px;font-weight:600;color:#1a2340">${email}</td></tr>
            <tr><td style="padding:8px;color:#6b7280;font-size:14px;">Role</td>
                <td style="padding:8px;font-weight:600;color:#003087;text-transform:capitalize">${role}</td></tr>
            <tr style="background:white"><td style="padding:8px;color:#6b7280;font-size:14px;">Time</td>
                <td style="padding:8px;font-weight:600;color:#1a2340">${new Date().toLocaleString('en-NG')}</td></tr>
          </table>
          <p style="margin-top:20px;font-size:13px;color:#6b7280;">
            This is an automated notification from PAU Housing System.
          </p>
        </div>
      `
    });
    console.log(`📧 Email sent for new ${role}: ${name}`);
  } catch (err) {
    console.log('⚠️  Email send failed:', err.message);
  }
}

// ==========================================
// TEST
// ==========================================
app.get('/', (req, res) => res.json({ message: '✅ PAU Housing API is running!' }));

// ==========================================
// REGISTER
// ==========================================
app.post('/api/register', async (req, res) => {
  const { name, email, phone, address, password, role } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: 'Name, email and password are required.' });

  try {
    const exists = await pool.query('SELECT id FROM users WHERE LOWER(email)=LOWER($1)', [email.trim()]);
    if (exists.rows.length > 0)
      return res.status(400).json({ error: 'An account with this email already exists.' });

    let landlordId = null;
    if (role === 'landlord') {
      const lr = await pool.query(
        'INSERT INTO landlords (name, phone, email, address, bio) VALUES ($1,$2,$3,$4,$5) RETURNING id',
        [name, phone || '', email.trim(), address || 'Lagos', 'Property owner near PAU campus.']
      );
      landlordId = lr.rows[0].id;
    }

    const result = await pool.query(
      `INSERT INTO users (name, email, phone, password, role, landlord_id)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING id, name, email, role, landlord_id`,
      [name, email.trim(), phone || '', password, role || 'student', landlordId]
    );

    // Send email notification
    sendSignupEmail(name, email, role || 'student');

    res.status(201).json({ message: 'Account created!', user: result.rows[0] });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// LOGIN
// ==========================================
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required.' });

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE LOWER(email)=LOWER($1) AND password=$2',
      [email.trim(), password.trim()]
    );
    if (!result.rows.length)
      return res.status(401).json({ error: 'Invalid email or password.' });

    const user  = result.rows[0];
    const token = `pau-${user.id}-${Date.now()}`;
    res.json({
      token,
      user: {
        id:          user.id,
        name:        user.name,
        email:       user.email,
        phone:       user.phone || '',
        role:        user.role,
        landlord_id: user.landlord_id || null
      }
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// PROPERTIES
// ==========================================
app.get('/api/properties', async (req, res) => {
  const { name, room_type, max_rent, limit, landlord_id } = req.query;
  let query  = `SELECT p.*, l.name AS landlord_name, l.phone, l.email AS landlord_email
                FROM properties p
                LEFT JOIN landlords l ON p.landlord_id = l.id WHERE 1=1`;
  let values = [], i = 1;
  if (name)        { query += ` AND p.name ILIKE $${i++}`;       values.push('%' + name + '%'); }
  if (room_type)   { query += ` AND p.room_type ILIKE $${i++}`;  values.push('%' + room_type + '%'); }
  if (max_rent)    { query += ` AND p.rent <= $${i++}`;          values.push(Number(max_rent)); }
  if (landlord_id) { query += ` AND p.landlord_id = $${i++}`;    values.push(Number(landlord_id)); }
  query += ' ORDER BY p.created_at DESC';
  if (limit) { query += ` LIMIT $${i++}`; values.push(Number(limit)); }
  try {
    const r = await pool.query(query, values);
    res.json(r.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/properties/:id', async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT p.*, l.name AS landlord_name, l.phone, l.email AS landlord_email, l.bio
       FROM properties p LEFT JOIN landlords l ON p.landlord_id=l.id WHERE p.id=$1`,
      [req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/properties', upload.array('images', 5), async (req, res) => {
  const { name, address, room_type, rent, distance_from_school, available, description, landlord_id } = req.body;
  const imageUrl = req.files && req.files.length > 0 ? `/uploads/${req.files[0].filename}` : null;
  try {
    const r = await pool.query(
      `INSERT INTO properties (name,address,room_type,rent,distance_from_school,available,description,landlord_id,image_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [name, address, room_type, Number(rent), Number(distance_from_school || 0),
       available !== 'false', description || '', landlord_id || null, imageUrl]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) {
    console.error('Add property error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/properties/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM properties WHERE id=$1', [req.params.id]);
    res.json({ message: 'Deleted.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get properties for logged-in landlord — using landlord_id from token
app.get('/api/my-properties', async (req, res) => {
  const auth = (req.headers['authorization'] || '').replace('Bearer pau-', '');
  const uid  = auth.split('-')[0];
  try {
    const u = await pool.query('SELECT * FROM users WHERE id=$1', [uid]);
    if (!u.rows.length) return res.status(404).json({ error: 'User not found' });
    if (!u.rows[0].landlord_id) return res.json([]);
    const p = await pool.query(
      'SELECT * FROM properties WHERE landlord_id=$1 ORDER BY created_at DESC',
      [u.rows[0].landlord_id]
    );
    res.json(p.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==========================================
// LANDLORDS
// ==========================================
app.get('/api/landlords', async (req, res) => {
  try {
    // Count only properties that actually belong to each landlord
    const r = await pool.query(
      `SELECT l.*, COUNT(p.id)::int AS properties_count
       FROM landlords l
       LEFT JOIN properties p ON p.landlord_id = l.id
       GROUP BY l.id
       ORDER BY l.created_at DESC`
    );
    res.json(r.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/landlords/:id', async (req, res) => {
  try {
    const l = await pool.query('SELECT * FROM landlords WHERE id=$1', [req.params.id]);
    const p = await pool.query('SELECT * FROM properties WHERE landlord_id=$1', [req.params.id]);
    if (!l.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ ...l.rows[0], properties: p.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==========================================
// MESSAGES
// ==========================================
app.post('/api/messages', async (req, res) => {
  const { sender_id, landlord_id, property_id, message } = req.body;
  try {
    const r = await pool.query(
      'INSERT INTO messages (sender_id,landlord_id,property_id,message) VALUES ($1,$2,$3,$4) RETURNING *',
      [sender_id, landlord_id, property_id, message]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/messages/landlord/:id', async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT m.*, u.name AS student_name, u.email AS student_email,
              u.phone AS student_phone, p.name AS property_name
       FROM messages m
       LEFT JOIN users u ON m.sender_id=u.id
       LEFT JOIN properties p ON m.property_id=p.id
       WHERE m.landlord_id=$1 ORDER BY m.created_at DESC`,
      [req.params.id]
    );
    res.json(r.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==========================================
// START
// ==========================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('\n================================================');
  console.log('  ✅ PAU Housing Backend is RUNNING!');
  console.log(`  👉 http://localhost:${PORT}`);
  console.log('  Keep this terminal open while using the site.');
  console.log('================================================\n');
});