import {getPool} from '../config/db.js'

class Supplier {
  static async create(supplierData) {
    const pool = getPool();
    const {
      name, company_name, email, phone, address, city, country,
      tax_id, payment_terms
    } = supplierData;
    
    const [result] = await pool.query(
      `INSERT INTO suppliers (name, company_name, email, phone, address, city, 
       country, tax_id, payment_terms) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, company_name, email, phone, address, city, country, tax_id, payment_terms]
    );
    
    return result.insertId;
  }
  static async findById(id) {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT s.*, COUNT(DISTINCT p.id) as purchase_count,
       COALESCE(SUM(p.net_amount), 0) as total_purchased
       FROM suppliers s
       LEFT JOIN purchases p ON s.id = p.supplier_id
       WHERE s.id = ?
       GROUP BY s.id`,
      [id]
    );
    return rows[0];
  }
  static async getAll(filters = {}) {
    const pool = getPool();
    let query = `
      SELECT s.*, COUNT(DISTINCT p.id) as purchase_count,
      COALESCE(SUM(p.net_amount), 0) as total_purchased
      FROM suppliers s
      LEFT JOIN purchases p ON s.id = p.supplier_id
      WHERE 1=1
    `;
    const params = [];

    if (filters.is_active !== undefined) {
      query += ' AND s.is_active = ?';
      params.push(filters.is_active);
    }

    if (filters.search) {
      query += ' AND (s.name LIKE ? OR s.company_name LIKE ? OR s.email LIKE ? OR s.phone LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (filters.city) {
      query += ' AND s.city = ?';
      params.push(filters.city);
    }

    if (filters.country) {
      query += ' AND s.country = ?';
      params.push(filters.country);
    }

    query += ' GROUP BY s.id ORDER BY s.name ASC';

    const [rows] = await pool.query(query, params);
    return rows;
  }
  static async update(id, supplierData) {
    const pool = getPool();
    const {
      name, company_name, email, phone, address, city, country,
      tax_id, payment_terms, is_active
    } = supplierData;
    
    const [result] = await pool.query(
      `UPDATE suppliers SET name = ?, company_name = ?, email = ?, phone = ?,
       address = ?, city = ?, country = ?, tax_id = ?, payment_terms = ?,
       is_active = ? WHERE id = ?`,
      [name, company_name, email, phone, address, city, country, tax_id,
       payment_terms, is_active, id]
    );
    
    return result.affectedRows > 0;
  }
  static async delete(id) {
    const pool = getPool();
    const [result] = await pool.query('DELETE FROM suppliers WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}
export default Supplier;