# T-Shirt Designer Component

A React + TypeScript canvas-based T-shirt designer component that allows users to create custom designs for printing on T-shirts or other products.

## Features

- 16 × 20 inch design canvas (standard print size)
- Optional T-shirt mockup overlay
- Text editing with Google Font support
- Image upload and manipulation (PNG/JPG/SVG)
- Basic shape tools (rectangle, circle, triangle, line)
- Freeform drawing tool
- Object alignment and distribution
- Layer management
- Grouping/ungrouping
- Snap to grid and smart guides
- Color picker with eyedropper
- Zoom and pan
- Undo/redo
- Autosave to localStorage
- Export to PNG (300 DPI), PDF and JSON design format

## Installation

This component is already integrated into your project, but if you were to use it in another project you would need to install the following dependencies:

```bash
npm install fabric canvas-confetti file-saver react-colorful react-dropzone gsap jspdf html-to-image
npm install @types/fabric @types/file-saver @types/jspdf --save-dev
```

## Usage

### Basic Example

```tsx
import { TShirtDesigner, DesignExport } from '@/components/TShirtDesigner';

const MyDesignerPage = () => {
  // Handle exported design
  const handleExport = (data: DesignExport) => {
    console.log('Exported PNG Blob:', data.pngBlob);
    console.log('Exported PDF Blob:', data.pdfBlob);
    console.log('Design JSON:', data.designJson);
    
    // Save files or send to server
  };

  return (
    <div style={{ width: '100%', height: '600px' }}>
      <TShirtDesigner
        onExport={handleExport}
        mockupUrl="path/to/tshirt-mockup.jpg" // Optional
      />
    </div>
  );
};
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `width` | number | 1152 | Canvas width in pixels |
| `height` | number | 1440 | Canvas height in pixels |
| `showToolbar` | boolean | true | Show/hide the toolbar |
| `showSidebar` | boolean | true | Show/hide the sidebar |
| `showLayerPanel` | boolean | true | Show/hide the layer panel |
| `showPropertyPanel` | boolean | true | Show/hide the property panel |
| `mockupUrl` | string | undefined | URL to a T-shirt mockup image |
| `onExport` | function | undefined | Callback when design is exported |
| `className` | string | undefined | Additional CSS classes |

## Integration with Print on Demand Services

### Printful Integration

To create a design draft in Printful, you can use their API as follows:

```typescript
const sendToPrintful = async (designData: DesignExport) => {
  // Convert PNG blob to base64
  const reader = new FileReader();
  reader.readAsDataURL(designData.pngBlob);
  
  reader.onloadend = async () => {
    const base64data = reader.result as string;
    
    // Send to Printful API (requires Printful API key)
    const response = await fetch('https://api.printful.com/sync/products', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer YOUR_PRINTFUL_API_KEY',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sync_product: {
          name: 'Custom T-Shirt Design',
          thumbnail: base64data.split(',')[1]
        },
        sync_variants: [
          {
            retail_price: '29.99',
            variant_id: 4011, // T-shirt variant ID
            files: [
              {
                url: base64data,
                type: 'front',
                position: {
                  area_width: 1800,
                  area_height: 2400,
                  width: 1800,
                  height: 2400,
                  top: 0,
                  left: 0
                }
              }
            ]
          }
        ]
      })
    });
    
    const result = await response.json();
    console.log(result);
  };
};
```

### Printify Integration

For Printify, you can use their API to create a design:

```typescript
const sendToPrintify = async (designData: DesignExport) => {
  // Convert PNG blob to base64
  const reader = new FileReader();
  reader.readAsDataURL(designData.pngBlob);
  
  reader.onloadend = async () => {
    const base64data = reader.result as string;
    
    // Upload image to Printify
    const uploadResponse = await fetch('https://api.printify.com/v1/uploads/images.json', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer YOUR_PRINTIFY_API_KEY',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        file_name: 'tshirt-design.png',
        contents: base64data.split(',')[1]
      })
    });
    
    const uploadResult = await uploadResponse.json();
    
    // Create a product with the uploaded image
    const productResponse = await fetch('https://api.printify.com/v1/shops/{shop_id}/products.json', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer YOUR_PRINTIFY_API_KEY',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Custom T-Shirt Design',
        description: 'Custom designed T-shirt',
        blueprint_id: 5, // T-shirt blueprint ID
        print_provider_id: 1,
        variants: [
          {
            options: [9, 1], // Color, size options
            price: 2999,
            shipping_cost: 499,
            is_enabled: true
          }
        ],
        print_areas: [
          {
            position: 'front',
            images: [
              {
                id: uploadResult.id,
                x: 0.5,
                y: 0.5,
                scale: 1,
                angle: 0
              }
            ]
          }
        ]
      })
    });
    
    const productResult = await productResponse.json();
    console.log(productResult);
  };
};
```

## License

This component is provided for use within this project only and is not licensed for external use.

## Contributing

Feel free to enhance this component with additional features or improvements.