const SettingsModel = require('../Models/SettingModel');

class SettingsController {
  // Get homepage settings (public - for homepage display)
  static async getHomepageSettings(req, res) {
    try {
      const result = await SettingsModel.getHomepageSettings();
      if (result.success) {
        res.json({ success: true, settings: result.settings });
      } else {
        res.status(400).json({ success: false, error: result.error });
      }
    } catch (error) {
      console.error('Get homepage settings error:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }

  // Update homepage settings (admin only)
  static async updateHomepageSettings(req, res) {
    try {
      const { selectedProductIds, count } = req.body;
      const userId = req.user?.uid;
      
      const result = await SettingsModel.updateHomepageSettings({
        selectedProductIds: selectedProductIds || [],
        count: count || 3,
        updatedBy: userId
      });
      
      if (result.success) {
        res.json({ success: true, message: 'Homepage settings saved!', settings: result.settings });
      } else {
        res.status(400).json({ success: false, error: result.error });
      }
    } catch (error) {
      console.error('Update homepage settings error:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }

  // Get budget selections (public - for homepage display)
  static async getBudgetSelections(req, res) {
    try {
      const result = await SettingsModel.getBudgetSelections();
      if (result.success) {
        res.json({ success: true, selections: result.selections });
      } else {
        res.status(400).json({ success: false, error: result.error });
      }
    } catch (error) {
      console.error('Get budget selections error:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }

  // Update budget selections (admin only)
  static async updateBudgetSelections(req, res) {
    try {
      const { under2000, mid2000to5000, mid5000to10000, premium } = req.body;
      const userId = req.user?.uid;
      
      const result = await SettingsModel.updateBudgetSelections({
        under2000: under2000 || [],
        mid2000to5000: mid2000to5000 || [],
        mid5000to10000: mid5000to10000 || [],
        premium: premium || [],
        updatedBy: userId
      });
      
      if (result.success) {
        res.json({ success: true, message: 'Budget selections saved!', selections: result.selections });
      } else {
        res.status(400).json({ success: false, error: result.error });
      }
    } catch (error) {
      console.error('Update budget selections error:', error);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }
}

module.exports = SettingsController;