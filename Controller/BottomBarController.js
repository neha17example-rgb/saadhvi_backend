// functions/src/Controller/BottomBarController.js
const BottomBarModel = require('../Models/BottomBarModel');

class BottomBarController {
  // Get all featured collections (Admin)
  static async getFeaturedCategories(req, res) {
    try {
      const result = await BottomBarModel.getAllFeatured();
      
      if (result.success) {
        res.json({ 
          success: true, 
          categories: result.categories 
        });
      } else {
        res.status(400).json({ 
          success: false, 
          error: result.error 
        });
      }
    } catch (error) {
      console.error('Get Featured Categories Error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Server error' 
      });
    }
  }

  // Get active featured collections (Public)
  static async getActiveFeaturedCategories(req, res) {
    try {
      const result = await BottomBarModel.getActiveFeatured();
      
      if (result.success) {
        res.json({ 
          success: true, 
          categories: result.categories 
        });
      } else {
        res.status(400).json({ 
          success: false, 
          error: result.error 
        });
      }
    } catch (error) {
      console.error('Get Active Featured Categories Error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Server error' 
      });
    }
  }

  // Add collection to bottom bar (Admin)
  static async addFeaturedCategory(req, res) {
    try {
      const { categoryIds, collectionTitle, displayOrder, isActive } = req.body;
      
      const result = await BottomBarModel.addFeatured({
        categoryIds,
        collectionTitle,
        displayOrder: displayOrder || 0,
        isActive
      });
      
      if (result.success) {
        res.json({ 
          success: true, 
          message: 'Collection added successfully',
          id: result.id,
          category: result.category
        });
      } else {
        res.status(400).json({ 
          success: false, 
          error: result.error 
        });
      }
    } catch (error) {
      console.error('Add Collection Error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Server error' 
      });
    }
  }

  // Update collection (Admin)
  static async updateFeaturedCategory(req, res) {
    try {
      const { id } = req.params;
      const { categoryIds, collectionTitle, displayOrder, isActive } = req.body;
      
      const updateData = {};
      if (categoryIds !== undefined) updateData.categoryIds = categoryIds;
      if (collectionTitle !== undefined) updateData.collectionTitle = collectionTitle;
      if (displayOrder !== undefined) updateData.displayOrder = displayOrder;
      if (isActive !== undefined) updateData.isActive = isActive;
      
      const result = await BottomBarModel.updateFeatured(id, updateData);
      
      if (result.success) {
        res.json({ 
          success: true, 
          message: 'Collection updated successfully' 
        });
      } else {
        res.status(400).json({ 
          success: false, 
          error: result.error 
        });
      }
    } catch (error) {
      console.error('Update Collection Error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Server error' 
      });
    }
  }

  // Remove collection from bottom bar (Admin)
  static async removeFeaturedCategory(req, res) {
    try {
      const { id } = req.params;
      
      const result = await BottomBarModel.removeFeatured(id);
      
      if (result.success) {
        res.json({ 
          success: true, 
          message: 'Collection removed successfully' 
        });
      } else {
        res.status(400).json({ 
          success: false, 
          error: result.error 
        });
      }
    } catch (error) {
      console.error('Remove Collection Error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Server error' 
      });
    }
  }

  // Reorder collections (Admin)
  static async reorderFeaturedCategories(req, res) {
    try {
      const { orderMap } = req.body;
      
      if (!orderMap || typeof orderMap !== 'object') {
        return res.status(400).json({ 
          success: false, 
          error: 'Order map is required' 
        });
      }
      
      const result = await BottomBarModel.reorderFeatured(orderMap);
      
      if (result.success) {
        res.json({ 
          success: true, 
          message: 'Collections reordered successfully' 
        });
      } else {
        res.status(400).json({ 
          success: false, 
          error: result.error 
        });
      }
    } catch (error) {
      console.error('Reorder Collections Error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Server error' 
      });
    }
  }

  // Get single collection (Admin)
  static async getFeaturedCategory(req, res) {
    try {
      const { id } = req.params;
      
      const result = await BottomBarModel.getFeatured(id);
      
      if (result.success) {
        res.json({ 
          success: true, 
          category: result.category 
        });
      } else {
        res.status(404).json({ 
          success: false, 
          error: result.error 
        });
      }
    } catch (error) {
      console.error('Get Collection Error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Server error' 
      });
    }
  }

  // Toggle active status (Admin)
  static async toggleActiveStatus(req, res) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      
      if (isActive === undefined) {
        return res.status(400).json({ 
          success: false, 
          error: 'isActive status is required' 
        });
      }
      
      const result = await BottomBarModel.toggleActive(id, isActive);
      
      if (result.success) {
        res.json({ 
          success: true, 
          message: result.message 
        });
      } else {
        res.status(400).json({ 
          success: false, 
          error: result.error 
        });
      }
    } catch (error) {
      console.error('Toggle Active Status Error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Server error' 
      });
    }
  }

  // Get products by collection (Public)
  static async getProductsByCollection(req, res) {
    try {
      const { id } = req.params;
      
      const result = await BottomBarModel.getProductsByCollection(id);
      
      if (result.success) {
        res.json({ 
          success: true, 
          products: result.products,
          collection: result.collection
        });
      } else {
        res.status(404).json({ 
          success: false, 
          error: result.error 
        });
      }
    } catch (error) {
      console.error('Get Products By Collection Error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Server error' 
      });
    }
  }
}

module.exports = BottomBarController;