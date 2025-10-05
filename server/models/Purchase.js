import { getPool } from "../config/db.js";

class Purchase {
  static async create(purchaseData, items) {
    const pool = getPool();
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const {
        invoice_number, supplier_id, purchase_date, total_amount,
        tax_amount, discount_amount, net_amount, payment_status,
        payment_method, notes, user_id
      } = purchaseData;
      
      const [result] = await connection.query(
        `INSERT INTO purchases (invoice_number, supplier_id, purchase_date, 
         total_amount, tax_amount, discount_amount, net_amount, payment_status,
         payment_method, notes, user_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [invoice_number, supplier_id, purchase_date, total_amount, tax_amount,
         discount_amount, net_amount, payment_status, payment_method, notes, user_id]
      );
      
      const purchaseId = result.insertId;
      
      for (const item of items) {
        await connection.query(
          `INSERT INTO purchase_items (purchase_id, medicine_id, batch_number,
           quantity, unit_price, total_price, expiry_date, manufacture_date)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [purchaseId, item.medicine_id, item.batch_number, item.quantity,
           item.unit_price, item.total_price, item.expiry_date, item.manufacture_date]
        );
        
        const [existing] = await connection.query(
          'SELECT id, quantity FROM stock WHERE medicine_id = ? AND batch_number = ?',
          [item.medicine_id, item.batch_number]
        );
        
        if (existing.length > 0) {
          await connection.query(
            'UPDATE stock SET quantity = quantity + ? WHERE id = ?',
            [item.quantity, existing[0].id]
          );
        } else {
          await connection.query(
            `INSERT INTO stock (medicine_id, batch_number, quantity, unit_price,
             selling_price, manufacture_date, expiry_date, supplier_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [item.medicine_id, item.batch_number, item.quantity, item.unit_price,
             item.selling_price || item.unit_price * 1.3, item.manufacture_date,
             item.expiry_date, supplier_id]
          );
        }
      }
      
      await connection.commit();
      return purchaseId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async findById(id) {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT p.*, s.name as supplier_name, s.company_name,
       u.full_name as created_by
       FROM purchases p
       INNER JOIN suppliers s ON p.supplier_id = s.id
       LEFT JOIN users u ON p.user_id = u.id
       WHERE p.id = ?`,
      [id]
    );
    
    if (rows.length === 0) return null;
    
    const purchase = rows[0];
    
    const [items] = await pool.query(
      `SELECT pi.*, m.name as medicine_name, m.generic_name
       FROM purchase_items pi
       INNER JOIN medicines m ON pi.medicine_id = m.id
       WHERE pi.purchase_id = ?`,
      [id]
    );
    
    purchase.items = items;
    return purchase;
  }

  static async getAll(filters = {}) {
    const pool = getPool();
    let query = `
      SELECT p.*, s.name as supplier_name, u.full_name as created_by
      FROM purchases p
      INNER JOIN suppliers s ON p.supplier_id = s.id
      LEFT JOIN users u ON p.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.supplier_id) {
      query += ' AND p.supplier_id = ?';
      params.push(filters.supplier_id);
    }

    if (filters.payment_status) {
      query += ' AND p.payment_status = ?';
      params.push(filters.payment_status);
    }

    if (filters.from_date) {
      query += ' AND p.purchase_date >= ?';
      params.push(filters.from_date);
    }

    if (filters.to_date) {
      query += ' AND p.purchase_date <= ?';
      params.push(filters.to_date);
    }

    if (filters.search) {
      query += ' AND (p.invoice_number LIKE ? OR s.name LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm);
    }

    query += ' ORDER BY p.purchase_date DESC, p.created_at DESC';

    const [rows] = await pool.query(query, params);
    return rows;
  }

  static async update(id, purchaseData) {
    const pool = getPool();
    const {
      payment_status, payment_method, notes
    } = purchaseData;
    
    const [result] = await pool.query(
      `UPDATE purchases SET payment_status = ?, payment_method = ?, notes = ?
       WHERE id = ?`,
      [payment_status, payment_method, notes, id]
    );
    
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const pool = getPool();
    const [result] = await pool.query('DELETE FROM purchases WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

export default  Purchase;