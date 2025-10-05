import Medicine from '../models/Medicine.js';

const medicineController = {
  async create(req, res) {
    try {
      const medicineData = req.body;
      
      if (!medicineData.name || !medicineData.dosage_form) {
        return res.status(400).json({
          success: false,
          message: 'Please provide medicine name and dosage form'
        });
      }
      
      const medicineId = await Medicine.create(medicineData);
      const medicine = await Medicine.findById(medicineId);
      
      res.status(201).json({
        success: true,
        message: 'Medicine created successfully',
        data: { medicine }
      });
    } catch (error) {
      console.error('Create medicine error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating medicine',
        error: error.message
      });
    }
  },

  async getAll(req, res) {
    try {
      const {
        category_id,
        dosage_form,
        requires_prescription,
        is_active,
        search,
        sort,
        limit,
        offset
      } = req.query;
      
      const medicines = await Medicine.getAll({
        category_id,
        dosage_form,
        requires_prescription: requires_prescription !== undefined ? requires_prescription === 'true' : undefined,
        is_active: is_active !== undefined ? is_active === 'true' : undefined,
        search,
        sort,
        limit,
        offset
      });
      
      res.status(200).json({
        success: true,
        data: { medicines, count: medicines.length }
      });
    } catch (error) {
      console.error('Get medicines error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching medicines',
        error: error.message
      });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const medicine = await Medicine.findById(id);
      
      if (!medicine) {
        return res.status(404).json({
          success: false,
          message: 'Medicine not found'
        });
      }
      
      res.status(200).json({
        success: true,
        data: { medicine }
      });
    } catch (error) {
      console.error('Get medicine error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching medicine',
        error: error.message
      });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const medicineData = req.body;
      
      const updated = await Medicine.update(id, medicineData);
      
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Medicine not found'
        });
      }
      
      const medicine = await Medicine.findById(id);
      
      res.status(200).json({
        success: true,
        message: 'Medicine updated successfully',
        data: { medicine }
      });
    } catch (error) {
      console.error('Update medicine error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating medicine',
        error: error.message
      });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      
      const deleted = await Medicine.delete(id);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Medicine not found'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Medicine deleted successfully'
      });
    } catch (error) {
      console.error('Delete medicine error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting medicine',
        error: error.message
      });
    }
  },

  async getLowStock(req, res) {
    try {
      const medicines = await Medicine.getLowStock();
      
      res.status(200).json({
        success: true,
        data: { medicines, count: medicines.length }
      });
    } catch (error) {
      console.error('Get low stock error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching low stock medicines',
        error: error.message
      });
    }
  },

  async getExpiringSoon(req, res) {
    try {
      const { days } = req.query;
      const medicines = await Medicine.getExpiringSoon(days || 30);
      
      res.status(200).json({
        success: true,
        data: { medicines, count: medicines.length }
      });
    } catch (error) {
      console.error('Get expiring medicines error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching expiring medicines',
        error: error.message
      });
    }
  }
};

export default medicineController;