import { getPool } from '../config/db.js';


class Medicine {
  static async create(medicineData) {
    const pool = getPool();
    const {
      name, generic_name, category_id, manufacturer, description,
      dosage_form, strength, unit_of_measure, package_size,
      requires_prescription, storage_conditions, side_effects,
      barcode, sku, reorder_level
    } = medicineData;
    
    const [result] = await pool.query(
      `INSERT INTO medicines (name, generic_name, category_id, manufacturer, description,
       dosage_form, strength, unit_of_measure, package_size, requires_prescription,
       storage_conditions, side_effects, barcode, sku, reorder_level)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, generic_name, category_id, manufacturer, description, dosage_form,
       strength, unit_of_measure, package_size, requires_prescription,
       storage_conditions, side_effects, barcode, sku, reorder_level || 10]
    ); 
    return result.insertId;
  }

  static async findById(id) {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT m.*, c.name as category_name,
       COALESCE(SUM(s.quantity), 0) as total_stock
       FROM medicines m
       LEFT JOIN categories c ON m.category_id = c.id
       LEFT JOIN stock s ON m.id = s.medicine_id
       WHERE m.id = ?
       GROUP BY m.id`,
      [id]
    );
    return rows[0];
  }

  static async getAll(filters = {}) {
    const pool = getPool();
    let query = `
      SELECT m.*, c.name as category_name,
      COALESCE(SUM(s.quantity), 0) as total_stock
      FROM medicines m
      LEFT JOIN categories c ON m.category_id = c.id
      LEFT JOIN stock s ON m.id = s.medicine_id
      WHERE 1=1
    `;
    const params = [];

    if (filters.category_id) {
      query += ' AND m.category_id = ?';
      params.push(filters.category_id);
    }

    if (filters.dosage_form) {
      query += ' AND m.dosage_form = ?';
      params.push(filters.dosage_form);
    }

    if (filters.requires_prescription !== undefined) {
      query += ' AND m.requires_prescription = ?';
      params.push(filters.requires_prescription);
    }

    if (filters.is_active !== undefined) {
      query += ' AND m.is_active = ?';
      params.push(filters.is_active);
    }

    if (filters.search) {
      query += ' AND (m.name LIKE ? OR m.generic_name LIKE ? OR m.manufacturer LIKE ? OR m.barcode LIKE ? OR m.sku LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    query += ' GROUP BY m.id';

    if (filters.sort) {
      const sortField = filters.sort.startsWith('-') ? filters.sort.substring(1) : filters.sort;
      const sortOrder = filters.sort.startsWith('-') ? 'DESC' : 'ASC';
      query += ` ORDER BY m.${sortField} ${sortOrder}`;
    } else {
      query += ' ORDER BY m.created_at DESC';
    }

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(parseInt(filters.limit));
      
      if (filters.offset) {
        query += ' OFFSET ?';
        params.push(parseInt(filters.offset));
      }
    }

    const [rows] = await pool.query(query, params);
    return rows;
  }

  static async update(id, medicineData) {
    const pool = getPool();
    const {
      name, generic_name, category_id, manufacturer, description,
      dosage_form, strength, unit_of_measure, package_size,
      requires_prescription, storage_conditions, side_effects,
      barcode, sku, reorder_level, is_active
    } = medicineData;
    
    const [result] = await pool.query(
      `UPDATE medicines SET 
       name = ?, generic_name = ?, category_id = ?, manufacturer = ?,
       description = ?, dosage_form = ?, strength = ?, unit_of_measure = ?,
       package_size = ?, requires_prescription = ?, storage_conditions = ?,
       side_effects = ?, barcode = ?, sku = ?, reorder_level = ?, is_active = ?
       WHERE id = ?`,
      [name, generic_name, category_id, manufacturer, description, dosage_form,
       strength, unit_of_measure, package_size, requires_prescription,
       storage_conditions, side_effects, barcode, sku, reorder_level, is_active, id]
    );
    
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const pool = getPool();
    const [result] = await pool.query('DELETE FROM medicines WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async getLowStock(threshold) {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT m.*, c.name as category_name,
       COALESCE(SUM(s.quantity), 0) as total_stock
       FROM medicines m
       LEFT JOIN categories c ON m.category_id = c.id
       LEFT JOIN stock s ON m.id = s.medicine_id
       WHERE m.is_active = true
       GROUP BY m.id
       HAVING total_stock <= m.reorder_level
       ORDER BY total_stock ASC`
    );
    return rows;
  }

  static async getExpiringSoon(days = 30) {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT m.*, s.batch_number, s.expiry_date, s.quantity, c.name as category_name
       FROM medicines m
       INNER JOIN stock s ON m.id = s.medicine_id
       LEFT JOIN categories c ON m.category_id = c.id
       WHERE s.expiry_date <= DATE_ADD(CURDATE(), INTERVAL ? DAY)
       AND s.expiry_date >= CURDATE()
       AND s.quantity > 0
       ORDER BY s.expiry_date ASC`,
      [days]
    );
    return rows;
  }
}

export default Medicine;