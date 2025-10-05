import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'pharmacy_inventory',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool;
const createPool = async () => {
  try {
    // First connect without database to create it if needed
    const tempPool = mysql.createPool({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password
    });

    const connection = await tempPool.getConnection();
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    await connection.query(`USE ${dbConfig.database}`);
    connection.release();
    await tempPool.end();

    // Now create pool with database
    pool = mysql.createPool(dbConfig);
    return pool;
  } catch (error) {
    console.error('Error creating database pool:', error);
    throw error;
  }
};

const createTables = async () => {
  const connection = await pool.getConnection(); 
  try {
    // Users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        role ENUM('admin', 'pharmacist', 'staff') DEFAULT 'staff',
        phone VARCHAR(20),
        address TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_username (username),
        INDEX idx_email (email),
        INDEX idx_role (role)
      )
    `);

    // Categories table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_name (name)
      )
    `);

    // Suppliers table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS suppliers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        company_name VARCHAR(150),
        email VARCHAR(100),
        phone VARCHAR(20) NOT NULL,
        address TEXT,
        city VARCHAR(100),
        country VARCHAR(100),
        tax_id VARCHAR(50),
        payment_terms VARCHAR(100),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_name (name),
        INDEX idx_company (company_name)
      )
    `);

    // Medicines table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS medicines (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        generic_name VARCHAR(200),
        category_id INT,
        manufacturer VARCHAR(150),
        description TEXT,
        dosage_form ENUM('tablet', 'capsule', 'syrup', 'injection', 'cream', 'ointment', 'drops', 'inhaler', 'powder', 'other') NOT NULL,
        strength VARCHAR(50),
        unit_of_measure VARCHAR(20),
        package_size INT,
        requires_prescription BOOLEAN DEFAULT false,
        storage_conditions TEXT,
        side_effects TEXT,
        barcode VARCHAR(100) UNIQUE,
        sku VARCHAR(100) UNIQUE,
        reorder_level INT DEFAULT 10,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
        INDEX idx_name (name),
        INDEX idx_generic (generic_name),
        INDEX idx_category (category_id),
        INDEX idx_barcode (barcode),
        INDEX idx_sku (sku)
      )
    `);

    // Stock table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS stock (
        id INT AUTO_INCREMENT PRIMARY KEY,
        medicine_id INT NOT NULL,
        batch_number VARCHAR(100) NOT NULL,
        quantity INT NOT NULL DEFAULT 0,
        unit_price DECIMAL(10, 2) NOT NULL,
        selling_price DECIMAL(10, 2) NOT NULL,
        manufacture_date DATE,
        expiry_date DATE NOT NULL,
        supplier_id INT,
        location VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE,
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL,
        UNIQUE KEY unique_batch (medicine_id, batch_number),
        INDEX idx_medicine (medicine_id),
        INDEX idx_batch (batch_number),
        INDEX idx_expiry (expiry_date)
      )
    `);

    // Purchases table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS purchases (
        id INT AUTO_INCREMENT PRIMARY KEY,
        invoice_number VARCHAR(100) UNIQUE NOT NULL,
        supplier_id INT NOT NULL,
        purchase_date DATE NOT NULL,
        total_amount DECIMAL(12, 2) NOT NULL,
        tax_amount DECIMAL(10, 2) DEFAULT 0,
        discount_amount DECIMAL(10, 2) DEFAULT 0,
        net_amount DECIMAL(12, 2) NOT NULL,
        payment_status ENUM('pending', 'partial', 'paid') DEFAULT 'pending',
        payment_method VARCHAR(50),
        notes TEXT,
        user_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE RESTRICT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_invoice (invoice_number),
        INDEX idx_supplier (supplier_id),
        INDEX idx_date (purchase_date)
      )
    `);

    // Purchase items table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS purchase_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        purchase_id INT NOT NULL,
        medicine_id INT NOT NULL,
        batch_number VARCHAR(100) NOT NULL,
        quantity INT NOT NULL,
        unit_price DECIMAL(10, 2) NOT NULL,
        total_price DECIMAL(10, 2) NOT NULL,
        expiry_date DATE NOT NULL,
        manufacture_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE CASCADE,
        FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE RESTRICT,
        INDEX idx_purchase (purchase_id),
        INDEX idx_medicine (medicine_id)
      )
    `);

    // Sales table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS sales (
        id INT AUTO_INCREMENT PRIMARY KEY,
        invoice_number VARCHAR(100) UNIQUE NOT NULL,
        customer_name VARCHAR(150),
        customer_phone VARCHAR(20),
        customer_email VARCHAR(100),
        sale_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        total_amount DECIMAL(12, 2) NOT NULL,
        tax_amount DECIMAL(10, 2) DEFAULT 0,
        discount_amount DECIMAL(10, 2) DEFAULT 0,
        net_amount DECIMAL(12, 2) NOT NULL,
        payment_method ENUM('cash', 'card', 'insurance', 'other') NOT NULL,
        payment_status ENUM('paid', 'pending') DEFAULT 'paid',
        prescription_number VARCHAR(100),
        notes TEXT,
        user_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_invoice (invoice_number),
        INDEX idx_customer (customer_name),
        INDEX idx_date (sale_date)
      )
    `);

    // Sale items table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS sale_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sale_id INT NOT NULL,
        medicine_id INT NOT NULL,
        stock_id INT NOT NULL,
        quantity INT NOT NULL,
        unit_price DECIMAL(10, 2) NOT NULL,
        total_price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
        FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE RESTRICT,
        FOREIGN KEY (stock_id) REFERENCES stock(id) ON DELETE RESTRICT,
        INDEX idx_sale (sale_id),
        INDEX idx_medicine (medicine_id),
        INDEX idx_stock (stock_id)
      )
    `);

    console.log('All tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  } finally {
    connection.release();
  }
};

export const initDatabase = async () => {
  await createPool();
  await createTables();
};

export const getPool = () => {
  if (!pool) {
    throw new Error('Database pool not initialized');
  }
  return pool;
};

