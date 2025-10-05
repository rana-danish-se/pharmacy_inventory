# Pharmacy Inventory Management System

A comprehensive pharmacy inventory management system built with Express.js and MySQL.

## Features

- **User Authentication & Authorization**
  - User registration and login
  - JWT-based authentication
  - Role-based access control (Admin, Pharmacist, Staff)
  - Password hashing with bcrypt

- **Medicine Management**
  - Complete CRUD operations
  - Track medicine details (name, generic name, dosage form, strength, etc.)
  - Low stock alerts
  - Expiring medicines tracking
  - Search and filter capabilities

- **Category Management**
  - Organize medicines by categories
  - Track medicine count per category

- **Supplier Management**
  - Manage supplier information
  - Track purchase history per supplier
  - Active/inactive status

- **Stock Management**
  - Batch-wise stock tracking
  - Expiry date monitoring
  - Multiple stock locations
  - Automatic stock updates on purchase/sale

- **Purchase Management**
  - Record purchases from suppliers
  - Track invoice details
  - Payment status tracking
  - Automatic stock updates

- **Sales Management**
  - Process sales transactions
  - Customer information tracking
  - Multiple payment methods
  - Sales reports and analytics

## Database Schema

### Tables
1. **users** - User accounts with role-based access
2. **categories** - Medicine categories
3. **suppliers** - Supplier information
4. **medicines** - Medicine master data
5. **stock** - Stock inventory with batch tracking
6. **purchases** - Purchase orders
7. **purchase_items** - Individual purchase items
8. **sales** - Sales transactions
9. **sale_items** - Individual sale items

## Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd pharmacy-inventory-system
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure MySQL**
   - Open MySQL Workbench
   - Create a connection to your local MySQL server
   - Note your credentials (host, user, password)

4. **Configure environment variables**
   - Copy `.env` file and update with your MySQL credentials
   - Update JWT_SECRET with a secure random string

5. **Run the application**
```bash
npm start
```
or for development with auto-reload:
```bash
npm run dev
```

The server will start on `http://localhost:5000` and automatically:
- Create the database if it doesn't exist
- Create all necessary tables
- Set up foreign key relationships

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password
- `GET /api/auth/users` - Get all users (Admin only)
- `PUT /api/auth/users/:id` - Update user (Admin only)
- `DELETE /api/auth/users/:id` - Delete user (Admin only)

### Medicines
- `GET /api/medicines` - Get all medicines (with filters)
- `GET /api/medicines/:id` - Get medicine by ID
- `GET /api/medicines/low-stock` - Get low stock medicines
- `GET /api/medicines/expiring-soon` - Get expiring medicines
- `POST /api/medicines` - Create medicine
- `PUT /api/medicines/:id` - Update medicine
- `DELETE /api/medicines/:id` - Delete medicine

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Suppliers
- `GET /api/suppliers` - Get all suppliers
- `GET /api/suppliers/:id` - Get supplier by ID
- `POST /api/suppliers` - Create supplier
- `PUT /api/suppliers/:id` - Update supplier
- `DELETE /api/suppliers/:id` - Delete supplier

### Stock
- `GET /api/stock` - Get all stock (with filters)
- `GET /api/stock/:id` - Get stock by ID
- `GET /api/stock/medicine/:medicine_id` - Get stock by medicine
- `POST /api/stock` - Add stock
- `PUT /api/stock/:id` - Update stock
- `DELETE /api/stock/:id` - Delete stock

### Purchases
- `GET /api/purchases` - Get all purchases
- `GET /api/purchases/:id` - Get purchase by ID
- `POST /api/purchases` - Create purchase
- `PUT /api/purchases/:id` - Update purchase
- `DELETE /api/purchases/:id` - Delete purchase

### Sales
- `GET /api/sales` - Get all sales
- `GET /api/sales/:id` - Get sale by ID
- `GET /api/sales/report` - Get sales report
- `POST /api/sales` - Create sale
- `PUT /api/sales/:id` - Update sale
- `DELETE /api/sales/:id` - Delete sale

## Query Parameters for Filtering & Searching

### Medicines
- `category_id` - Filter by category
- `dosage_form` - Filter by dosage form
- `requires_prescription` - Filter by prescription requirement
- `is_active` - Filter by active status
- `search` - Search in name, generic name, manufacturer
- `sort` - Sort by field (prefix with `-` for descending)
- `limit` - Limit results
- `offset` - Pagination offset

### Stock
- `medicine_id` - Filter by medicine
- `supplier_id` - Filter by supplier
- `batch_number` - Search by batch
- `location` - Filter by location
- `low_stock` - Filter by quantity threshold
- `expiring_soon` - Filter by expiry days
- `search` - Search in medicine name, generic name, batch

### Purchases & Sales
- `from_date` - Start date filter
- `to_date` - End date filter
- `search` - Search in invoice, customer/supplier name

## Project Structure

```
pharmacy-inventory-system/
├── config/
│   └── db.js                 # Database configuration
├── controllers/
│   ├── authController.js     # Authentication logic
│   ├── medicineController.js # Medicine operations
│   ├── categoryController.js # Category operations
│   ├── supplierController.js # Supplier operations
│   ├── stockController.js    # Stock operations
│   ├── purchaseController.js # Purchase operations
│   └── saleController.js     # Sales operations
├── middleware/
│   └── auth.js               # Authentication middleware
├── models/
│   ├── User.js               # User model
│   ├── Medicine.js           # Medicine model
│   ├── Category.js           # Category model
│   ├── Supplier.js           # Supplier model
│   ├── Stock.js              # Stock model
│   ├── Purchase.js           # Purchase model
│   └── Sale.js               # Sale model
├── routes/
│   ├── authRoutes.js         # Auth routes
│   ├── medicineRoutes.js     # Medicine routes
│   ├── categoryRoutes.js     # Category routes
│   ├── supplierRoutes.js     # Supplier routes
│   ├── stockRoutes.js        # Stock routes
│   ├── purchaseRoutes.js     # Purchase routes
│   └── salesRoutes.js        # Sales routes
├── .env                      # Environment variables
├── package.json              # Dependencies
├── server.js                 # Application entry point
└── README.md                 # Documentation
```

## Security Features

- Password hashing using bcrypt
- JWT-based authentication
- HTTP-only cookies for token storage
- Role-based access control
- SQL injection prevention using parameterized queries

## Example Usage

### Register a User
```javascript
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "full_name": "John Doe",
  "role": "pharmacist",
  "phone": "+1234567890",
  "address": "123 Main St"
}
```

### Create a Purchase
```javascript
POST /api/purchases
Content-Type: application/json
Authorization: Bearer <token>

{
  "purchase": {
    "invoice_number": "PUR-2024-001",
    "supplier_id": 1,
    "purchase_date": "2024-01-15",
    "total_amount": 1000,
    "tax_amount": 100,
    "discount_amount": 50,
    "net_amount": 1050,
    "payment_status": "paid",
    "payment_method": "bank_transfer",
    "notes": "Bulk purchase"
  },
  "items": [
    {
      "medicine_id": 1,
      "batch_number": "BATCH001",
      "quantity": 100,
      "unit_price": 10,
      "total_price": 1000,
      "expiry_date": "2025-12-31",
      "manufacture_date": "2024-01-01",
      "selling_price": 15
    }
  ]
}
```

### Create a Sale
```javascript
POST /api/sales
Content-Type: application/json
Authorization: Bearer <token>

{
  "sale": {
    "invoice_number": "SALE-2024-001",
    "customer_name": "Jane Smith",
    "customer_phone": "+1234567890",
    "customer_email": "jane@example.com",
    "sale_date": "2024-01-15T10:30:00",
    "total_amount": 150,
    "tax_amount": 15,
    "discount_amount": 5,
    "net_amount": 160,
    "payment_method": "cash",
    "payment_status": "paid"
  },
  "items": [
    {
      "medicine_id": 1,
      "stock_id": 1,
      "quantity": 10,
      "unit_price": 15,
      "total_price": 150
    }
  ]
}
```

## License

ISC

## Support

For issues or questions, please open an issue in the repository.
