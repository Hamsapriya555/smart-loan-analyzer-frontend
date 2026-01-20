import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDashboard } from '../context/DashboardContext';
import { loanService } from '../services/api';

export default function Loans() {
  const { triggerRefresh } = useAuth();
  const { dashboardData, fetchDashboardData } = useDashboard();
  const [formData, setFormData] = useState({
    type: '',
    amount: '',
    interestRate: '',
    duration: ''
  });
  const [loans, setLoans] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Load loans on mount
  useEffect(() => {
    const loadLoans = async () => {
      try {
        const res = await loanService.getLoans();
        setLoans(res.data.data || []);
      } catch (err) {
        console.error('Failed to load loans:', err);
      }
    };
    loadLoans();
    // Also fetch dashboard data on mount to ensure it's fresh
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Basic validation
      if (!formData.type || !formData.amount || !formData.interestRate || !formData.duration) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }

      // Call backend API to save loan
      const res = await loanService.create({
        type: formData.type.trim(),
        amount: Number(formData.amount),
        interestRate: Number(formData.interestRate),
        duration: Number(formData.duration),
      });

      // Add new loan to list
      if (res.data.success && res.data.data) {
        setLoans((prev) => [res.data.data, ...prev]);
      }

      setFormData({ type: '', amount: '', interestRate: '', duration: '' });

      // 🔥 CRITICAL FIX: Refresh dashboard data after loan creation
      // This ensures Dashboard, AI Assistant, and Stress Analysis all see the new loan
      await fetchDashboardData();

      // Trigger global refresh for other components
      triggerRefresh();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to add loan');
    } finally {
      setLoading(false);
    }
  };

  const currency = (n) => `$${Number(n || 0).toLocaleString()}`;

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <h1 className="text-2xl font-semibold text-gray-900">My Loans</h1>
        <p className="text-gray-600">Manage your loans locally. Simulation uses backend /api/loan/simulate.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add Loan Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Loan</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Loan Type</label>
              <input
                type="text"
                name="type"
                placeholder="e.g., Home Loan"
                className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.type}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Amount ($)</label>
              <input
                type="number"
                name="amount"
                placeholder="150000"
                className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.amount}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Interest Rate (%)</label>
              <input
                type="number"
                step="0.01"
                name="interestRate"
                placeholder="3.5"
                className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.interestRate}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Duration (Months)</label>
              <input
                type="number"
                name="duration"
                placeholder="240"
                className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.duration}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Loan'}
              </button>
              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}
            </div>
          </form>
        </div>

        {/* Loans List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Loans</h2>
          {loans.length === 0 ? (
            <p className="text-gray-600">No loans added yet.</p>
          ) : (
            <div className="space-y-3">
              {loans.map((loan) => (
                <div key={loan._id || loan.id} className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="text-base font-semibold text-gray-900">{loan.type}</h3>
                  <div className="text-sm text-gray-700 mt-1 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>Amount: <span className="font-medium">{currency(loan.amount)}</span></div>
                    <div>Interest: <span className="font-medium">{loan.interestRate}%</span></div>
                    <div>Duration: <span className="font-medium">{loan.duration || loan.tenureMonths} mo</span></div>
                    <div>Status: <span className="font-medium">{loan.status || 'ACTIVE'}</span></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
