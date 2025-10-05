import Stock from '../models/Stock.js';

const stockController = {
  async create(req, res) {
    try {
      const stockData = req.body;
      
      if (!stockData.medicine_id || !stockData.batch_number || !stockData.quantity || !stockData.expiry_date) {
        return res.status(400).json({
          success: false,
          message: 'Please provide all required fields'
        });
      }
      
      const stockId = await Stock.create(stockData);
      const stock = await Stock.findById(stockId);
      
      res.status(201).json({
        success: true,
        message: 'Stock added successfully',
        data: { stock }
      });
    } catch (error) {
      console.error('Create stock error:', error);
      res.status(500).json({
        success: false,
        message: 'Error adding stock',
        error: error.message
      });
    }
  },

  async getAll(req, res) {
    try {
      const {
        medicine_id,
        supplier_id,
        batch_number,
        location,
        low_stock,
        expiring_soon,
        search,
        sort
      } = req.query;
      
      const stocks = await Stock.getAll({
        medicine_id,
        supplier_id,
        batch_number,
        location,
        low_stock,
        expiring_soon,
        search,
        sort
      });
      
      res.status(200).json({
        success: true,
        data: { stocks, count: stocks.length }
      });
    } catch (error) {
      console.error('Get stocks error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching stocks',
        error: error.message
      });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const stock = await Stock.findById(id);
      
      if (!stock) {
        return res.status(404).json({
          success: false,
          message: 'Stock not found'
        });
      }
      
      res.status(200).json({
        success: true,
        data: { stock }
      });
    } catch (error) {
      console.error('Get stock error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching stock',
        error: error.message
      });
    }
  },

  async getByMedicine(req, res) {
    try {
      const { medicine_id } = req.params;
      const stocks = await Stock.getByMedicine(medicine_id);
      
      res.status(200).json({
        success: true,
        data: { stocks, count: stocks.length }
      });
    } catch (error) {
      console.error('Get medicine stocks error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching medicine stocks',
        error: error.message
      });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const stockData = req.body;
      
      const updated = await Stock.update(id, stockData);
      
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Stock not found'
        });
      }
      
      const stock = await Stock.findById(id);
      
      res.status(200).json({
        success: true,
        message: 'Stock updated successfully',
        data: { stock }
      });
    } catch (error) {
      console.error('Update stock error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating stock',
        error: error.message
      });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      
      const deleted = await Stock.delete(id);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Stock not found'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Stock deleted successfully'
      });
    } catch (error) {
      console.error('Delete stock error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting stock',
        error: error.message
      });
    }
  }
};

export default stockController;