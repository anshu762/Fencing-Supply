/**
 * Stock Management Utilities
 * Handles reservation, release, and availability checks
 */
const db = require('../database/db');

const StockManager = {
  /**
   * Check if variant has enough available stock
   */
  async checkAvailability(variantId, quantity) {
    const v = await db.get(
      'SELECT on_hand, reserved FROM product_variants WHERE id = ? AND active = 1',
      [variantId]
    );
    if (!v) return { available: false, reason: 'Variant not found' };
    const available = v.on_hand - v.reserved;
    if (available < quantity) {
      return { available: false, reason: `Only ${available} in stock` };
    }
    return { available: true, count: available };
  },

  /**
   * Reserve stock atomically (PostgreSQL handles row-level locking)
   */
  async reserve(variantId, quantity) {
    const result = await db.run(
      `UPDATE product_variants
       SET reserved = reserved + ?, updated_at = NOW()
       WHERE id = ? AND (on_hand - reserved) >= ?`,
      [quantity, variantId, quantity]
    );
    return result.changes > 0;
  },

  /**
   * Release reserved stock
   */
  async release(variantId, quantity) {
    await db.run(
      'UPDATE product_variants SET reserved = GREATEST(0, reserved - ?), updated_at = NOW() WHERE id = ?',
      [quantity, variantId]
    );
  },

  /**
   * Confirm reservation (move from reserved to sold)
   */
  async confirmSale(variantId, quantity) {
    await db.run(
      `UPDATE product_variants
       SET on_hand = on_hand - ?, reserved = GREATEST(0, reserved - ?), updated_at = NOW()
       WHERE id = ?`,
      [quantity, quantity, variantId]
    );
  },

  /**
   * Adjust stock manually (admin/supplier)
   */
  async adjust(variantId, newOnHand, actorId) {
    const v = await db.get('SELECT on_hand FROM product_variants WHERE id = ?', [variantId]);
    if (!v) throw new Error('Variant not found');
    await db.run(
      'UPDATE product_variants SET on_hand = ?, updated_at = NOW() WHERE id = ?',
      [newOnHand, variantId]
    );
    return { previous: v.on_hand, current: newOnHand };
  },

  /**
   * Get availability for all variants of a product
   */
  async getProductAvailability(productId) {
    const variants = await db.all(
      `SELECT id, sku, label, on_hand, reserved, (on_hand - reserved) as available
       FROM product_variants WHERE product_id = ? AND active = 1`,
      [productId]
    );
    return variants;
  }
};

module.exports = StockManager;