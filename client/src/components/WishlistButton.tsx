import React from 'react';
import { Button } from './ui/button';
import { Heart } from 'lucide-react';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';

interface WishlistButtonProps {
  product: {
    id: number;
    name: string;
    price: string;
    imageUrl: string;
    category: string;
  };
  className?: string;
}

export const WishlistButton: React.FC<WishlistButtonProps> = ({ 
  product, 
  className = '' 
}) => {
  const { addToWishlist, removeFromWishlist, state: wishlistState } = useWishlist();
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(false);

  const isInWishlist = wishlistState.wishlist?.items.some(item => 
    item.productId === product.id.toString()
  ) || false;

  const handleToggleWishlist = async () => {
    if (!user) {
      alert('Please login to manage wishlist');
      return;
    }

    setLoading(true);
    try {
      if (isInWishlist) {
        await removeFromWishlist(product.id.toString());
      } else {
        await addToWishlist({
          productId: product.id.toString(),
          productName: product.name,
          price: parseFloat(product.price),
          imageUrl: product.imageUrl,
          category: product.category,
        });
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleToggleWishlist}
      disabled={loading}
      variant={isInWishlist ? "default" : "outline"}
      className={`${isInWishlist ? 'bg-red-600 hover:bg-red-700' : 'bg-transparent hover:bg-red-50'} ${className}`}
    >
      <Heart className={`w-4 h-4 mr-2 ${isInWishlist ? 'fill-current' : ''}`} />
      {loading ? 'Updating...' : isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
    </Button>
  );
}; 