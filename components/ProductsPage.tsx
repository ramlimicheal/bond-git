
import React from 'react';

const ProductsPage: React.FC = () => {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Products</h1>
            <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600">Product management interface.</p>
                {/* Placeholder for product list */}
                <div className="mt-4 border-t pt-4">
                    <p>No products found.</p>
                </div>
            </div>
        </div>
    );
};

export default ProductsPage;
