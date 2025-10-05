import { getPool } from "../config/db.js";

class Sale {
  static async create(saleData, items) {
    const pool = getPool();
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const {
        invoice_number, customer_name, customer_phone, customer_email,
        sale_date, total_amount, tax_amount, discount_amount, net_amount,
        payment_method, payment_status, prescription_number, notes, user_id
      } = saleData;
      
      const [result] = await connection.query(
        `INSERT INTO sales (invoice_number, customer_name, customer_phone,
         customer_email, sale_date, total_amount, tax_amount, discount_amount,
         net_amount, payment_method, payment_status, prescription_number, notes, user_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [invoice_number, customer_name, customer_phone, customer_email, sale_date,
         total_amount, tax_amount, discount_amount, net_amount, payment_method,
         payment_status, prescription_number, notes, user_id]
      );
      
      const saleId = result.insertId;
      
      for (const item of items) {
        const [stock] = await connection.query(
          'SELECT quantity FROM stock WHERE id = ?',
          [item.stock_id]
        );
        
        if (stock.length === 0 || stock[0].quantity < item.quantity) {
          throw new Error(`Insufficient stock for medicine ID ${item.medicine_id}`);
        }
        
        await connection.query(
          `INSERT INTO sale_items (sale_id, medicine_id, stock_id, quantity,
           unit_price, total_price) VALUES (?, ?, ?, ?, ?, ?)`,
          [saleId, item.medicine_id, item.stock_id, item.quantity,
           item.unit_price, item.total_price]
        );
        
        await connection.query(
          'UPDATE stock SET quantity = quantity - ? WHERE id = ?',
          [item.quantity, item.stock_id]
        );
      }
      
      await connection.commit();
      return saleId;
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
      `SELECT s.*, u.full_name as created_by
       FROM sales s
       LEFT JOIN users u ON s.user_id = u.id
       WHERE s.id = ?`,
      [id]
    );
    
    if (rows.length === 0) return null;
    
    const sale = rows[0];
    
    const [items] = await pool.query(
      `SELECT si.*, m.name as medicine_name, m.generic_name,
       st.batch_number, st.expiry_date
       FROM sale_items si
       INNER JOIN medicines m ON si.medicine_id = m.id
       INNER JOIN stock st ON si.stock_id = st.id
       WHERE si.sale_id = ?`,
      [id]
    );
    
    sale.items = items;
    return sale;
  }

  static async getAll(filters = {}) {
    const pool = getPool();
    let query = `
      SELECT s.*, u.full_name as created_by
      FROM sales s
      LEFT JOIN users u ON s.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.payment_method) {
      query += ' AND s.payment_method = ?';
      params.push(filters.payment_method);
    }

    if (filters.payment_status) {
      query += ' AND s.payment_status = ?';
      params.push(filters.payment_status);
    }

    if (filters.from_date) {
      query += ' AND s.sale_date >= ?';
      params.push(filters.from_date);
    }

    if (filters.to_date) {
      query += ' AND s.sale_date <= ?';
      params.push(filters.to_date);
    }

    if (filters.customer_phone) {
      query += ' AND s.customer_phone = ?';
      params.push(filters.customer_phone);
    }

    if (filters.search) {
      query += ' AND (s.invoice_number LIKE ? OR s.customer_name LIKE ? OR s.customer_phone LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY s.sale_date DESC, s.created_at DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(parseInt(filters.limit));
    }

    const [rows] = await pool.query(query, params);
    return rows;
  }

  static async update(id, saleData) {
    const pool = getPool();
    const { payment_status, notes } = saleData;
    
    const [result] = await pool.query(
      'UPDATE sales SET payment_status = ?, notes = ? WHERE id = ?',
      [payment_status, notes, id]
    );
    
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const pool = getPool();
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const [items] = await connection.query(
        'SELECT stock_id, quantity FROM sale_items WHERE sale_id = ?',
        [id]
      );
      
      for (const item of items) {
        await connection.query(
          'UPDATE stock SET quantity = quantity + ? WHERE id = ?',
          [item.quantity, item.stock_id]
        );
      }
      
      await connection.query('DELETE FROM sales WHERE id = ?', [id]);
      
      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async getSalesReport(fromDate, toDate) {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT 
       COUNT(*) as total_sales,
       SUM(net_amount) as total_revenue,
       SUM(tax_amount) as total_tax,
       SUM(discount_amount) as total_discount,
       AVG(net_amount) as average_sale
       FROM sales
       WHERE sale_date BETWEEN ? AND ?`,
      [fromDate, toDate]
    );
    return rows[0];
  }
}
export default Sale;