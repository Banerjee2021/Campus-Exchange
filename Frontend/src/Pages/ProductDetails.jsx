import React from 'react';
import { useParams } from 'react-router-dom';

const ProductDetails = () => {
  const { id } = useParams();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center">
            <p className="text-gray-500">Product image placeholder</p>
          </div>
          
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Product Title</h1>
            <p className="text-xl text-purple-600 font-semibold">$99.99</p>
            <div>
              <h2 className="text-lg font-medium text-gray-900">Description</h2>
              <p className="mt-2 text-gray-600">Product description will appear here.</p>
            </div>
            
            <div>
              <h2 className="text-lg font-medium text-gray-900">Seller Information</h2>
              <div className="mt-2">
                <p className="text-gray-600">John Doe</p>
                <p className="text-gray-600">Example University</p>
              </div>
            </div>
            
            <div className="pt-6">
              <button className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors">
                Contact Seller
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;