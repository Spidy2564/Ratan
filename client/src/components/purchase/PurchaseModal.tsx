import React, { useState } from 'react';
import { usePurchase } from '../../contexts/PurchaseContext';
import { useAuth } from '../../contexts/AuthContext';
import AuthModal from '../auth/AuthModal';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  productData?: {
    id: string;
    name: string;
    price: number;
    design?: any;
    size?: string;
    color?: string;
  };
}

const PurchaseModal: React.FC<PurchaseModalProps> = ({ isOpen, onClose, productData }) => {
  const { user } = useAuth(); // Get current user
  const { addToCart, processPurchase } = usePurchase();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchaseComplete, setPurchaseComplete] = useState(false);
  const [quantity, setQuantity] = useState(1);

  if (!isOpen) return null;

  const handlePurchase = async () => {
    // CRITICAL: Check if user is logged in FIRST
    if (!user) {
      console.log('🚫 No user logged in, showing auth modal');
      setShowAuthModal(true);
      return;
    }

    console.log('✅ User is logged in:', user.email);
    setIsProcessing(true);
    
    try {
      if (productData) {
        // Add to cart first
        addToCart({
          id: `${productData.id}_${Date.now()}`,
          productId: productData.id,
          productName: productData.name,
          design: productData.design,
          price: productData.price,
          quantity: quantity,
          size: productData.size,
          color: productData.color
        });
      }

      // Process purchase
      await processPurchase(user);
      setPurchaseComplete(true);
    } catch (error) {
      console.error('Purchase failed:', error);
      alert('Purchase failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const totalPrice = productData ? productData.price * quantity : 0;

  if (purchaseComplete) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-green-500 text-6xl mb-4">✓</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Purchase Successful!</h3>
            <p className="text-gray-600 mb-6">
              Thank you for your purchase. You will receive a confirmation email shortly.
            </p>
            <button
              onClick={() => {
                setPurchaseComplete(false);
                onClose();
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Complete Purchase</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {productData && (
            <div className="mb-6">
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-semibold text-lg">{productData.name}</h4>
                <div className="text-sm text-gray-600 mt-2">
                  {productData.size && <p>Size: {productData.size}</p>}
                  {productData.color && <p>Color: {productData.color}</p>}
                  <p>Price: ${productData.price}</p>
                </div>
                
                <div className="mt-4 flex items-center">
                  <label className="block text-sm font-medium text-gray-700 mr-4">
                    Quantity:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="border rounded px-3 py-1 w-20"
                  />
                </div>
                
                <div className="mt-4 text-lg font-bold">
                  Total: ${totalPrice.toFixed(2)}
                </div>
              </div>
            </div>
          )}

          {/* SHOW LOGIN PROMPT IF NOT LOGGED IN */}
          {!user && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 font-medium">
                🔒 Please log in or create an account to complete your purchase.
              </p>
            </div>
          )}

          {/* SHOW USER INFO IF LOGGED IN */}
          {user && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">
                ✅ Logged in as: {user.email}
              </p>
            </div>
          )}

          <div className="flex space-x-4">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handlePurchase}
              disabled={isProcessing}
              className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg"
            >
              {isProcessing ? 'Processing...' : user ? 'Buy Now' : 'Login to Buy'}
            </button>
          </div>
        </div>
      </div>

      {/* AUTH MODAL - Shows when user is not logged in */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => {
            setShowAuthModal(false);
            console.log('✅ Login successful, will retry purchase');
            // After successful login, automatically proceed with purchase
            setTimeout(handlePurchase, 500);
          }}
        />
      )}
    </>
  );
};

export default PurchaseModal;