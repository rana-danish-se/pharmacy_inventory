import Sale from '../models/Sale.js';
const saleController = {
  async create(req, res) {
    try {
      const { sale, items } = req.body;
      
      if (!sale || !items || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Please provide sale details and items'
        });
      }
      
      sale.user_id = req.user.id;
      
      const saleId = await Sale.create(sale, items);
      const saleData = await Sale.findById(saleId);
      
      res.status(201).json({
        success: true,
        message: 'Sale created successfully',
        data: { sale: saleData }
      });
    } catch (error) {
      console.error('Create sale error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating sale',
        error: error.message
      });
    }
  },

  async getAll(req, res) {
    try {
      const {
        payment_method,
        payment_status,
        from_date,
        to_date,
        customer_phone,
        search,
        limit
      } = req.query;
      
      const sales = await Sale.getAll({
        payment_method,
        payment_status,
        from_date,
        to_date,
        customer_phone,
        search,
        limit
      });
      
      res.status(200).json({
        success: true,
        data: { sales, count: sales.length }
      });
    } catch (error) {
      console.error('Get sales error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching sales',
        error: error.message
      });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const sale = await Sale.findById(id);
      
      if (!sale) {
        return res.status(404).json({
          success: false,
          message: 'Sale not found'
        });
      }
      
      res.status(200).json({
        success: true,
        data: { sale }
      });
    } catch (error) {
      console.error('Get sale error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching sale',
        error: error.message
      });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const saleData = req.body;
      
      const updated = await Sale.update(id, saleData);
      
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Sale not found'
        });
      }
      
      const sale = await Sale.findById(id);
      
      res.status(200).json({
        success: true,
        message: 'Sale updated successfully',
        data: { sale }
      });
    } catch (error) {
      console.error('Update sale error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating sale',
        error: error.message
      });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      
      const deleted = await Sale.delete(id);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Sale not found'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Sale deleted successfully'
      });
    } catch (error) {
      console.error('Delete sale error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting sale',
        error: error.message
      });
    }
  },

  async getReport(req, res) {
    try {
      const { from_date, to_date } = req.query;
      
      if (!from_date || !to_date) {
        return res.status(400).json({
          success: false,
          message: 'Please provide from_date and to_date'
        });
      }
      
      const report = await Sale.getSalesReport(from_date, to_date);
      
      res.status(200).json({
        success: true,
        data: { report }
      });
    } catch (error) {
      console.error('Get sales report error:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating sales report',
        error: error.message
      });
    }
  }
};

export default saleController;