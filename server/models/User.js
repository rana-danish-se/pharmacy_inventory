import {getPool} from '../config/db.js';
import bcrypt from 'bcrypt';


class User {
  static async create(userData) {
    const pool = getPool();
    const { username, email, password, full_name, role, phone, address } = userData;
    
    const hashedPassword = await bcrypt.hash(password, 10);    
    const [result] = await pool.query(
      `INSERT INTO users (username, email, password, full_name, role, phone, address) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [username, email, hashedPassword, full_name, role || 'staff', phone, address]
    );
    return result.insertId;
  }

  static async findById(id) {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT id, username, email, full_name, role, phone, address, is_active, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async findByUsername(username) {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    return rows[0];
  }

  static async findByEmail(email) {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0];
  }

  static async update(id, userData) {
    const pool = getPool();
    const { full_name, phone, address, role, is_active } = userData;
    
    const [result] = await pool.query(
      `UPDATE users SET full_name = ?, phone = ?, address = ?, role = ?, is_active = ? 
       WHERE id = ?`,
      [full_name, phone, address, role, is_active, id]
    );
    
    return result.affectedRows > 0;
  }

  static async updatePassword(id, newPassword) {
    const pool = getPool();
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const [result] = await pool.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, id]
    );
    
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const pool = getPool();
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async getAll(filters = {}) {
    const pool = getPool();
    let query = 'SELECT id, username, email, full_name, role, phone, address, is_active, created_at FROM users WHERE 1=1';
    const params = [];

    if (filters.role) {
      query += ' AND role = ?';
      params.push(filters.role);
    }

    if (filters.is_active !== undefined) {
      query += ' AND is_active = ?';
      params.push(filters.is_active);
    }

    if (filters.search) {
      query += ' AND (username LIKE ? OR email LIKE ? OR full_name LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.query(query, params);
    return rows;
  }
}

export default User;