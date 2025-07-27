import React from 'react';
import { Button } from './ui/button';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

interface AddToCartButtonProps {
  product: {
    id: number;
    name: string;
    price: string;
    imageUrl: string;
    category: string;
  };
  size?: string;
  className?: string;
}

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({ 
  product, 
  size, 
  className = '' 
}) => {
  const { addToCart, state: cartState } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(false);

  const isInCart = cartState.cart?.items.some(item => 
    item.productId === product.id.toString() && 
    item.size === size
  ) || false;

  const handleAddToCart = async () => {
    if (!user) {
      alert('Please login to add items to cart');
      return;
    }

    setLoading(true);
    try {
      await addToCart({
        productId: product.id.toString(),
        productName: product.name,
        price: parseFloat(product.price),
        quantity: 1,
        size: size || undefined,
        imageUrl: product.imageUrl,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleAddToCart}
      disabled={loading}
      className={`${isInCart ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} ${className}`}
    >
      <ShoppingCart className="w-4 h-4 mr-2" />
      {loading ? 'Adding...' : isInCart ? 'Added to Cart' : 'Add to Cart'}
    </Button>
  );
}; 