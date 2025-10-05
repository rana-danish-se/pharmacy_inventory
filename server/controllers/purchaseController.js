import Purchase from '../models/Purchase.js';

const purchaseController = {
  async create(req, res) {
    try {
      const { purchase, items } = req.body;
      
      if (!purchase || !items || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Please provide purchase details and items'
        });
      }
      
      purchase.user_id = req.user.id;
      
      const purchaseId = await Purchase.create(purchase, items);
      const purchaseData = await Purchase.findById(purchaseId);
      
      res.status(201).json({
        success: true,
        message: 'Purchase created successfully',
        data: { purchase: purchaseData }
      });
    } catch (error) {
      console.error('Create purchase error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating purchase',
        error: error.message
      });
    }
  },

  async getAll(req, res) {
    try {
      const {
        supplier_id,
        payment_status,
        from_date,
        to_date,
        search
      } = req.query;
      
      const purchases = await Purchase.getAll({
        supplier_id,
        payment_status,
        from_date,
        to_date,
        search
      });
      
      res.status(200).json({
        success: true,
        data: { purchases, count: purchases.length }
      });
    } catch (error) {
      console.error('Get purchases error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching purchases',
        error: error.message
      });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const purchase = await Purchase.findById(id);
      
      if (!purchase) {
        return res.status(404).json({
          success: false,
          message: 'Purchase not found'
        });
      }
      
      res.status(200).json({
        success: true,
        data: { purchase }
      });
    } catch (error) {
      console.error('Get purchase error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching purchase',
        error: error.message
      });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const purchaseData = req.body;
      
      const updated = await Purchase.update(id, purchaseData);
      
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Purchase not found'
        });
      }
      
      const purchase = await Purchase.findById(id);
      
      res.status(200).json({
        success: true,
        message: 'Purchase updated successfully',
        data: { purchase }
      });
    } catch (error) {
      console.error('Update purchase error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating purchase',
        error: error.message
      });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      
      const deleted = await Purchase.delete(id);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Purchase not found'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Purchase deleted successfully'
      });
    } catch (error) {
      console.error('Delete purchase error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting purchase',
        error: error.message
      });
    }
  }
};

export default purchaseController;