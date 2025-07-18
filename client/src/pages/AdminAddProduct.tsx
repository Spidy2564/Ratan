import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Upload, Save, Eye, Trash2, Package, Loader2, Edit3, X, Image, Camera, CheckCircle, AlertCircle, Search, Filter } from 'lucide-react';

interface Product {
  id?: number;
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  category: string;
  inStock: boolean;
  featured: boolean;
  tags: string;
  images?: string | string[]; // Can be JSON string or array
  createdAt?: string;
  updatedAt?: string;
}

// ✅ FIXED: Consistent API Base URL
const API_BASE = window.location.hostname === 'localhost' && window.location.port === '5000' 
  ? '' 
  : 'http://localhost:5000';

// Helper function to resolve image URLs
const resolveImageUrl = (imageUrl: string): string => {
  if (!imageUrl) return imageUrl;
  
  // If it's a relative URL starting with /uploads, prepend the API base
  if (imageUrl.startsWith('/uploads/')) {
    return API_BASE + imageUrl;
  }
  
  // If it's already an absolute URL, return as-is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // For other relative URLs, prepend API base
  if (imageUrl.startsWith('/')) {
    return API_BASE + imageUrl;
  }
  
  return imageUrl;
};

// ✅ FIXED: API Functions with proper response handling
const fetchProducts = async (): Promise<Product[]> => {
  const response = await fetch(`${API_BASE}/api/products`);
  if (!response.ok) throw new Error('Failed to fetch products');
  const data = await response.json();
  
  // ✅ FIXED: Handle both response formats from backend
  const products = data.data || data;
  console.log('📦 Admin: Fetched products:', products);
  return Array.isArray(products) ? products : [];
};

const addProduct = async (productData: Omit<Product, 'id'>): Promise<Product> => {
  console.log('🌐 API: Sending product data to backend:', JSON.stringify(productData, null, 2));
  console.log('📸 API: Images field being sent:', productData.images);
  
  const response = await fetch(`${API_BASE}/api/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData),
  });
  
  console.log('📡 API: Response status:', response.status);
  
  if (!response.ok) {
    const errorData = await response.json();
    console.error('❌ API: Error response:', errorData);
    throw new Error(errorData.message || 'Failed to add product');
  }
  
  const result = await response.json();
  console.log('✅ API: Success response:', JSON.stringify(result, null, 2));
  
  // ✅ FIXED: Handle both response formats
  return result.data || result;
};

const updateProduct = async (id: number, productData: Partial<Product>): Promise<Product> => {
  const response = await fetch(`${API_BASE}/api/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to update product');
  }
  const result = await response.json();
  return result.data || result;
};

const deleteProduct = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE}/api/products/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to delete product');
  }
};

// Simple base64 image upload function
const uploadImage = async (file: File): Promise<string> => {
  console.log('📸 Starting upload for:', file.name, 'Size:', (file.size / 1024).toFixed(2) + 'KB');
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const base64Data = e.target?.result as string;
        
        if (!base64Data) {
          throw new Error('Failed to read file as base64');
        }
        
        console.log('📸 Base64 data generated, length:', base64Data.length);
        
        const uploadPayload = {
          image: base64Data,
          filename: file.name
        };
        
        console.log('📸 Sending upload request to:', `${API_BASE}/api/upload`);
        
        const response = await fetch(`${API_BASE}/api/upload`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(uploadPayload),
        });
        
        console.log('📸 Upload response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Upload failed:', response.status, errorText);
          throw new Error(`Upload failed: ${response.status} - ${errorText}`);
        }
        
        const result = await response.json();
        console.log('📸 Upload response:', result);
        
        if (result.success && result.imageUrl) {
          console.log('✅ Image uploaded successfully:', result.imageUrl);
          resolve(result.imageUrl);
        } else {
          console.error('❌ Upload result missing success or imageUrl:', result);
          throw new Error(result.error || result.message || 'Upload failed - invalid response format');
        }
      } catch (error) {
        console.error('❌ Upload error:', error);
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    };
    
    reader.onerror = (error) => {
      console.error('❌ FileReader error:', error);
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
};

const CATEGORIES = ['T-Shirts', 'Phone Covers', 'Hoodies', 'Bottles', 'Plates'];

// Photo Upload Component
const PhotoUpload = ({ images, onImagesChange, isUploading, setIsUploading }: {
  images: string[];
  onImagesChange: (images: string[]) => void;
  isUploading: boolean;
  setIsUploading: (loading: boolean) => void;
}) => {
const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = Array.from(e.target.files || []);
  if (files.length === 0) return;

  console.log(`📂 Starting upload of ${files.length} files:`, files.map(f => f.name));
  setIsUploading(true);
  
  try {
    const uploadPromises = files.map(async (file, index) => {
      console.log(`📤 Uploading file ${index + 1}/${files.length}: ${file.name}`);
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error(`File ${file.name} is too large. Max size is 5MB.`);
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error(`File ${file.name} is not an image.`);
      }
      
      const imageUrl = await uploadImage(file);
      console.log(`✅ Upload ${index + 1} completed:`, imageUrl);
      return imageUrl;
    });
    
    const newImageUrls = await Promise.all(uploadPromises);
    console.log('✅ All uploads completed:', newImageUrls);
    
    // Validate that all URLs are valid
    const validUrls = newImageUrls.filter(url => url && url.trim() !== '');
    if (validUrls.length !== newImageUrls.length) {
      console.warn('⚠️ Some uploads returned empty URLs');
    }
    
    onImagesChange([...images, ...validUrls]);
    
    // Show success message
    console.log(`🎉 Successfully uploaded ${validUrls.length} images!`);
    
  } catch (error) {
    console.error('❌ Upload failed:', error);
    alert(`Failed to upload images: ${error.message}`);
  } finally {
    setIsUploading(false);
    // Clear the input so the same files can be uploaded again if needed
    e.target.value = '';
  }
};

  const removeImage = (indexToRemove: number) => {
    const newImages = images.filter((_, index) => index !== indexToRemove);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          📸 Product Photos
        </label>
        <span className="text-xs text-gray-500">
          {images.length}/10 photos
        </span>
      </div>
      
      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
          id="photo-upload"
          disabled={isUploading || images.length >= 10}
        />
        <label
          htmlFor="photo-upload"
          className={`cursor-pointer ${isUploading || images.length >= 10 ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
              <span className="text-sm text-gray-600">Uploading photos...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Camera className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-600">
                Click to upload product photos (up to 10)
              </span>
              <span className="text-xs text-gray-400 mt-1">
                PNG, JPG, WebP up to 5MB each
              </span>
            </div>
          )}
        </label>
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((imageUrl, index) => (
            <div key={index} className="relative group">
              <img
                src={resolveImageUrl(imageUrl)}
                alt={`Product photo ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg border"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
              {index === 0 && (
                <div className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-1 rounded">
                  Main
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Fixed ProductForm component
const ProductForm = ({ product, onSubmit, onCancel, isSubmitting }: {
  product?: Product;
  onSubmit: (data: Product) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}) => {
  // ✅ FIX: Properly initialize images as array
  const initializeImages = (productImages?: string | string[]): string[] => {
    if (!productImages) return [];
    
    if (typeof productImages === 'string') {
      try {
        const parsed = JSON.parse(productImages);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    
    return Array.isArray(productImages) ? productImages : [];
  };

  const [formData, setFormData] = useState<Product>({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    imageUrl: product?.imageUrl || '',
    category: product?.category || 'T-Shirts',
    inStock: product?.inStock ?? true,
    featured: product?.featured || false,
    tags: product?.tags || '',
    images: initializeImages(product?.images) // ✅ FIX: Properly initialize
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);

const validateForm = (): boolean => {
  const newErrors: Record<string, string> = {};

  if (!formData.name.trim()) newErrors.name = 'Product name is required';
  if (!formData.description.trim()) newErrors.description = 'Description is required';
  if (!formData.price.trim()) newErrors.price = 'Price is required';
  
  // Better image validation
  const hasUploadedImages = formData.images && Array.isArray(formData.images) && formData.images.length > 0;
  const hasFallbackUrl = formData.imageUrl && formData.imageUrl.trim();
  
  console.log('🔍 Image validation:');
  console.log('📸 hasUploadedImages:', hasUploadedImages);
  console.log('📸 hasFallbackUrl:', hasFallbackUrl);
  console.log('📸 formData.images:', formData.images);
  console.log('📸 formData.imageUrl:', formData.imageUrl);
  
  if (!hasUploadedImages && !hasFallbackUrl) {
    newErrors.images = 'At least one product image is required (either upload or provide URL)';
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

const handleSubmit = () => {
  if (!validateForm()) {
    console.error('❌ Form validation failed');
    return;
  }

  const imageArray = Array.isArray(formData.images) ? formData.images : [];
  
  console.log('🚀 SUBMIT - Form Data Check:');
  console.log('📸 Raw formData.images:', formData.images);
  console.log('📸 Processed imageArray:', imageArray);
  console.log('📸 imageArray.length:', imageArray.length);
  console.log('📸 formData.imageUrl:', formData.imageUrl);
  
  // Validate image URLs before submission
  const validImageUrls = imageArray.filter(url => {
    const isValid = url && typeof url === 'string' && url.trim() !== '';
    if (!isValid) {
      console.warn('⚠️ Invalid image URL found:', url);
    }
    return isValid;
  });
  
  if (validImageUrls.length !== imageArray.length) {
    console.error('❌ Some image URLs are invalid!');
    alert('Some uploaded images have invalid URLs. Please try uploading again.');
    return;
  }
  
  // Prepare images for backend
  const imagesToSend = validImageUrls.length > 0 ? JSON.stringify(validImageUrls) : null;
  
  // Better fallback logic for main image
  let mainImageUrl = formData.imageUrl;
  if (!mainImageUrl && validImageUrls.length > 0) {
    mainImageUrl = validImageUrls[0]; // Use first uploaded image
  }

  const submitData = {
    ...formData,
    imageUrl: mainImageUrl || '', // Main display image
    images: imagesToSend, // All images as JSON string for backend
    tags: formData.tags || '[]'
  };

  console.log('🚀 FINAL SUBMIT DATA:');
  console.log('📸 submitData.imageUrl:', submitData.imageUrl);
  console.log('📸 submitData.images:', submitData.images);
  console.log('📸 submitData.images type:', typeof submitData.images);
  
  if (imagesToSend) {
    try {
      const parsedImages = JSON.parse(imagesToSend);
      console.log('📸 Parsed images array:', parsedImages);
    } catch (e) {
      console.error('❌ Invalid JSON in images field:', imagesToSend);
    }
  }
  
  console.log('📤 Submitting product data...');
  onSubmit(submitData);
};

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImagesChange = (images: string[]) => {
    console.log('📸 FIXED: Images updated:', images);
    setFormData(prev => ({ 
      ...prev, 
      images: images // ✅ Always array
    }));
    if (errors.images) {
      setErrors(prev => ({ ...prev, images: '' }));
    }
  };

  // ✅ FIX: Ensure images is always array for display
  const displayImages = Array.isArray(formData.images) ? formData.images : [];

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g. Naruto Uzumaki Orange T-Shirt"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price (₹)
          </label>
          <input
            type="text"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="1599"
          />
          {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Detailed description of your product..."
        />
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
      </div>

      {/* Photo Upload */}
      <PhotoUpload
        images={displayImages} // ✅ Always pass array
        onImagesChange={handleImagesChange}
        isUploading={isUploading}
        setIsUploading={setIsUploading}
      />
      {displayImages.length > 0 && (
        <div className="text-sm text-green-600">
          ✅ {displayImages.length} image{displayImages.length > 1 ? 's' : ''} uploaded successfully
          <div className="text-xs text-gray-500 mt-1">
            Main image: {displayImages[0]?.substring(0, 50)}...
          </div>
        </div>
      )}
      {errors.images && <p className="text-red-500 text-sm mt-1">{errors.images}</p>}

      {/* Fallback Image URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Image URL (fallback if no photos uploaded)
        </label>
        <input
          type="url"
          name="imageUrl"
          value={formData.imageUrl}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="https://example.com/image.jpg"
        />
      </div>

      {/* Category and Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {CATEGORIES.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              name="inStock"
              checked={formData.inStock}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label className="ml-2 text-sm text-gray-700">In Stock</label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              name="featured"
              checked={formData.featured}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label className="ml-2 text-sm text-gray-700">Featured Product</label>
          </div>
        </div>
      </div>

      {/* Submit Actions */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || isUploading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {product ? 'Updating...' : 'Adding...'}
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {product ? 'Update Product' : 'Add Product'}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// Product List Component
const ProductList = ({ onEdit, onDelete }: {
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // ✅ FIXED: Use consistent query key with main products page
  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // ✅ FIX: Helper function to parse images for display
  const getImageCount = (images?: string | string[]): number => {
    if (!images) return 0;
    
    if (typeof images === 'string') {
      try {
        const parsed = JSON.parse(images);
        return Array.isArray(parsed) ? parsed.length : 1;
      } catch {
        return 0;
      }
    }
    
    return Array.isArray(images) ? images.length : 0;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600">Failed to load products</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="All">All Categories</option>
          {CATEGORIES.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{products.length}</div>
          <div className="text-sm text-blue-600">Total Products</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {products.filter(p => p.inStock).length}
          </div>
          <div className="text-sm text-green-600">In Stock</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">
            {products.filter(p => p.featured).length}
          </div>
          <div className="text-sm text-yellow-600">Featured</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-red-600">
            {products.filter(p => !p.inStock).length}
          </div>
          <div className="text-sm text-red-600">Out of Stock</div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={resolveImageUrl(product.imageUrl)}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-lg mr-4"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://via.placeholder.com/48x48?text=No+Image';
                        }}
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {product.description.substring(0, 50)}...
                        </div>
                        {/* ✅ FIX: Better image count display */}
                        {product.images && (
                          <div className="text-xs text-blue-600 mt-1">
                            📸 {getImageCount(product.images)} image{getImageCount(product.images) !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{product.price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                      {product.featured && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Featured
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(product)}
                        className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(product.id!)}
                        className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No products found</p>
        </div>
      )}
    </div>
  );
};

// Main Admin Dashboard
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'edit'>('list');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const queryClient = useQueryClient();

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleAddProduct = async (productData: Product) => {
    setIsSubmitting(true);
    try {
      console.log('🚀 Admin: Starting to add product:', productData.name);
      console.log('📸 Admin: Product data images field:', productData.images);
      
      await addProduct(productData);
      
      // ✅ FIXED: Invalidate ALL possible product query keys
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      await queryClient.invalidateQueries({ queryKey: ['categories'] });
      
      // ✅ FIXED: Also invalidate any products queries with filters
      await queryClient.invalidateQueries({ 
        predicate: (query) => {
          return Array.isArray(query.queryKey) && query.queryKey[0] === 'products';
        }
      });
      
      // ✅ FIXED: Force a refetch to ensure immediate update
      await queryClient.refetchQueries({ queryKey: ['products'] });
      
      setActiveTab('list');
      showNotification('success', 'Product added successfully!');
      console.log('✅ Admin: Product added successfully and cache invalidated');
    } catch (error: any) {
      console.error('❌ Admin: Error adding product:', error);
      showNotification('error', error.message || 'Failed to add product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProduct = async (productData: Product) => {
    if (!editingProduct?.id) return;
    
    setIsSubmitting(true);
    try {
      await updateProduct(editingProduct.id, productData);
      
      // ✅ FIXED: Invalidate ALL product queries
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      await queryClient.invalidateQueries({ 
        predicate: (query) => {
          return Array.isArray(query.queryKey) && query.queryKey[0] === 'products';
        }
      });
      
      // ✅ FIXED: Force refetch
      await queryClient.refetchQueries({ queryKey: ['products'] });
      
      setActiveTab('list');
      setEditingProduct(null);
      showNotification('success', 'Product updated successfully!');
    } catch (error: any) {
      showNotification('error', error.message || 'Failed to update product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await deleteProduct(id);
      
      // ✅ FIXED: Invalidate ALL product queries
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      await queryClient.invalidateQueries({ 
        predicate: (query) => {
          return Array.isArray(query.queryKey) && query.queryKey[0] === 'products';
        }
      });
      
      // ✅ FIXED: Force refetch
      await queryClient.refetchQueries({ queryKey: ['products'] });
      
      showNotification('success', 'Product deleted successfully!');
    } catch (error: any) {
      showNotification('error', error.message || 'Failed to delete product');
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setActiveTab('edit');
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingTop: '4rem' }}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">🔧 Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage your anime product store</p>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            {notification.message}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('list')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'list'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📋 All Products
              </button>
              <button
                onClick={() => setActiveTab('add')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'add'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                ➕ Add Product
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          {activeTab === 'list' && (
            <ProductList onEdit={handleEditProduct} onDelete={handleDeleteProduct} />
          )}

          {activeTab === 'add' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Add New Product</h2>
              <ProductForm
                onSubmit={handleAddProduct}
                onCancel={() => setActiveTab('list')}
                isSubmitting={isSubmitting}
              />
            </div>
          )}

          {activeTab === 'edit' && editingProduct && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Edit Product: {editingProduct.name}
              </h2>
              <ProductForm
                product={editingProduct}
                onSubmit={handleUpdateProduct}
                onCancel={() => {
                  setActiveTab('list');
                  setEditingProduct(null);
                }}
                isSubmitting={isSubmitting}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}