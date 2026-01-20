import React from 'react';

const AdminPanel = () => {
  return (
    <div className="space-y-6">
      <div className="mb-2">
        <h1 className="text-2xl font-semibold text-gray-900">Admin Panel</h1>
        <p className="text-gray-600">Administration tools</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
          <span className="text-2xl">🛡️</span>
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Admin features coming soon</h2>
        <p className="text-gray-600">This area will include user and loan administration once backend APIs are available.</p>
      </div>
    </div>
  );
};

export default AdminPanel;
