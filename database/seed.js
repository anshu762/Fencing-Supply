/**
 * Seed Data — Neon PostgreSQL
 * Researched demo catalogue with real fencing products
 */
require('dotenv').config();
const db = require('./db');
const bcrypt = require('bcryptjs');

// Public CDN image URLs (Unsplash — free to use)
const IMG = {
  foil:       'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600&q=80',
  epee:       'https://images.unsplash.com/photo-1565194481104-39d1ee1b8bcc?w=600&q=80',
  sabre:      'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600&q=80',
  mask:       'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&q=80',
  jacket:     'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=600&q=80',
  glove:      'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=600&q=80',
  plastron:   'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600&q=80',
  breeches:   'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600&q=80',
  socks:      'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=600&q=80',
  shoes:      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
  bag:        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
  cord:       'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
  blade:      'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80',
  grip:       'https://images.unsplash.com/photo-1526401485004-46910ecc8e51?w=600&q=80',
  tools:      'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=600&q=80',
  reel:       'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?w=600&q=80',
  scorebox:   'https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=600&q=80'
};

async function seedDatabase() {
  console.log('🌱 Seeding database...');

  try {
    const existing = await db.get('SELECT id FROM users LIMIT 1');
    if (existing) {
      console.log('⚠️  Database already has data. Skipping seed.');
      console.log('   To re-seed, truncate tables first.');
      return;
    }

    // --- Users ---
    const hash = await bcrypt.hash('demo123', 10);
    const users = [
      ['Demo Customer', 'customer@demo.com', '9876543210', hash, 'customer'],
      ['Demo Supplier', 'supplier@demo.com', '9876543211', hash, 'supplier'],
      ['Admin User', 'admin@demo.com', '9876543212', hash, 'admin'],
      ['Delivery Staff', 'delivery@demo.com', '9876543213', hash, 'delivery'],
      ['Club Manager', 'club@demo.com', '9876543214', hash, 'customer']
    ];
    for (const u of users) {
      await db.run('INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)', u);
    }
    console.log('  ✓ Users created');

    // --- Suppliers ---
    const suppliers = [
      [2, 'Fencing India Supplies', 'supplier@demo.com', '9876543211', 'Mumbai', 'Maharashtra', 'Andheri East, Mumbai', 1, 30],
      [2, 'National Fencing Store', 'supplier@demo.com', '9876543211', 'Delhi', 'Delhi', 'Connaught Place, Delhi', 1, 60]
    ];
    for (const s of suppliers) {
      await db.run(
        'INSERT INTO suppliers (user_id, name, contact_email, contact_phone, city, state, address, approved, response_time_minutes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        s
      );
    }
    console.log('  ✓ Suppliers created');

    // --- Categories ---
    const categories = [
      ['Foil', 'foil', 'Foil weapons and components', 1],
      ['Épée', 'epee', 'Épée weapons and components', 2],
      ['Sabre', 'sabre', 'Sabre weapons and components', 3],
      ['Protective Equipment', 'protective', 'Masks, jackets, gloves, plastrons, breeches', 4],
      ['Electrical Equipment', 'electrical', 'Body cords, mask cords, reels, scoring boxes', 5],
      ['Replacement Parts', 'parts', 'Blades, grips, pommels, guards, pads', 6],
      ['Accessories', 'accessories', 'Bags, tools, maintenance, socks, shoes', 7]
    ];
    for (const c of categories) {
      await db.run('INSERT INTO categories (name, slug, description, sort_order) VALUES (?, ?, ?, ?)', c);
    }
    console.log('  ✓ Categories created');

    // --- Products ---
    // Format: [supplier_id, category_id, name, slug, description, brand, model, image_url, active, approved]
    const products = [
      // === FOIL (category 1) ===
      [1, 1, 'Leon Paul FIE Foil Complete', 'leon-paul-fie-foil-complete',
        'Competition-grade FIE approved foil with Leon Paul maraging steel blade, choice of French or pistol grip. Fully assembled and ready for international competition. Includes bayonet socket wiring tested to FIE standards.',
        'Leon Paul', 'Vitality Foil', IMG.foil, 1, 1],

      [1, 1, 'Allstar FIE Foil Complete', 'allstar-fie-foil-complete',
        'German-engineered FIE foil from Allstar Fencing, featuring the renowned Allstar maraging blade, tested to FIE 2000 standards. Comes assembled with bayonet socket and pistol grip.',
        'Allstar', 'Ultimate Foil', IMG.foil, 1, 1],

      [1, 1, 'PBT Standard Foil', 'pbt-standard-foil',
        'Entry-level training foil from PBT Hungary. Stainless steel blade, ideal for clubs and beginners. Non-FIE but fully electric-compatible with 2-pin bayonet.',
        'PBT', 'Standard Steel', IMG.foil, 1, 1],

      [1, 1, 'Allstar FIE Foil Blade', 'allstar-fie-foil-blade',
        'Replacement FIE maraging steel foil blade, individually tested and FIE stamped. Available in multiple sizes with pre-drilled tang.',
        'Allstar', 'Maraging Blade', IMG.blade, 1, 1],

      [1, 1, 'Leon Paul Foil Grip Set', 'leon-paul-foil-grip-set',
        'Choice of French, Belgian, or Visconti pistol grip. Ergonomic design with aluminium core and rubberised coating for superior control.',
        'Leon Paul', 'Grip Series', IMG.grip, 1, 1],

      // === ÉPÉE (category 2) ===
      [1, 2, 'Leon Paul FIE Épée Complete', 'leon-paul-fie-epee-complete',
        'Championship FIE épée with Leon Paul maraging blade, German-style pommel, and 3-prong socket. The weapon of choice for Olympic competitors.',
        'Leon Paul', 'Vitality Épée', IMG.epee, 1, 1],

      [1, 2, 'Uhlmann FIE Épée Complete', 'uhlmann-fie-epee-complete',
        'Premium FIE épée from Uhlmann Germany. Features the iconic Uhlmann guard, maraging blade, and precision-balanced pommel. Trusted by national teams worldwide.',
        'Uhlmann', 'Olympic Épée', IMG.epee, 1, 1],

      [1, 2, 'PBT FIE Épée Blade', 'pbt-fie-epee-blade',
        'FIE approved maraging épée blade with pre-wired tip socket. Hungarian manufacture with excellent flex characteristics.',
        'PBT', 'FIE Épée Blade', IMG.blade, 1, 1],

      [1, 2, 'Allstar Épée Guard', 'allstar-epee-guard',
        'Standard FIE épée bell guard with insulated interior and secure mounting threading. Available in silver or gold anodised finish.',
        'Allstar', 'Standard Guard', IMG.grip, 1, 1],

      // === SABRE (category 3) ===
      [1, 3, 'Leon Paul FIE Sabre Complete', 'leon-paul-fie-sabre-complete',
        'Full FIE sabre with Leon Paul blade and insulated guard. Lightweight design optimised for fast-paced sabre bouts.',
        'Leon Paul', 'Vitality Sabre', IMG.sabre, 1, 1],

      [1, 3, 'Allstar FIE Sabre', 'allstar-fie-sabre',
        'German FIE sabre with proven Allstar quality. Precision-balanced with ergonomic grip and competition-tested blade.',
        'Allstar', 'FIE Sabre', IMG.sabre, 1, 1],

      [1, 3, 'PBT Sabre Blade Replacement', 'pbt-sabre-blade',
        'High-quality replacement sabre blade from PBT Hungary. FIE approved for all international competitions.',
        'PBT', 'Sabre Blade', IMG.blade, 1, 1],

      // === PROTECTIVE EQUIPMENT (category 4) ===
      [1, 4, 'Leon Paul FIE Mask (1600N)', 'leon-paul-fie-mask-1600n',
        'FIE 1600N certified fencing mask with ergonomic bib design, breathable mesh, and quick-release strap. The gold standard for competition masks.',
        'Leon Paul', 'X-Change FIE Mask', IMG.mask, 1, 1],

      [1, 4, 'Allstar FIE Mask (1600N)', 'allstar-fie-mask-1600n',
        'Allstar FIE 1600N mask with reinforced bib and comfortable padding. Available in all competition weapon configurations.',
        'Allstar', 'Inox Mask', IMG.mask, 1, 1],

      [2, 4, 'Uhlmann FIE Mask (1600N)', 'uhlmann-fie-mask-1600n',
        'German-made Uhlmann FIE mask with signature Uhlmann padding and FIE 2018 compliance. Includes insulated bib for all weapons.',
        'Uhlmann', 'Supreme Mask', IMG.mask, 1, 1],

      [1, 4, 'Allstar FIE Jacket (800N)', 'allstar-fie-jacket-800n',
        'FIE 800N approved fencing jacket with reinforced trigger line and front-zip design. Available in both right and left-hand configurations.',
        'Allstar', 'Ultimate Jacket', IMG.jacket, 1, 1],

      [1, 4, 'Leon Paul FIE Jacket (800N)', 'leon-paul-fie-jacket-800n',
        'Premium Leon Paul FIE 800N jacket with stretch fabric panels for maximum mobility. Favoured by elite international fencers.',
        'Leon Paul', 'Apex Jacket', IMG.jacket, 1, 1],

      [1, 4, 'Leon Paul FIE Glove', 'leon-paul-fie-glove',
        'FIE 800N reinforced fencing glove with gauntlet cuff and padded palm. Available in all sizes for both hands.',
        'Leon Paul', 'Apex Glove', IMG.glove, 1, 1],

      [1, 4, 'Allstar Plastron (800N)', 'allstar-plastron-800n',
        'FIE 800N underarm protector worn under the jacket. Covers armpit and weapon-arm shoulder as per FIE regulations.',
        'Allstar', 'Standard Plastron', IMG.plastron, 1, 1],

      [1, 4, 'Leon Paul FIE Breeches (800N)', 'leon-paul-fie-breeches-800n',
        'FIE 800N approved fencing breeches with knee-length cut and velcro leg closures. Comfortable stretch fabric for long bouts.',
        'Leon Paul', 'Apex Breeches', IMG.breeches, 1, 1],

      [1, 4, 'Fencing Chest Protector (Women)', 'fencing-chest-protector-women',
        'Moulded plastic chest protector required for female fencers under FIE rules. Shaped cups with adjustable straps.',
        'Allstar', 'Standard Chest Protector', IMG.plastron, 1, 1],

      // === ELECTRICAL EQUIPMENT (category 5) ===
      [1, 5, 'Leon Paul Foil Body Cord (2-Pin Bayonet)', 'leon-paul-foil-body-cord',
        'High-quality 2-pin bayonet foil body cord with reinforced clips and durable insulated wiring. Tested for competition reliability.',
        'Leon Paul', 'Pro Body Cord', IMG.cord, 1, 1],

      [1, 5, 'Allstar Épée Body Cord (3-Pin)', 'allstar-epee-body-cord',
        'Standard 3-pin épée body cord with industry-standard bayonet connectors. Fully insulated and FIE compliant.',
        'Allstar', 'Standard Body Cord', IMG.cord, 1, 1],

      [1, 5, 'Leon Paul Mask Cord (Foil/Sabre)', 'leon-paul-mask-cord',
        'Reliable mask cord for foil and sabre with crocodile clips. Replace regularly to avoid competition penalties.',
        'Leon Paul', 'Mask Cord', IMG.cord, 1, 1],

      [2, 5, 'Allstar Scoring Machine (Micro)', 'allstar-scoring-machine-micro',
        'Compact portable fencing scoring box for all three weapons. Includes audible signals, lights, and bout timer. Ideal for clubs and training.',
        'Allstar', 'Micro Scoring Box', IMG.scorebox, 1, 1],

      // === REPLACEMENT PARTS (category 6) ===
      [1, 6, 'Foil Tip Assembly Kit', 'foil-tip-assembly-kit',
        'Complete foil point assembly with barrel, spring, tip, and screws. Pack of 2 complete sets.',
        'Allstar', 'Tip Kit', IMG.tools, 1, 1],

      [1, 6, 'Épée Point Spring Set', 'epee-point-spring-set',
        'Pack of 10 FIE calibrated épée springs. Essential replacement part — keep spares in your fencing bag.',
        'Allstar', 'Épée Springs', IMG.tools, 1, 1],

      // === ACCESSORIES (category 7) ===
      [1, 7, 'Leon Paul Rollbag (Full Kit)', 'leon-paul-rollbag',
        'Spacious rolling fencing bag with compartments for 3 weapons, mask, jacket, breeches, gloves, and all accessories. The industry standard for travelling fencers.',
        'Leon Paul', 'Rollbag', IMG.bag, 1, 1],

      [1, 7, 'Fencing Toolkit (Complete)', 'fencing-toolkit-complete',
        'Full weapon maintenance toolkit with multimeter, allen keys, pliers, spare screws, and tip-barrel wrench. Essential for every serious fencer.',
        'Allstar', 'Pro Toolkit', IMG.tools, 1, 1],

      [1, 7, 'Fencing Socks (Knee-High, Pair)', 'fencing-socks-knee-high',
        'White knee-length fencing socks as per FIE uniform rules. Breathable cotton blend with reinforced heel.',
        'PBT', 'Classic Socks', IMG.socks, 1, 1]
    ];

    for (const p of products) {
      await db.run(
        'INSERT INTO products (supplier_id, category_id, name, slug, description, brand, model, image_url, active, approved) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        p
      );
    }
    console.log(`  ✓ ${products.length} Products created`);

    // --- Variants ---
    // Format: [product_id, sku, label, price_paise, size, hand, blade_length, grip_type, material, weapon_type, component_type, connector_spec, certification, compatibility, on_hand, reserved]
    const variants = [
      // Product 1: Leon Paul FIE Foil
      [1, 'LP-FOIL-FIE-5R-FR', 'Size 5 • Right • French Grip', 1850000, '5', 'Right', '90cm', 'French', 'Maraging Steel', 'Foil', 'Complete', '2-Pin Bayonet', 'FIE', 'Right-hand bayonet', 12, 0],
      [1, 'LP-FOIL-FIE-5L-FR', 'Size 5 • Left • French Grip', 1850000, '5', 'Left', '90cm', 'French', 'Maraging Steel', 'Foil', 'Complete', '2-Pin Bayonet', 'FIE', 'Left-hand bayonet', 6, 0],
      [1, 'LP-FOIL-FIE-5R-PI', 'Size 5 • Right • Pistol Grip', 1950000, '5', 'Right', '90cm', 'Pistol', 'Maraging Steel', 'Foil', 'Complete', '2-Pin Bayonet', 'FIE', 'Right-hand bayonet', 10, 0],
      [1, 'LP-FOIL-FIE-5L-PI', 'Size 5 • Left • Pistol Grip', 1950000, '5', 'Left', '90cm', 'Pistol', 'Maraging Steel', 'Foil', 'Complete', '2-Pin Bayonet', 'FIE', 'Left-hand bayonet', 4, 0],

      // Product 2: Allstar FIE Foil
      [2, 'AS-FOIL-FIE-5R', 'Size 5 • Right • Pistol', 1750000, '5', 'Right', '90cm', 'Pistol', 'Maraging Steel', 'Foil', 'Complete', '2-Pin Bayonet', 'FIE', 'Right-hand bayonet', 15, 0],
      [2, 'AS-FOIL-FIE-5L', 'Size 5 • Left • Pistol', 1750000, '5', 'Left', '90cm', 'Pistol', 'Maraging Steel', 'Foil', 'Complete', '2-Pin Bayonet', 'FIE', 'Left-hand bayonet', 5, 0],

      // Product 3: PBT Standard Foil
      [3, 'PBT-FOIL-STD-5R', 'Size 5 • Right', 650000, '5', 'Right', '90cm', 'French', 'Stainless Steel', 'Foil', 'Complete', '2-Pin Bayonet', 'Non-FIE', 'Training only', 25, 0],
      [3, 'PBT-FOIL-STD-5L', 'Size 5 • Left', 650000, '5', 'Left', '90cm', 'French', 'Stainless Steel', 'Foil', 'Complete', '2-Pin Bayonet', 'Non-FIE', 'Training only', 15, 0],
      [3, 'PBT-FOIL-STD-3R', 'Size 3 (Youth) • Right', 580000, '3', 'Right', '80cm', 'French', 'Stainless Steel', 'Foil', 'Complete', '2-Pin Bayonet', 'Non-FIE', 'Youth training', 20, 0],

      // Product 4: Allstar FIE Foil Blade
      [4, 'AS-BLADE-FOIL-0', 'Size 0 (Youth)', 420000, '0', null, '80cm', null, 'Maraging Steel', 'Foil', 'Blade', null, 'FIE', 'Standard tang', 30, 0],
      [4, 'AS-BLADE-FOIL-2', 'Size 2', 450000, '2', null, '85cm', null, 'Maraging Steel', 'Foil', 'Blade', null, 'FIE', 'Standard tang', 25, 0],
      [4, 'AS-BLADE-FOIL-5', 'Size 5 (Adult)', 480000, '5', null, '90cm', null, 'Maraging Steel', 'Foil', 'Blade', null, 'FIE', 'Standard tang', 40, 0],

      // Product 5: Leon Paul Foil Grip Set
      [5, 'LP-GRIP-FR', 'French Grip', 85000, null, null, null, 'French', 'Aluminium Alloy', 'Foil', 'Grip', null, null, 'Universal', 50, 0],
      [5, 'LP-GRIP-BE', 'Belgian Grip', 110000, null, null, null, 'Belgian', 'Aluminium Alloy', 'Foil', 'Grip', null, null, 'Universal', 30, 0],
      [5, 'LP-GRIP-VI-R', 'Visconti Pistol • Right', 135000, null, 'Right', null, 'Pistol', 'Aluminium Alloy', 'Foil', 'Grip', null, null, 'Right-handed only', 35, 0],
      [5, 'LP-GRIP-VI-L', 'Visconti Pistol • Left', 135000, null, 'Left', null, 'Pistol', 'Aluminium Alloy', 'Foil', 'Grip', null, null, 'Left-handed only', 15, 0],

      // Product 6: Leon Paul FIE Épée
      [6, 'LP-EPEE-FIE-5R', 'Size 5 • Right', 1950000, '5', 'Right', '90cm', 'Pistol', 'Maraging Steel', 'Épée', 'Complete', '3-Pin', 'FIE', 'Right-hand pistol', 10, 0],
      [6, 'LP-EPEE-FIE-5L', 'Size 5 • Left', 1950000, '5', 'Left', '90cm', 'Pistol', 'Maraging Steel', 'Épée', 'Complete', '3-Pin', 'FIE', 'Left-hand pistol', 4, 0],

      // Product 7: Uhlmann FIE Épée
      [7, 'UH-EPEE-FIE-5R', 'Size 5 • Right', 2200000, '5', 'Right', '90cm', 'Pistol', 'Maraging Steel', 'Épée', 'Complete', '3-Pin', 'FIE', 'Right-hand pistol', 6, 0],
      [7, 'UH-EPEE-FIE-5L', 'Size 5 • Left', 2200000, '5', 'Left', '90cm', 'Pistol', 'Maraging Steel', 'Épée', 'Complete', '3-Pin', 'FIE', 'Left-hand pistol', 2, 0],

      // Product 8: PBT FIE Épée Blade
      [8, 'PBT-BLADE-EPEE-5', 'Size 5', 520000, '5', null, '90cm', null, 'Maraging Steel', 'Épée', 'Blade', null, 'FIE', 'Pre-wired tip', 30, 0],
      [8, 'PBT-BLADE-EPEE-0', 'Size 0 (Youth)', 460000, '0', null, '80cm', null, 'Maraging Steel', 'Épée', 'Blade', null, 'FIE', 'Pre-wired tip', 20, 0],

      // Product 9: Allstar Épée Guard
      [9, 'AS-GUARD-EPEE-SI', 'Silver Finish', 95000, null, null, null, null, 'Aluminium Alloy', 'Épée', 'Guard', null, 'FIE', 'Universal', 40, 0],
      [9, 'AS-GUARD-EPEE-GO', 'Gold Anodised', 115000, null, null, null, null, 'Aluminium Alloy', 'Épée', 'Guard', null, 'FIE', 'Universal', 25, 0],

      // Product 10: Leon Paul FIE Sabre
      [10, 'LP-SABRE-FIE-5R', 'Size 5 • Right', 1550000, '5', 'Right', '88cm', null, 'Maraging Steel', 'Sabre', 'Complete', '2-Pin', 'FIE', 'Right-hand', 8, 0],
      [10, 'LP-SABRE-FIE-5L', 'Size 5 • Left', 1550000, '5', 'Left', '88cm', null, 'Maraging Steel', 'Sabre', 'Complete', '2-Pin', 'FIE', 'Left-hand', 3, 0],

      // Product 11: Allstar FIE Sabre
      [11, 'AS-SABRE-FIE-5R', 'Size 5 • Right', 1450000, '5', 'Right', '88cm', null, 'Maraging Steel', 'Sabre', 'Complete', '2-Pin', 'FIE', 'Right-hand', 10, 0],
      [11, 'AS-SABRE-FIE-5L', 'Size 5 • Left', 1450000, '5', 'Left', '88cm', null, 'Maraging Steel', 'Sabre', 'Complete', '2-Pin', 'FIE', 'Left-hand', 4, 0],

      // Product 12: PBT Sabre Blade
      [12, 'PBT-BLADE-SABRE-5', 'Size 5', 440000, '5', null, '88cm', null, 'Maraging Steel', 'Sabre', 'Blade', null, 'FIE', 'Standard tang', 25, 0],

      // Product 13: Leon Paul FIE Mask
      [13, 'LP-MASK-FIE-S', 'Small', 1250000, 'S', null, null, null, 'FIE Mesh', null, null, null, 'FIE 1600N', 'All weapons', 12, 0],
      [13, 'LP-MASK-FIE-M', 'Medium', 1250000, 'M', null, null, null, 'FIE Mesh', null, null, null, 'FIE 1600N', 'All weapons', 18, 0],
      [13, 'LP-MASK-FIE-L', 'Large', 1250000, 'L', null, null, null, 'FIE Mesh', null, null, null, 'FIE 1600N', 'All weapons', 10, 0],
      [13, 'LP-MASK-FIE-XL', 'Extra Large', 1280000, 'XL', null, null, null, 'FIE Mesh', null, null, null, 'FIE 1600N', 'All weapons', 5, 0],

      // Product 14: Allstar FIE Mask
      [14, 'AS-MASK-FIE-S', 'Small', 1150000, 'S', null, null, null, 'FIE Mesh', null, null, null, 'FIE 1600N', 'All weapons', 10, 0],
      [14, 'AS-MASK-FIE-M', 'Medium', 1150000, 'M', null, null, null, 'FIE Mesh', null, null, null, 'FIE 1600N', 'All weapons', 15, 0],
      [14, 'AS-MASK-FIE-L', 'Large', 1150000, 'L', null, null, null, 'FIE Mesh', null, null, null, 'FIE 1600N', 'All weapons', 10, 0],

      // Product 15: Uhlmann FIE Mask
      [15, 'UH-MASK-FIE-M', 'Medium', 1380000, 'M', null, null, null, 'FIE Mesh', null, null, null, 'FIE 1600N', 'All weapons', 8, 0],
      [15, 'UH-MASK-FIE-L', 'Large', 1380000, 'L', null, null, null, 'FIE Mesh', null, null, null, 'FIE 1600N', 'All weapons', 6, 0],

      // Product 16: Allstar FIE Jacket
      [16, 'AS-JACKET-FIE-S-R', 'S • Right', 980000, 'S', 'Right', null, null, 'FIE Fabric', null, null, null, 'FIE 800N', 'Right-hand closure', 15, 0],
      [16, 'AS-JACKET-FIE-M-R', 'M • Right', 980000, 'M', 'Right', null, null, 'FIE Fabric', null, null, null, 'FIE 800N', 'Right-hand closure', 20, 0],
      [16, 'AS-JACKET-FIE-L-R', 'L • Right', 980000, 'L', 'Right', null, null, 'FIE Fabric', null, null, null, 'FIE 800N', 'Right-hand closure', 12, 0],
      [16, 'AS-JACKET-FIE-M-L', 'M • Left', 980000, 'M', 'Left', null, null, 'FIE Fabric', null, null, null, 'FIE 800N', 'Left-hand closure', 8, 0],
      [16, 'AS-JACKET-FIE-L-L', 'L • Left', 980000, 'L', 'Left', null, null, 'FIE Fabric', null, null, null, 'FIE 800N', 'Left-hand closure', 5, 0],

      // Product 17: Leon Paul FIE Jacket
      [17, 'LP-JACKET-FIE-M-R', 'M • Right', 1150000, 'M', 'Right', null, null, 'FIE Stretch Fabric', null, null, null, 'FIE 800N', 'Right-hand closure', 10, 0],
      [17, 'LP-JACKET-FIE-L-R', 'L • Right', 1150000, 'L', 'Right', null, null, 'FIE Stretch Fabric', null, null, null, 'FIE 800N', 'Right-hand closure', 8, 0],

      // Product 18: Leon Paul FIE Glove
      [18, 'LP-GLOVE-FIE-S-R', 'S • Right', 380000, 'S', 'Right', null, null, 'FIE Leather', null, null, null, 'FIE 800N', 'Right-handed', 20, 0],
      [18, 'LP-GLOVE-FIE-M-R', 'M • Right', 380000, 'M', 'Right', null, null, 'FIE Leather', null, null, null, 'FIE 800N', 'Right-handed', 25, 0],
      [18, 'LP-GLOVE-FIE-L-R', 'L • Right', 380000, 'L', 'Right', null, null, 'FIE Leather', null, null, null, 'FIE 800N', 'Right-handed', 15, 0],
      [18, 'LP-GLOVE-FIE-M-L', 'M • Left', 380000, 'M', 'Left', null, null, 'FIE Leather', null, null, null, 'FIE 800N', 'Left-handed', 8, 0],
      [18, 'LP-GLOVE-FIE-L-L', 'L • Left', 380000, 'L', 'Left', null, null, 'FIE Leather', null, null, null, 'FIE 800N', 'Left-handed', 5, 0],

      // Product 19: Allstar Plastron
      [19, 'AS-PLAS-R', 'Right-arm', 250000, null, 'Right', null, null, 'FIE Fabric', null, null, null, 'FIE 800N', 'Right-handed fencer', 25, 0],
      [19, 'AS-PLAS-L', 'Left-arm', 250000, null, 'Left', null, null, 'FIE Fabric', null, null, null, 'FIE 800N', 'Left-handed fencer', 12, 0],

      // Product 20: Leon Paul FIE Breeches
      [20, 'LP-BREECH-FIE-S', 'Small', 850000, 'S', null, null, null, 'FIE Stretch Fabric', null, null, null, 'FIE 800N', 'Universal', 12, 0],
      [20, 'LP-BREECH-FIE-M', 'Medium', 850000, 'M', null, null, null, 'FIE Stretch Fabric', null, null, null, 'FIE 800N', 'Universal', 18, 0],
      [20, 'LP-BREECH-FIE-L', 'Large', 850000, 'L', null, null, null, 'FIE Stretch Fabric', null, null, null, 'FIE 800N', 'Universal', 10, 0],

      // Product 21: Chest Protector (Women)
      [21, 'AS-CHEST-W-S', 'Small', 180000, 'S', null, null, null, 'Moulded Plastic', null, null, null, 'FIE', 'Women fencers', 15, 0],
      [21, 'AS-CHEST-W-M', 'Medium', 180000, 'M', null, null, null, 'Moulded Plastic', null, null, null, 'FIE', 'Women fencers', 18, 0],
      [21, 'AS-CHEST-W-L', 'Large', 180000, 'L', null, null, null, 'Moulded Plastic', null, null, null, 'FIE', 'Women fencers', 10, 0],

      // Product 22: Leon Paul Foil Body Cord
      [22, 'LP-BCORD-FOIL', 'Standard Length (2m)', 120000, null, null, null, null, 'Insulated Copper', 'Foil', 'Body Cord', '2-Pin Bayonet', null, 'Foil weapons', 40, 0],

      // Product 23: Allstar Épée Body Cord
      [23, 'AS-BCORD-EPEE', 'Standard Length (2m)', 135000, null, null, null, null, 'Insulated Copper', 'Épée', 'Body Cord', '3-Pin', null, 'Épée weapons', 35, 0],

      // Product 24: Leon Paul Mask Cord
      [24, 'LP-MCORD', 'Standard', 95000, null, null, null, null, 'Insulated Copper', null, 'Mask Cord', 'Croc Clip', null, 'Foil / Sabre', 50, 0],

      // Product 25: Allstar Scoring Machine
      [25, 'AS-SCORE-MICRO', 'Micro Scoring Box', 4500000, null, null, null, null, 'Electronic', null, 'Scoring Box', 'All weapons', 'FIE Compatible', 'All weapons', 5, 0],

      // Product 26: Foil Tip Assembly Kit
      [26, 'AS-TIP-KIT-FOIL', 'Pack of 2', 85000, null, null, null, null, 'Steel + Spring', 'Foil', 'Tip Assembly', null, 'FIE', 'Foil weapons', 60, 0],

      // Product 27: Épée Point Spring Set
      [27, 'AS-SPRING-EPEE-10', 'Pack of 10', 65000, null, null, null, null, 'Spring Steel', 'Épée', 'Spring', null, 'FIE Calibrated', 'Épée tips', 80, 0],

      // Product 28: Leon Paul Rollbag
      [28, 'LP-BAG-ROLL-STD', 'Standard (3 weapons)', 1250000, null, null, null, null, 'Ballistic Nylon', null, 'Bag', null, null, 'Universal', 20, 0],
      [28, 'LP-BAG-ROLL-LRG', 'Large (6 weapons)', 1550000, null, null, null, null, 'Ballistic Nylon', null, 'Bag', null, null, 'Universal', 10, 0],

      // Product 29: Fencing Toolkit
      [29, 'AS-TOOL-PRO', 'Pro Toolkit', 320000, null, null, null, null, 'Mixed Steel', null, 'Toolkit', null, null, 'Universal', 25, 0],

      // Product 30: Fencing Socks
      [30, 'PBT-SOCK-M', 'Medium', 45000, 'M', null, null, null, 'Cotton Blend', null, 'Socks', null, 'FIE Uniform', 'Universal', 60, 0],
      [30, 'PBT-SOCK-L', 'Large', 45000, 'L', null, null, null, 'Cotton Blend', null, 'Socks', null, 'FIE Uniform', 'Universal', 50, 0]
    ];

    for (const v of variants) {
      await db.run(
        `INSERT INTO product_variants (product_id, sku, label, price_paise, size, hand, blade_length, grip_type, material, weapon_type, component_type, connector_spec, certification, compatibility, on_hand, reserved)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        v
      );
    }
    console.log(`  ✓ ${variants.length} Variants created`);

    // --- Serviceable PIN Codes ---
    const pins = [
      ['400001', 'Mumbai', 'Maharashtra', 1, 1],
      ['400002', 'Mumbai', 'Maharashtra', 1, 1],
      ['400053', 'Mumbai', 'Maharashtra', 1, 1],
      ['400070', 'Mumbai', 'Maharashtra', 1, 1],
      ['110001', 'Delhi', 'Delhi', 1, 0],
      ['110002', 'Delhi', 'Delhi', 1, 0],
      ['110005', 'Delhi', 'Delhi', 1, 0],
      ['560001', 'Bangalore', 'Karnataka', 1, 0],
      ['560034', 'Bangalore', 'Karnataka', 1, 0],
      ['600001', 'Chennai', 'Tamil Nadu', 1, 0],
      ['700001', 'Kolkata', 'West Bengal', 1, 0],
      ['500001', 'Hyderabad', 'Telangana', 1, 0],
      ['380001', 'Ahmedabad', 'Gujarat', 1, 0],
      ['411001', 'Pune', 'Maharashtra', 1, 1],
      ['302001', 'Jaipur', 'Rajasthan', 1, 0],
      ['226001', 'Lucknow', 'Uttar Pradesh', 1, 0],
      ['682001', 'Kochi', 'Kerala', 1, 0],
      ['390001', 'Vadodara', 'Gujarat', 1, 0],
      ['208001', 'Kanpur', 'Uttar Pradesh', 1, 0],
      ['462001', 'Bhopal', 'Madhya Pradesh', 1, 0]
    ];
    for (const p of pins) {
      await db.run(
        'INSERT INTO serviceable_pins (pincode, city, state, standard_shipping, local_express) VALUES (?, ?, ?, ?, ?)',
        p
      );
    }
    console.log('  ✓ PIN codes created');

    console.log('\n✅ Database seeding complete!');
    console.log(`   • ${products.length} products across ${categories.length} categories`);
    console.log(`   • ${variants.length} variants with sizes/hands/specs`);
    console.log(`   • ${pins.length} serviceable PIN codes`);
    console.log('\n📋 Demo Accounts:');
    console.log('   Customer: customer@demo.com / demo123');
    console.log('   Supplier: supplier@demo.com / demo123');
    console.log('   Admin:    admin@demo.com / demo123');
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    throw err;
  }
}

if (require.main === module) {
  seedDatabase().then(() => process.exit(0));
}

module.exports = seedDatabase;