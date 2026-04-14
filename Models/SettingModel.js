const { admin } = require('../Config/firebaseAdmin');

class SettingsModel {
  // Get homepage settings
  static async getHomepageSettings() {
    try {
      const snapshot = await admin.database().ref('settings/homepage').once('value');
      const settings = snapshot.val() || {
        selectedProductIds: [],
        count: 3,
        updatedAt: null
      };
      return { success: true, settings };
    } catch (error) {
      console.error('Get homepage settings error:', error);
      return { success: false, error: error.message };
    }
  }

  // Update homepage settings
  static async updateHomepageSettings(settingsData) {
    try {
      const updates = {
        selectedProductIds: settingsData.selectedProductIds || [],
        count: settingsData.count || 3,
        updatedAt: admin.database.ServerValue.TIMESTAMP,
        updatedBy: settingsData.updatedBy || null
      };
      
      await admin.database().ref('settings/homepage').set(updates);
      console.log('Homepage settings updated:', updates.selectedProductIds.length, 'products');
      return { success: true, settings: updates };
    } catch (error) {
      console.error('Update homepage settings error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get budget selections
  static async getBudgetSelections() {
    try {
      const snapshot = await admin.database().ref('settings/budgetSelections').once('value');
      const selections = snapshot.val() || {
        under2000: [],
        mid2000to5000: [],
        mid5000to10000: [],
        premium: []
      };
      return { success: true, selections };
    } catch (error) {
      console.error('Get budget selections error:', error);
      return { success: false, error: error.message };
    }
  }

  // Update budget selections
  static async updateBudgetSelections(selectionsData) {
    try {
      const updates = {
        under2000: selectionsData.under2000 || [],
        mid2000to5000: selectionsData.mid2000to5000 || [],
        mid5000to10000: selectionsData.mid5000to10000 || [],
        premium: selectionsData.premium || [],
        updatedAt: admin.database.ServerValue.TIMESTAMP,
        updatedBy: selectionsData.updatedBy || null
      };
      
      await admin.database().ref('settings/budgetSelections').set(updates);
      console.log('Budget selections updated');
      return { success: true, selections: updates };
    } catch (error) {
      console.error('Update budget selections error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get a specific product's budget assignment
  static async getProductBudgetAssignment(productId) {
    try {
      const snapshot = await admin.database().ref('settings/budgetSelections').once('value');
      const selections = snapshot.val() || {};
      
      for (const [range, productIds] of Object.entries(selections)) {
        if (productIds && productIds.includes(productId)) {
          return { success: true, budgetRange: range };
        }
      }
      return { success: true, budgetRange: null };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = SettingsModel;