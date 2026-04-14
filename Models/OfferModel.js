const { admin } = require('../Config/firebaseAdmin');

class OfferModel {
  // Create a new offer template
  static async createOffer(offerData) {
    try {
      const offerId = admin.database().ref('offers').push().key;
      
      const offer = {
        id: offerId,
        name: offerData.name,
        description: offerData.description || '',
        discountType: offerData.discountType, // 'percentage', 'fixed', 'bogo'
        discountValue: offerData.discountValue || 0,
        startDate: offerData.startDate || null,
        endDate: offerData.endDate || null,
        isActive: true,
        productIds: [], // Products that have this offer applied
        createdAt: admin.database.ServerValue.TIMESTAMP,
        updatedAt: admin.database.ServerValue.TIMESTAMP
      };
      
      await admin.database().ref(`offers/${offerId}`).set(offer);
      console.log('Offer created:', offerId);
      return { success: true, offerId, offer };
    } catch (error) {
      console.error('Create offer error:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Get all offers
  static async getOffers(includeInactive = false) {
    try {
      const snapshot = await admin.database().ref('offers').once('value');
      const offers = [];
      snapshot.forEach(child => {
        const offer = child.val();
        if (includeInactive || offer.isActive !== false) {
          offers.push({ ...offer, id: child.key });
        }
      });
      offers.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      return { success: true, offers };
    } catch (error) {
      console.error('Get offers error:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Get single offer by ID
  static async getOffer(offerId) {
    try {
      const snapshot = await admin.database().ref(`offers/${offerId}`).once('value');
      if (!snapshot.exists()) {
        return { success: false, error: 'Offer not found' };
      }
      const offer = snapshot.val();
      offer.id = offerId;
      return { success: true, offer };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  // Update offer
  static async updateOffer(offerId, updateData) {
    try {
      const snapshot = await admin.database().ref(`offers/${offerId}`).once('value');
      if (!snapshot.exists()) {
        return { success: false, error: 'Offer not found' };
      }
      
      const allowedFields = ['name', 'description', 'discountType', 'discountValue', 'startDate', 'endDate', 'isActive'];
      const updates = {};
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          updates[field] = updateData[field];
        }
      });
      updates.updatedAt = admin.database.ServerValue.TIMESTAMP;
      
      await admin.database().ref(`offers/${offerId}`).update(updates);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  // Delete offer
  static async deleteOffer(offerId) {
    try {
      // First, remove this offer from all products
      const productsSnapshot = await admin.database().ref('products').once('value');
      const updates = {};
      productsSnapshot.forEach(child => {
        const product = child.val();
        if (product.offerId === offerId) {
          updates[`products/${child.key}/offerId`] = null;
          updates[`products/${child.key}/hasOffer`] = false;
          updates[`products/${child.key}/offerName`] = null;
          updates[`products/${child.key}/offerPrice`] = null;
          updates[`products/${child.key}/offerDescription`] = null;
        }
      });
      
      if (Object.keys(updates).length > 0) {
        await admin.database().ref().update(updates);
      }
      
      // Delete the offer
      await admin.database().ref(`offers/${offerId}`).remove();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  // Apply offer to product
  static async applyOfferToProduct(productId, offerId, customPrice = null) {
    try {
      const [productSnapshot, offerSnapshot] = await Promise.all([
        admin.database().ref(`products/${productId}`).once('value'),
        admin.database().ref(`offers/${offerId}`).once('value')
      ]);
      
      if (!productSnapshot.exists()) {
        return { success: false, error: 'Product not found' };
      }
      if (!offerSnapshot.exists()) {
        return { success: false, error: 'Offer not found' };
      }
      
      const product = productSnapshot.val();
      const offer = offerSnapshot.val();
      
      // Calculate offer price
      let offerPrice = customPrice;
      if (!offerPrice && offer.discountType === 'percentage') {
        offerPrice = product.price * (1 - offer.discountValue / 100);
      } else if (!offerPrice && offer.discountType === 'fixed') {
        offerPrice = product.price - offer.discountValue;
      }
      
      if (offerPrice && offerPrice < 0) offerPrice = 0;
      
      const updates = {
        hasOffer: true,
        offerId: offerId,
        offerName: offer.name,
        offerDescription: offer.description,
        offerPrice: Math.round(offerPrice || product.price),
        updatedAt: admin.database.ServerValue.TIMESTAMP
      };
      
      await admin.database().ref(`products/${productId}`).update(updates);
      
      // Add product to offer's productIds list if not already there
      const productIds = offer.productIds || [];
      if (!productIds.includes(productId)) {
        productIds.push(productId);
        await admin.database().ref(`offers/${offerId}/productIds`).set(productIds);
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  // Remove offer from product
  static async removeOfferFromProduct(productId) {
    try {
      const productSnapshot = await admin.database().ref(`products/${productId}`).once('value');
      if (!productSnapshot.exists()) {
        return { success: false, error: 'Product not found' };
      }
      
      const product = productSnapshot.val();
      const oldOfferId = product.offerId;
      
      const updates = {
        hasOffer: false,
        offerId: null,
        offerName: null,
        offerDescription: null,
        offerPrice: null,
        updatedAt: admin.database.ServerValue.TIMESTAMP
      };
      
      await admin.database().ref(`products/${productId}`).update(updates);
      
      // Remove product from offer's productIds list
      if (oldOfferId) {
        const offerSnapshot = await admin.database().ref(`offers/${oldOfferId}`).once('value');
        if (offerSnapshot.exists()) {
          const offer = offerSnapshot.val();
          const productIds = (offer.productIds || []).filter(id => id !== productId);
          await admin.database().ref(`offers/${oldOfferId}/productIds`).set(productIds);
        }
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  // Get products by offer
  static async getProductsByOffer(offerId) {
    try {
      const snapshot = await admin.database().ref('products').once('value');
      const products = [];
      snapshot.forEach(child => {
        const product = child.val();
        if (product.offerId === offerId && product.isVisible !== false) {
          products.push({ id: child.key, ...product });
        }
      });
      return { success: true, products };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = OfferModel;