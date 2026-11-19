require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'smvms_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Health Check
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'OK', system: 'SMVMS Backend', database: 'Connected' });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', message: err.message });
  }
});

// Get All System State (Initial Load)
app.get('/api/bootstrap', async (req, res) => {
  try {
    const [vendors] = await pool.query('SELECT * FROM vendors ORDER BY created_at DESC');
    const [campaigns] = await pool.query('SELECT * FROM campaigns ORDER BY created_at DESC');
    const [products] = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    const [ledger] = await pool.query('SELECT * FROM transactions ORDER BY created_at DESC');
    const [messages] = await pool.query('SELECT * FROM messages ORDER BY id DESC');

    res.json({
      vendors: vendors.map(v => ({
        id: v.id,
        owner: v.owner_name,
        shop: v.shop_name,
        sector: v.sector,
        stall: v.stall_code,
        rent: Number(v.monthly_rent),
        kpi: Number(v.kpi_score),
        sales: Number(v.total_sales),
        status: v.status
      })),
      campaigns: campaigns.map(c => ({
        id: c.id,
        title: c.title,
        vendorId: c.vendor_id,
        budget: Number(c.budget),
        spent: Number(c.spent)
      })),
      products: products.map(p => ({
        id: p.id,
        vendorId: p.vendor_id,
        name: p.name,
        price: Number(p.price),
        stock: Number(p.stock)
      })),
      ledger: ledger.map(t => ({
        id: t.id,
        vendorId: t.vendor_id,
        desc: t.description,
        gross: Number(t.gross_amount),
        commission: Number(t.commission_amount),
        net: Number(t.net_payout)
      })),
      messages: messages.map(m => ({
        id: m.id,
        from: m.sender,
        text: m.message_text,
        time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Register New Vendor
app.post('/api/vendors', async (req, res) => {
  try {
    const { owner, shop, sector, stall, rent } = req.body;
    if (!owner || !shop || !sector || !stall) {
      return res.status(400).json({ error: 'All vendor fields are required' });
    }
    const id = 'V-' + Math.floor(1000 + Math.random() * 9000);
    await pool.query(
      `INSERT INTO vendors (id, owner_name, shop_name, sector, stall_code, monthly_rent, kpi_score, total_sales, status)
       VALUES (?, ?, ?, ?, ?, ?, 75, 0, 'Pending')`,
      [id, owner, shop, sector, stall, Number(rent) || 8000]
    );
    res.status(201).json({ id, status: 'Pending' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Approve / Block Vendor (Admin)
app.patch('/api/vendors/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Approved', 'Pending', 'Blocked'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    await pool.query('UPDATE vendors SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ id: req.params.id, status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Vendor KPI Score
app.patch('/api/vendors/:id/kpi', async (req, res) => {
  try {
    const { kpi } = req.body;
    const score = Math.max(0, Math.min(100, Number(kpi)));
    await pool.query('UPDATE vendors SET kpi_score = ? WHERE id = ?', [score, req.params.id]);
    res.json({ id: req.params.id, kpi: score });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create Campaign
app.post('/api/campaigns', async (req, res) => {
  try {
    const { title, vendorId, budget, spent } = req.body;
    const id = 'CMP-' + Math.floor(100 + Math.random() * 900);
    await pool.query(
      'INSERT INTO campaigns (id, title, vendor_id, budget, spent) VALUES (?, ?, ?, ?, ?)',
      [id, title, vendorId, Number(budget), Number(spent) || 0]
    );
    res.status(201).json({ id, title, vendorId, budget: Number(budget), spent: Number(spent) || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add Product / Service
app.post('/api/products', async (req, res) => {
  try {
    const { vendorId, name, price, stock } = req.body;
    const id = 'P-' + Date.now();
    await pool.query(
      'INSERT INTO products (id, vendor_id, name, price, stock) VALUES (?, ?, ?, ?, ?)',
      [id, vendorId, name, Number(price), Number(stock)]
    );
    res.status(201).json({ id, vendorId, name, price: Number(price), stock: Number(stock) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Product
app.delete('/api/products/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ deleted: true, id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Customer Purchase -> Updates Stock, Vendor Sales & Ledger Transactionally
app.post('/api/orders', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { productId } = req.body;
    await conn.beginTransaction();

    const [rows] = await conn.query('SELECT * FROM products WHERE id = ? FOR UPDATE', [productId]);
    if (!rows.length || rows[0].stock <= 0) {
      await conn.rollback();
      return res.status(400).json({ error: 'Product out of stock' });
    }

    const prod = rows[0];
    const gross = Number(prod.price);
    const commission = Math.round(gross * 0.10);
    const net = gross - commission;
    const txnId = 'TXN-' + Math.floor(1000 + Math.random() * 9000);

    await conn.query('UPDATE products SET stock = stock - 1 WHERE id = ?', [prod.id]);
    await conn.query('UPDATE vendors SET total_sales = total_sales + ? WHERE id = ?', [gross, prod.vendor_id]);
    await conn.query(
      `INSERT INTO transactions (id, vendor_id, description, gross_amount, commission_amount, net_payout)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [txnId, prod.vendor_id, `${prod.name} (x1)`, gross, commission, net]
    );

    await conn.commit();
    res.status(201).json({ txnId, vendorId: prod.vendor_id, item: prod.name, gross, commission, net });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// Post Message (Admin <-> Vendor)
app.post('/api/messages', async (req, res) => {
  try {
    const { from, text } = req.body;
    await pool.query('INSERT INTO messages (sender, message_text) VALUES (?, ?)', [from, text]);
    res.status(201).json({ from, text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`SMVMS Server running at http://localhost:${PORT}`);
});
