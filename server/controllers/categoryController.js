import Cagetory from '../models/Category.js';

const categoryController = {
  async create(req, res) {
    try {
      const { name, description } = req.body;
      
      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Please provide category name'
        });
      }
      
      const categoryId = await Category.create({ name, description });
      const category = await Category.findById(categoryId);
      
      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: { category }
      });
    } catch (error) {
      console.error('Create category error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating category',
        error: error.message
      });
    }
  },

  async getAll(req, res) {
    try {
      const { search } = req.query;
      const categories = await Category.getAll({ search });
      
      res.status(200).json({
        success: true,
        data: { categories, count: categories.length }
      });
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching categories',
        error: error.message
      });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const category = await Category.findById(id);
      
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }
      
      res.status(200).json({
        success: true,
        data: { category }
      });
    } catch (error) {
      console.error('Get category error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching category',
        error: error.message
      });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, description } = req.body;
      
      const updated = await Category.update(id, { name, description });
      
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }
      
      const category = await Category.findById(id);
      
      res.status(200).json({
        success: true,
        message: 'Category updated successfully',
        data: { category }
      });
    } catch (error) {
      console.error('Update category error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating category',
        error: error.message
      });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      
      const deleted = await Category.delete(id);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Category deleted successfully'
      });
    } catch (error) {
      console.error('Delete category error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting category',
        error: error.message
      });
    }
  }
};

export default categoryController