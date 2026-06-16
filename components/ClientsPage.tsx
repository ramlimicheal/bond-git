
import React from 'react';

const ClientsPage: React.FC = () => {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Clients</h1>
            <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600">Client management interface.</p>
                {/* Placeholder for client list */}
                <div className="mt-4 border-t pt-4">
                    <p>No clients found.</p>
                </div>
            </div>
        </div>
    );
};

export default ClientsPage;
