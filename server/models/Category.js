import { getPool } from "../config/db.js";

class Category {
  static async create(categoryData) {
    const pool = getPool();
    const { name, description } = categoryData;
    
    const [result] = await pool.query(
      'INSERT INTO categories (name, description) VALUES (?, ?)',
      [name, description]
    );
    
    return result.insertId;
  }

  static async findById(id) {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT c.*, COUNT(m.id) as medicine_count
       FROM categories c
       LEFT JOIN medicines m ON c.id = m.category_id
       WHERE c.id = ?
       GROUP BY c.id`,
      [id]
    );
    return rows[0];
  }

  static async getAll(filters = {}) {
    const pool = getPool();
    let query = `
      SELECT c.*, COUNT(m.id) as medicine_count
      FROM categories c
      LEFT JOIN medicines m ON c.id = m.category_id
      WHERE 1=1
    `;
    const params = [];

    if (filters.search) {
      query += ' AND (c.name LIKE ? OR c.description LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm);
    }

    query += ' GROUP BY c.id ORDER BY c.name ASC';

    const [rows] = await pool.query(query, params);
    return rows;
  }

  static async update(id, categoryData) {
    const pool = getPool();
    const { name, description } = categoryData;
    
    const [result] = await pool.query(
      'UPDATE categories SET name = ?, description = ? WHERE id = ?',
      [name, description, id]
    );
    
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const pool = getPool();
    const [result] = await pool.query('DELETE FROM categories WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

export default Category;