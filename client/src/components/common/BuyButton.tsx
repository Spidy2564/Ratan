import React, { useState } from 'react';
import PurchaseModal from '../purchase/PurchaseModal';

interface BuyButtonProps {
  productData: {
    id: string;
    name: string;
    price: number;
    design?: any;
    size?: string;
    color?: string;
  };
  className?: string;
  children?: React.ReactNode;
}

const BuyButton: React.FC<BuyButtonProps> = ({ productData, className = '', children }) => {
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowPurchaseModal(true)}
        className={`bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors ${className}`}
      >
        {children || `Buy Now - $${productData.price}`}
      </button>

      <PurchaseModal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        productData={productData}
      />
    </>
  );
};

export default BuyButton;