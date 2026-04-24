// functions/src/Models/BottomBarModel.js
const { admin } = require('../Config/firebaseAdmin');

class BottomBarModel {
  // Get all featured collections
  static async getAllFeatured() {
    try {
      const snapshot = await admin.database().ref('bottomBar').once('value');
      const categories = [];
      
      snapshot.forEach(child => {
        categories.push({
          id: child.key,
          ...child.val()
        });
      });
      
      // Sort by displayOrder
      categories.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      
      return { success: true, categories };
    } catch (error) {
      console.error('Get Bottom Bar Categories Error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get active featured collections for public
  static async getActiveFeatured() {
    try {
      const snapshot = await admin.database().ref('bottomBar').once('value');
      const categories = [];
      
      snapshot.forEach(child => {
        const category = child.val();
        if (category.isActive !== false) {
          categories.push({
            id: child.key,
            ...category
          });
        }
      });
      
      // Sort by displayOrder
      categories.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      
      return { success: true, categories };
    } catch (error) {
      console.error('Get Active Bottom Bar Categories Error:', error);
      return { success: false, error: error.message };
    }
  }

  // Add collection with multiple categories
  static async addFeatured(collectionData) {
    try {
      const { categoryIds, collectionTitle, displayOrder, isActive } = collectionData;
      
      // Validate required fields
      if (!categoryIds || !Array.isArray(categoryIds) || categoryIds.length === 0) {
        return { success: false, error: 'At least one category ID is required' };
      }
      
      if (!collectionTitle || !collectionTitle.trim()) {
        return { success: false, error: 'Collection title is required' };
      }
      
      // Validate that all categories exist
      for (const categoryId of categoryIds) {
        const categorySnapshot = await admin.database().ref(`categories/${categoryId}`).once('value');
        if (!categorySnapshot.exists()) {
          return { success: false, error: `Category with ID ${categoryId} not found` };
        }
      }
      
      // Get category names for display
      const categoryNames = [];
      for (const categoryId of categoryIds) {
        const categorySnapshot = await admin.database().ref(`categories/${categoryId}`).once('value');
        const category = categorySnapshot.val();
        if (category && category.name) {
          categoryNames.push(category.name);
        }
      }
      
      const collectionRef = admin.database().ref('bottomBar').push();
      const id = collectionRef.key;
      
      const bottomBarItem = {
        id,
        categoryIds: categoryIds, // Array of category IDs
        categoryNames: categoryNames, // Array of category names for display
        collectionTitle: collectionTitle.trim(),
        displayTitle: collectionTitle.trim(), // For backward compatibility
        displayOrder: displayOrder || 0,
        isActive: isActive !== undefined ? isActive : true,
        createdAt: admin.database.ServerValue.TIMESTAMP,
        updatedAt: admin.database.ServerValue.TIMESTAMP
      };
      
      await collectionRef.set(bottomBarItem);
      console.log('Collection added:', id);
      
      return { success: true, id, category: bottomBarItem };
    } catch (error) {
      console.error('Add Collection Error:', error);
      return { success: false, error: error.message };
    }
  }

  // Update collection
  static async updateFeatured(id, updateData) {
    try {
      const snapshot = await admin.database().ref(`bottomBar/${id}`).once('value');
      
      if (!snapshot.exists()) {
        return { success: false, error: 'Collection not found' };
      }
      
      const updates = {};
      
      if (updateData.categoryIds !== undefined) {
        if (!Array.isArray(updateData.categoryIds) || updateData.categoryIds.length === 0) {
          return { success: false, error: 'At least one category ID is required' };
        }
        
        // Validate categories exist
        for (const categoryId of updateData.categoryIds) {
          const categorySnapshot = await admin.database().ref(`categories/${categoryId}`).once('value');
          if (!categorySnapshot.exists()) {
            return { success: false, error: `Category with ID ${categoryId} not found` };
          }
        }
        
        // Get updated category names
        const categoryNames = [];
        for (const categoryId of updateData.categoryIds) {
          const categorySnapshot = await admin.database().ref(`categories/${categoryId}`).once('value');
          const category = categorySnapshot.val();
          if (category && category.name) {
            categoryNames.push(category.name);
          }
        }
        
        updates.categoryIds = updateData.categoryIds;
        updates.categoryNames = categoryNames;
      }
      
      if (updateData.collectionTitle !== undefined) {
        updates.collectionTitle = updateData.collectionTitle.trim();
        updates.displayTitle = updateData.collectionTitle.trim();
      }
      
      if (updateData.displayOrder !== undefined) {
        updates.displayOrder = updateData.displayOrder;
      }
      
      if (updateData.isActive !== undefined) {
        updates.isActive = updateData.isActive;
      }
      
      updates.updatedAt = admin.database.ServerValue.TIMESTAMP;
      
      await admin.database().ref(`bottomBar/${id}`).update(updates);
      console.log('Collection updated:', id);
      
      return { success: true, message: 'Collection updated successfully' };
    } catch (error) {
      console.error('Update Collection Error:', error);
      return { success: false, error: error.message };
    }
  }

  // Remove collection
  static async removeFeatured(id) {
    try {
      const snapshot = await admin.database().ref(`bottomBar/${id}`).once('value');
      
      if (!snapshot.exists()) {
        return { success: false, error: 'Collection not found' };
      }
      
      await admin.database().ref(`bottomBar/${id}`).remove();
      console.log('Collection removed:', id);
      
      return { success: true, message: 'Collection removed successfully' };
    } catch (error) {
      console.error('Remove Collection Error:', error);
      return { success: false, error: error.message };
    }
  }

  // Reorder collections
  static async reorderFeatured(orderMap) {
    try {
      const updates = {};
      
      for (const [id, displayOrder] of Object.entries(orderMap)) {
        updates[`bottomBar/${id}/displayOrder`] = displayOrder;
        updates[`bottomBar/${id}/updatedAt`] = admin.database.ServerValue.TIMESTAMP;
      }
      
      await admin.database().ref().update(updates);
      console.log('Collections reordered');
      
      return { success: true, message: 'Order updated successfully' };
    } catch (error) {
      console.error('Reorder Collections Error:', error);
      return { success: false, error: error.message };
    }
  }

  // Toggle active status
  static async toggleActive(id, isActive) {
    try {
      const snapshot = await admin.database().ref(`bottomBar/${id}`).once('value');
      
      if (!snapshot.exists()) {
        return { success: false, error: 'Collection not found' };
      }
      
      await admin.database().ref(`bottomBar/${id}`).update({
        isActive: isActive,
        updatedAt: admin.database.ServerValue.TIMESTAMP
      });
      
      console.log('Collection status toggled:', id, isActive);
      
      return { success: true, message: `Collection ${isActive ? 'activated' : 'deactivated'} successfully` };
    } catch (error) {
      console.error('Toggle Collection Error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get single collection
  static async getFeatured(id) {
    try {
      const snapshot = await admin.database().ref(`bottomBar/${id}`).once('value');
      
      if (!snapshot.exists()) {
        return { success: false, error: 'Collection not found' };
      }
      
      const category = { id, ...snapshot.val() };
      return { success: true, category };
    } catch (error) {
      console.error('Get Collection Error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get products by collection (returns products from all categories in the collection)
  static async getProductsByCollection(collectionId) {
    try {
      const collectionSnapshot = await admin.database().ref(`bottomBar/${collectionId}`).once('value');
      
      if (!collectionSnapshot.exists()) {
        return { success: false, error: 'Collection not found' };
      }
      
      const collection = collectionSnapshot.val();
      const categoryIds = collection.categoryIds || [];
      
      if (categoryIds.length === 0) {
        return { success: true, products: [] };
      }
      
      // Get all products
      const productsSnapshot = await admin.database().ref('products').once('value');
      const products = [];
      
      productsSnapshot.forEach(child => {
        const product = child.val();
        // Check if product belongs to any of the categories in the collection
        if (product.categories && Array.isArray(product.categories)) {
          const hasMatchingCategory = product.categories.some(catId => categoryIds.includes(catId));
          if (hasMatchingCategory && product.isVisible !== false) {
            products.push({
              id: child.key,
              ...product
            });
          }
        }
      });
      
      return { success: true, products, collection };
    } catch (error) {
      console.error('Get Products By Collection Error:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = BottomBarModel;