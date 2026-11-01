/**
 * Database Migrations — PostgreSQL (Neon)
 * All tables use SERIAL for auto-increment and NOW() for timestamps
 */

const migrations = [
  // Users
  `CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'customer',
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`,

  // Suppliers
  `CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    city VARCHAR(100),
    state VARCHAR(100),
    address TEXT,
    approved INTEGER DEFAULT 0,
    response_time_minutes INTEGER DEFAULT 60,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`,

  // Categories
  `CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    parent_id INTEGER REFERENCES categories(id),
    sort_order INTEGER DEFAULT 0,
    active INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW()
  )`,

  // Products
  `CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    supplier_id INTEGER REFERENCES suppliers(id),
    category_id INTEGER REFERENCES categories(id),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    brand VARCHAR(100),
    model VARCHAR(100),
    image_url VARCHAR(500),
    active INTEGER DEFAULT 1,
    approved INTEGER DEFAULT 0,
    return_eligible INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`,

  // Product Variants
  `CREATE TABLE IF NOT EXISTS product_variants (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    sku VARCHAR(100) UNIQUE NOT NULL,
    label VARCHAR(255),
    price_paise INTEGER NOT NULL,
    size VARCHAR(50),
    hand VARCHAR(20),
    blade_length VARCHAR(50),
    grip_type VARCHAR(50),
    material VARCHAR(100),
    weapon_type VARCHAR(50),
    component_type VARCHAR(100),
    connector_spec VARCHAR(100),
    certification VARCHAR(100),
    compatibility VARCHAR(50) DEFAULT 'Unknown compatibility',
    on_hand INTEGER DEFAULT 0,
    reserved INTEGER DEFAULT 0,
    active INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`,

  // Serviceable PIN Codes
  `CREATE TABLE IF NOT EXISTS serviceable_pins (
    id SERIAL PRIMARY KEY,
    pincode VARCHAR(6) NOT NULL,
    city VARCHAR(100),
    state VARCHAR(100),
    standard_shipping INTEGER DEFAULT 1,
    local_express INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
  )`,

  // Orders
  `CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id),
    supplier_id INTEGER REFERENCES suppliers(id),
    status VARCHAR(50) DEFAULT 'awaiting_supplier_confirmation',
    fulfilment_method VARCHAR(50) DEFAULT 'standard_shipping',
    subtotal_paise INTEGER DEFAULT 0,
    delivery_fee_paise INTEGER DEFAULT 0,
    tax_paise INTEGER DEFAULT 0,
    total_amount_paise INTEGER DEFAULT 0,
    address_name VARCHAR(255),
    address_phone VARCHAR(20),
    address_line1 TEXT,
    address_line2 TEXT,
    address_city VARCHAR(100),
    address_state VARCHAR(100),
    address_pincode VARCHAR(6),
    supplier_response_deadline TIMESTAMP,
    payment_deadline TIMESTAMP,
    courier_reference VARCHAR(100),
    collection_code VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`,

  // Order Items (Immutable Snapshot)
  `CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER,
    variant_id INTEGER,
    product_name VARCHAR(255) NOT NULL,
    variant_label VARCHAR(255),
    sku VARCHAR(100) NOT NULL,
    unit_price_paise INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    return_eligible INTEGER DEFAULT 1,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW()
  )`,

  // Order Events (Audit Trail)
  `CREATE TABLE IF NOT EXISTS order_events (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    note TEXT,
    actor_id INTEGER,
    actor_role VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
  )`,

  // Quotes
  `CREATE TABLE IF NOT EXISTS quotes (
    id SERIAL PRIMARY KEY,
    quote_number VARCHAR(50) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id),
    organisation VARCHAR(255),
    contact_name VARCHAR(255),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    pincode VARCHAR(6),
    required_date DATE,
    notes TEXT,
    items_json TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    supplier_id INTEGER REFERENCES suppliers(id),
    freight_paise INTEGER DEFAULT 0,
    total_paise INTEGER DEFAULT 0,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`,

  // Support Tickets
  `CREATE TABLE IF NOT EXISTS support_tickets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    order_id INTEGER REFERENCES orders(id),
    type VARCHAR(50),
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'open',
    guest_name VARCHAR(255),
    guest_email VARCHAR(255),
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`,

  // Addresses
  `CREATE TABLE IF NOT EXISTS addresses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    line1 TEXT NOT NULL,
    line2 TEXT,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(6) NOT NULL,
    is_default INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
  )`,

  // Settings
  `CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    updated_at TIMESTAMP DEFAULT NOW()
  )`,

  // Indexes for performance
  `CREATE INDEX IF NOT EXISTS idx_products_supplier ON products(supplier_id)`,
  `CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id)`,
  `CREATE INDEX IF NOT EXISTS idx_products_active ON products(active, approved)`,
  `CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id)`,
  `CREATE INDEX IF NOT EXISTS idx_variants_sku ON product_variants(sku)`,
  `CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_orders_supplier ON orders(supplier_id)`,
  `CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`,
  `CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id)`,
  `CREATE INDEX IF NOT EXISTS idx_pins_pincode ON serviceable_pins(pincode)`,
  `CREATE INDEX IF NOT EXISTS idx_addresses_user ON addresses(user_id)`
];

module.exports = migrations;