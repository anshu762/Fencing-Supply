const express = require('express');
const router = express.Router();
const db = require('../database/db');

// GET /api/products — browse & search
router.get('/', async (req, res) => {
  try {
    const { search, category, brand, size, hand, weapon, sort, page = 1, limit = 20, availability } = req.query;
    let where = 'WHERE p.active = 1 AND p.approved = 1';
    const params = [];

    if (search) {
      where += ' AND (p.name ILIKE ? OR p.brand ILIKE ? OR p.model ILIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }
    if (category) {
      where += ' AND (c.slug = ? OR c.name ILIKE ?)';
      params.push(category, `%${category}%`);
    }
    if (brand) {
      where += ' AND p.brand ILIKE ?';
      params.push(`%${brand}%`);
    }
    if (weapon) {
      where += ' AND EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id AND pv.weapon_type ILIKE ?)';
      params.push(`%${weapon}%`);
    }
    if (size) {
      where += ' AND EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id AND pv.size = ?)';
      params.push(size);
    }
    if (hand) {
      where += ' AND EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id AND pv.hand ILIKE ?)';
      params.push(`%${hand}%`);
    }

    let orderBy = 'ORDER BY p.created_at DESC';
    if (sort === 'price_asc') orderBy = 'ORDER BY min_price ASC NULLS LAST';
    else if (sort === 'price_desc') orderBy = 'ORDER BY min_price DESC NULLS LAST';
    else if (sort === 'name_asc' || sort === 'name') orderBy = 'ORDER BY p.name ASC';
    else if (sort === 'name_desc') orderBy = 'ORDER BY p.name DESC';
    else if (sort === 'newest') orderBy = 'ORDER BY p.created_at DESC';

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 20));
    const offset = (pageNum - 1) * limitNum;

    const countRow = await db.get(
      `SELECT COUNT(*) as total FROM products p
       LEFT JOIN categories c ON p.category_id = c.id ${where}`, params
    );

    const products = await db.all(
      `SELECT p.*, c.name as category_name, s.name as supplier_name,
              (SELECT MIN(pv.price_paise) FROM product_variants pv WHERE pv.product_id = p.id AND pv.active = 1) as min_price,
              (SELECT COALESCE(SUM(pv.on_hand - pv.reserved), 0) FROM product_variants pv WHERE pv.product_id = p.id AND pv.active = 1) as total_stock
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN suppliers s ON p.supplier_id = s.id
       ${where}
       ${orderBy}
       LIMIT ? OFFSET ?`,
      [...params, limitNum, offset]
    );

    // Normalise numeric fields (Postgres returns BIGINT/SUM as string)
    let normalised = products.map(p => ({
      ...p,
      min_price: p.min_price != null ? Number(p.min_price) : 0,
      price_paise: p.min_price != null ? Number(p.min_price) : 0,
      total_stock: p.total_stock != null ? Number(p.total_stock) : 0,
      stock: p.total_stock != null ? Number(p.total_stock) : 0
    }));

    // In-stock filter (after normalisation)
    if (availability === 'in_stock') {
      normalised = normalised.filter(p => p.total_stock > 0);
    }

    const total = Number(countRow?.total || 0);

    res.json({
      products: normalised,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.max(1, Math.ceil(total / limitNum))
    });
  } catch (err) {
    console.error('GET /products error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await db.all('SELECT * FROM categories WHERE active = 1 ORDER BY sort_order');
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/variant/:id   (must come BEFORE /:idOrSlug)
router.get('/variant/:id', async (req, res) => {
  try {
    const variant = await db.get(
      `SELECT pv.*, p.name as product_name, p.slug as product_slug, p.image_url, p.supplier_id, s.name as supplier_name
       FROM product_variants pv
       JOIN products p ON pv.product_id = p.id
       JOIN suppliers s ON p.supplier_id = s.id
       WHERE pv.id = ? AND pv.active = 1 AND p.active = 1`,
      [req.params.id]
    );
    if (!variant) return res.status(404).json({ error: 'Variant not found' });
    variant.available = Number(variant.on_hand) - Number(variant.reserved);
    variant.price_paise = Number(variant.price_paise);
    res.json({ variant });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/check-pin/:pincode
router.get('/check-pin/:pincode', async (req, res) => {
  try {
    const pin = await db.get('SELECT * FROM serviceable_pins WHERE pincode = ?', [req.params.pincode]);
    res.json({
      serviceable: !!pin,
      standard_shipping: pin?.standard_shipping === 1,
      local_express: pin?.local_express === 1,
      city: pin?.city,
      state: pin?.state
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/:idOrSlug — accepts BOTH numeric ID and slug
router.get('/:idOrSlug', async (req, res) => {
  try {
    const key = req.params.idOrSlug;
    const isNumeric = /^\d+$/.test(key);

    const product = await db.get(
      `SELECT p.*, c.name as category_name, s.name as supplier_name, s.city as supplier_city
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN suppliers s ON p.supplier_id = s.id
       WHERE ${isNumeric ? 'p.id = ?' : 'p.slug = ?'} AND p.active = 1 AND p.approved = 1`,
      [isNumeric ? parseInt(key) : key]
    );

    if (!product) return res.status(404).json({ error: 'Product not found' });

    const variants = await db.all(
      'SELECT * FROM product_variants WHERE product_id = ? AND active = 1 ORDER BY price_paise, label',
      [product.id]
    );

    // Normalise numeric fields
    const normVariants = variants.map(v => ({
      ...v,
      price_paise: Number(v.price_paise),
      on_hand: Number(v.on_hand || 0),
      reserved: Number(v.reserved || 0),
      available: Number(v.on_hand || 0) - Number(v.reserved || 0)
    }));

    res.json({ product, variants: normVariants });
  } catch (err) {
    console.error('GET /products/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/meta/filters — returns actual brands & categories from DB
router.get('/meta/filters', async (req, res) => {
  try {
    const brands = await db.all(
      `SELECT DISTINCT brand FROM products 
       WHERE active = 1 AND approved = 1 AND brand IS NOT NULL AND brand != ''
       ORDER BY brand ASC`
    );
    const categories = await db.all(
      `SELECT c.id, c.name, c.slug, COUNT(p.id) as product_count
       FROM categories c
       LEFT JOIN products p ON p.category_id = c.id AND p.active = 1 AND p.approved = 1
       WHERE c.active = 1
       GROUP BY c.id, c.name, c.slug, c.sort_order
       ORDER BY c.sort_order ASC`
    );
    res.json({
      brands: brands.map(b => b.brand),
      categories: categories.map(c => ({
        id: Number(c.id),
        name: c.name,
        slug: c.slug,
        count: Number(c.product_count || 0)
      }))
    });
  } catch (err) {
    console.error('GET /meta/filters error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;