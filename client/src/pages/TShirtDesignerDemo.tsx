import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { TShirtDesigner, DesignExport } from '@/components/TShirtDesigner';
import { Button } from '@/components/ui/button';
import { saveAs } from 'file-saver';

const TShirtDesignerDemo = () => {
  const [exportedDesign, setExportedDesign] = useState<DesignExport | null>(null);

  // Handle design export
  const handleExport = (data: DesignExport) => {
    setExportedDesign(data);
    
    // You can automatically save the files
    saveAs(data.pngBlob, 'tshirt-design.png');
    saveAs(data.pdfBlob, 'tshirt-design.pdf');
    
    // Save the JSON design to localStorage for future use
    localStorage.setItem('tshirtDesignJson', data.designJson);
  };

  // Define local variable T-shirt image paths within the component
  const tshirtFrontImage = '/tshirt-front.png';
  const tshirtBackImage = '/tshirt-back.png';
  const [currentSide, setCurrentSide] = useState<'front' | 'back'>('front');

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>T-Shirt Designer Demo | Anime Print on Demand</title>
        <meta name="description" content="Design your own anime t-shirt with our interactive designer. Create custom designs, add text, images, and shapes, and export your design for printing." />
      </Helmet>

      <div className="py-4 px-6 bg-white border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">T-Shirt Designer</h1>
        <p className="text-gray-600">Create your custom anime-inspired designs</p>
        <div className="mt-2 flex space-x-4">
          <button 
            onClick={() => setCurrentSide('front')}
            className={`px-4 py-1 rounded-md ${currentSide === 'front' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Front Side
          </button>
          <button 
            onClick={() => setCurrentSide('back')}
            className={`px-4 py-1 rounded-md ${currentSide === 'back' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Back Side
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="h-[calc(100vh-220px)] max-h-[750px]">
          <TShirtDesigner 
            mockupUrl={currentSide === 'front' ? tshirtFrontImage : tshirtBackImage}
            onExport={handleExport}
            height={750} // Reduced height to prevent screen overflow
          />
        </div>
      </div>

      {/* Export notification */}
      {exportedDesign && (
        <div className="fixed bottom-4 right-4 p-4 bg-green-100 border border-green-400 rounded-md shadow-lg max-w-md">
          <h3 className="font-medium text-green-800">Design Exported Successfully!</h3>
          <p className="text-sm text-green-700 mt-1">Your design has been exported to PNG and PDF formats.</p>
          <div className="mt-3 flex space-x-3">
            <Button 
              size="sm" 
              onClick={() => saveAs(exportedDesign.pngBlob, 'tshirt-design.png')}
              variant="outline"
              className="bg-white"
            >
              Download PNG
            </Button>
            <Button 
              size="sm" 
              onClick={() => saveAs(exportedDesign.pdfBlob, 'tshirt-design.pdf')}
              variant="outline"
              className="bg-white"
            >
              Download PDF
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TShirtDesignerDemo;