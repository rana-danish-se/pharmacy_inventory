import {getPool} from '../config/db.js'

class Stock {
  static async create(stockData) {
    const pool = getPool();
    const {
      medicine_id, batch_number, quantity, unit_price, selling_price,
      manufacture_date, expiry_date, supplier_id, location
    } = stockData;
    
    const [result] = await pool.query(
      `INSERT INTO stock (medicine_id, batch_number, quantity, unit_price, 
       selling_price, manufacture_date, expiry_date, supplier_id, location)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [medicine_id, batch_number, quantity, unit_price, selling_price,
       manufacture_date, expiry_date, supplier_id, location]
    );
    
    return result.insertId;
  }

  static async findById(id) {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT s.*, m.name as medicine_name, m.generic_name,
       sup.name as supplier_name
       FROM stock s
       INNER JOIN medicines m ON s.medicine_id = m.id
       LEFT JOIN suppliers sup ON s.supplier_id = sup.id
       WHERE s.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async getAll(filters = {}) {
    const pool = getPool();
    let query = `
      SELECT s.*, m.name as medicine_name, m.generic_name,
      m.dosage_form, sup.name as supplier_name
      FROM stock s
      INNER JOIN medicines m ON s.medicine_id = m.id
      LEFT JOIN suppliers sup ON s.supplier_id = sup.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.medicine_id) {
      query += ' AND s.medicine_id = ?';
      params.push(filters.medicine_id);
    }

    if (filters.supplier_id) {
      query += ' AND s.supplier_id = ?';
      params.push(filters.supplier_id);
    }

    if (filters.batch_number) {
      query += ' AND s.batch_number LIKE ?';
      params.push(`%${filters.batch_number}%`);
    }

    if (filters.location) {
      query += ' AND s.location LIKE ?';
      params.push(`%${filters.location}%`);
    }

    if (filters.low_stock) {
      query += ' AND s.quantity <= ?';
      params.push(filters.low_stock);
    }

    if (filters.expiring_soon) {
      query += ' AND s.expiry_date <= DATE_ADD(CURDATE(), INTERVAL ? DAY) AND s.expiry_date >= CURDATE()';
      params.push(filters.expiring_soon);
    }

    if (filters.search) {
      query += ' AND (m.name LIKE ? OR m.generic_name LIKE ? OR s.batch_number LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (filters.sort) {
      const sortField = filters.sort.startsWith('-') ? filters.sort.substring(1) : filters.sort;
      const sortOrder = filters.sort.startsWith('-') ? 'DESC' : 'ASC';
      query += ` ORDER BY s.${sortField} ${sortOrder}`;
    } else {
      query += ' ORDER BY s.expiry_date ASC';
    }

    const [rows] = await pool.query(query, params);
    return rows;
  }

  static async update(id, stockData) {
    const pool = getPool();
    const {
      quantity, unit_price, selling_price, manufacture_date,
      expiry_date, location
    } = stockData;
    
    const [result] = await pool.query(
      `UPDATE stock SET quantity = ?, unit_price = ?, selling_price = ?,
       manufacture_date = ?, expiry_date = ?, location = ?
       WHERE id = ?`,
      [quantity, unit_price, selling_price, manufacture_date, expiry_date, location, id]
    );
    
    return result.affectedRows > 0;
  }

  static async updateQuantity(id, quantity) {
    const pool = getPool();
    const [result] = await pool.query(
      'UPDATE stock SET quantity = ? WHERE id = ?',
      [quantity, id]
    );
    return result.affectedRows > 0;
  }

  static async reduceQuantity(id, quantity) {
    const pool = getPool();
    const [result] = await pool.query(
      'UPDATE stock SET quantity = quantity - ? WHERE id = ? AND quantity >= ?',
      [quantity, id, quantity]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const pool = getPool();
    const [result] = await pool.query('DELETE FROM stock WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async getByMedicine(medicineId) {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT s.*, sup.name as supplier_name
       FROM stock s
       LEFT JOIN suppliers sup ON s.supplier_id = sup.id
       WHERE s.medicine_id = ? AND s.quantity > 0
       ORDER BY s.expiry_date ASC`,
      [medicineId]
    );
    return rows;
  }

  static async getTotalStock(medicineId) {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT COALESCE(SUM(quantity), 0) as total FROM stock WHERE medicine_id = ?',
      [medicineId]
    );
    return rows[0].total;
  }
}

export default Stock;