import Supplier from '../models/Supplier.js';

const supplierController = {
  async create(req, res) {
    try {
      const supplierData = req.body;
      
      if (!supplierData.name || !supplierData.phone) {
        return res.status(400).json({
          success: false,
          message: 'Please provide supplier name and phone'
        });
      }
      
      const supplierId = await Supplier.create(supplierData);
      const supplier = await Supplier.findById(supplierId);
      
      res.status(201).json({
        success: true,
        message: 'Supplier created successfully',
        data: { supplier }
      });
    } catch (error) {
      console.error('Create supplier error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating supplier',
        error: error.message
      });
    }
  },

  async getAll(req, res) {
    try {
      const { is_active, search, city, country } = req.query;
      
      const suppliers = await Supplier.getAll({
        is_active: is_active !== undefined ? is_active === 'true' : undefined,
        search,
        city,
        country
      });
      
      res.status(200).json({
        success: true,
        data: { suppliers, count: suppliers.length }
      });
    } catch (error) {
      console.error('Get suppliers error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching suppliers',
        error: error.message
      });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const supplier = await Supplier.findById(id);
      
      if (!supplier) {
        return res.status(404).json({
          success: false,
          message: 'Supplier not found'
        });
      }
      
      res.status(200).json({
        success: true,
        data: { supplier }
      });
    } catch (error) {
      console.error('Get supplier error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching supplier',
        error: error.message
      });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const supplierData = req.body;
      
      const updated = await Supplier.update(id, supplierData);
      
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Supplier not found'
        });
      }
      
      const supplier = await Supplier.findById(id);
      
      res.status(200).json({
        success: true,
        message: 'Supplier updated successfully',
        data: { supplier }
      });
    } catch (error) {
      console.error('Update supplier error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating supplier',
        error: error.message
      });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      
      const deleted = await Supplier.delete(id);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Supplier not found'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Supplier deleted successfully'
      });
    } catch (error) {
      console.error('Delete supplier error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting supplier',
        error: error.message
      });
    }
  }
};

export default supplierController;