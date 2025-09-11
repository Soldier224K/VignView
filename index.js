// backend/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fetch = require('node-fetch');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Multer memory storage (for small prototypes)
const upload = multer({ storage: multer.memoryStorage() });

// Postgres pool
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.DB_HOST || 'db',
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
});

// Helper: initialize DB if not present
async function ensureSchema() {
  const schemaSql = fs.readFileSync(path.join(__dirname, 'db', 'schema.sql')).toString();
  await pool.query(schemaSql);
}

// Very small healthcheck
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Manual report endpoint
app.post('/api/manual-report', async (req, res) => {
  try {
    const { title, description, category, digipin } = req.body;
    if (!title || !description) return res.status(400).json({ error: 'Missing fields: title/description' });

    const q = `INSERT INTO reports (title, description, category, digipin, source, created_at)
               VALUES ($1,$2,$3,$4,'manual', now()) RETURNING id`;
    const values = [title, description, category || 'manual', digipin || null];
    const r = await pool.query(q, values);
    res.json({ status: 'ok', report_id: r.rows[0].id });
  } catch (err) {
    console.error('manual-report error', err);
    res.status(500).json({ error: 'server_error' });
  }
});

// Photo-sense endpoint: accepts file, calls Google Vision label detection
app.post('/api/photo-sense', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'no_file' });

    // base64 encode
    const b64 = req.file.buffer.toString('base64');

    // call Google Vision API (LABEL_DETECTION). You can adjust features.
    const apiKey = process.env.AI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'missing_ai_key' });

    const visionUrl = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;
    const body = {
      requests: [
        {
          image: { content: b64 },
          features: [
            { type: 'LABEL_DETECTION', maxResults: 6 },
            { type: 'OBJECT_LOCALIZATION', maxResults: 6 }
          ],
        },
      ],
    };

    const r = await fetch(visionUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!r.ok) {
      const txt = await r.text();
      console.error('vision error', txt);
      return res.status(500).json({ error: 'vision_error', details: txt });
    }

    const data = await r.json();
    // Parse top label
    const labels = data.responses?.[0]?.labelAnnotations || [];
    const objects = data.responses?.[0]?.localizedObjectAnnotations || [];

    const topLabel = labels[0]?.description || null;
    const topConfidence = labels[0]?.score || 0;
    // Build a naive mapping to department (you'll refine later)
    let department = 'Municipal';
    if (topLabel) {
      const L = topLabel.toLowerCase();
      if (L.includes('pothole') || L.includes('road') || L.includes('asphalt')) department = 'PWD';
      else if (L.includes('garbage') || L.includes('trash') || L.includes('waste')) department = 'Sanitation';
      else if (L.includes('water') || L.includes('flood') || L.includes('pool')) department = 'Water';
      else if (L.includes('car') || L.includes('vehicle')) department = 'Transport';
      else if (L.includes('person') || L.includes('gun') || L.includes('knife')) department = 'Police';
    }

    // Save to DB minimal metadata (store binary as file in prototype folder)
    const fileName = `uploads/${Date.now()}_${req.file.originalname.replace(/[^a-zA-Z0-9_.-]/g,'_')}`;
    fs.writeFileSync(path.join(__dirname, fileName), req.file.buffer);

    const q = `INSERT INTO reports (title, description, category, digipin, source, media_path, ai_response, created_at)
               VALUES ($1,$2,$3,$4,'photo', $5, $6, now()) RETURNING id`;
    const aiResp = JSON.stringify({ labels, objects });
    const values = [topLabel || 'image', `Auto-detected label: ${topLabel}`, topLabel || 'unknown', null, fileName, aiResp];
    const rr = await pool.query(q, values);

    res.json({
      status: 'ok',
      category: topLabel || 'unknown',
      confidence: topConfidence,
      department,
      report_id: rr.rows[0].id,
    });
  } catch (err) {
    console.error('/api/photo-sense error', err);
    res.status(500).json({ error: 'server_error' });
  }
});

// Start after ensuring schema
ensureSchema()
  .then(() => {
    const port = process.env.BACKEND_PORT || 5000;
    app.listen(port, () => console.log(`🚀 Backend running on http://localhost:${port}`));
  })
  .catch((err) => {
    console.error('Failed to init DB schema', err);
    process.exit(1);
  });
