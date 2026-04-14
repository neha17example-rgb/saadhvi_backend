const OfferModel = require('../Models/OfferModel');

class OfferController {
  // Create offer
  static async createOffer(req, res) {
    try {
      const { name, description, discountType, discountValue, startDate, endDate } = req.body;
      
      if (!name || !discountType) {
        return res.status(400).json({ success: false, error: 'Name and discount type are required' });
      }
      
      const result = await OfferModel.createOffer({
        name,
        description,
        discountType,
        discountValue: parseFloat(discountValue) || 0,
        startDate,
        endDate
      });
      
      if (result.success) {
        res.json({ success: true, message: 'Offer created successfully', offer: result.offer });
      } else {
        res.status(400).json({ success: false, error: result.error });
      }
    } catch (error) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }
  
  // Get all offers
  static async getOffers(req, res) {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const result = await OfferModel.getOffers(includeInactive);
      if (result.success) {
        res.json({ success: true, offers: result.offers });
      } else {
        res.status(400).json({ success: false, error: result.error });
      }
    } catch (error) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }
  
  // Get single offer
  static async getOffer(req, res) {
    try {
      const { id } = req.params;
      const result = await OfferModel.getOffer(id);
      if (result.success) {
        res.json({ success: true, offer: result.offer });
      } else {
        res.status(404).json({ success: false, error: result.error });
      }
    } catch (error) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }
  
  // Update offer
  static async updateOffer(req, res) {
    try {
      const { id } = req.params;
      const result = await OfferModel.updateOffer(id, req.body);
      if (result.success) {
        res.json({ success: true, message: 'Offer updated successfully' });
      } else {
        res.status(400).json({ success: false, error: result.error });
      }
    } catch (error) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }
  
  // Delete offer
  static async deleteOffer(req, res) {
    try {
      const { id } = req.params;
      const result = await OfferModel.deleteOffer(id);
      if (result.success) {
        res.json({ success: true, message: 'Offer deleted successfully' });
      } else {
        res.status(400).json({ success: false, error: result.error });
      }
    } catch (error) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }
  
  // Apply offer to product
  static async applyOfferToProduct(req, res) {
    try {
      const { productId } = req.params;
      const { offerId, customPrice } = req.body;
      
      const result = await OfferModel.applyOfferToProduct(productId, offerId, customPrice);
      if (result.success) {
        res.json({ success: true, message: 'Offer applied to product successfully' });
      } else {
        res.status(400).json({ success: false, error: result.error });
      }
    } catch (error) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }
  
  // Remove offer from product
  static async removeOfferFromProduct(req, res) {
    try {
      const { productId } = req.params;
      const result = await OfferModel.removeOfferFromProduct(productId);
      if (result.success) {
        res.json({ success: true, message: 'Offer removed from product successfully' });
      } else {
        res.status(400).json({ success: false, error: result.error });
      }
    } catch (error) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }
  
  // Get products by offer (public)
  static async getProductsByOffer(req, res) {
    try {
      const { offerId } = req.params;
      const result = await OfferModel.getProductsByOffer(offerId);
      if (result.success) {
        res.json({ success: true, products: result.products });
      } else {
        res.status(400).json({ success: false, error: result.error });
      }
    } catch (error) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }
  
  // Get all active offers with products (for homepage)
  static async getActiveOffersWithProducts(req, res) {
    try {
      const result = await OfferModel.getOffers(false);
      if (!result.success) {
        return res.status(400).json({ success: false, error: result.error });
      }
      
      const activeOffers = [];
      for (const offer of result.offers) {
        if (offer.isActive !== false) {
          const productsResult = await OfferModel.getProductsByOffer(offer.id);
          if (productsResult.success && productsResult.products.length > 0) {
            activeOffers.push({
              ...offer,
              productCount: productsResult.products.length,
              products: productsResult.products.slice(0, 4) // First 4 products
            });
          }
        }
      }
      
      res.json({ success: true, offers: activeOffers });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }
}

module.exports = OfferController;