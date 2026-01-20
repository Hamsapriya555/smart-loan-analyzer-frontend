import React, { useState, useEffect } from 'react';
import { loanService } from "../services/api";
import { useDashboard } from '../context/DashboardContext';


export default function Simulation() {
  const { dashboardData } = useDashboard();
  const [formData, setFormData] = useState({
    amount: '',
    interestRate: '',
    duration: '',
    emiAdjustment: '',
    prepayment: ''
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Populate form with real data from dashboard
  useEffect(() => {
    if (dashboardData?.recentLoans && dashboardData.recentLoans.length > 0) {
      const firstLoan = dashboardData.recentLoans[0];
      setFormData(prev => ({
        ...prev,
        amount: prev.amount || firstLoan.amount || 150000,
        interestRate: prev.interestRate || firstLoan.interestRate || 3.5,
        duration: prev.duration || 240,
      }));
    }
  }, [dashboardData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // 1) Build loan object
      const loan = {
        amount: Number(formData.amount || 150000),
        interestRate: Number(formData.interestRate || 3.5),
        tenureMonths: Number(formData.duration || 240),
      };
      // 2) Build whatIf object
      const whatIf = {
        extraEMI: Number(formData.emiAdjustment || 0),
        prepayment: Number(formData.prepayment || 0),
      };
      // 3) Call API
      const res = await loanService.simulate(loan, whatIf);

      // 4) Display response fields
      setResult(res.data.data);
    } catch (e) {
      setError(e.response?.data?.message || 'Simulation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Simulation Page</h1>
          <p className="text-lg text-gray-400">Adjust loan and payments to see impact on debt</p>
        </div>

        <div className="bg-gray-800 rounded-2xl shadow-xl p-8 mb-8 border border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Amount ($)</label>
                <input
                  type="number"
                  name="amount"
                  placeholder="150000"
                  className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Interest Rate (%)</label>
                <input
                  type="number"
                  step="0.01"
                  name="interestRate"
                  placeholder="3.5"
                  className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                  value={formData.interestRate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Duration (Months)</label>
                <input
                  type="number"
                  name="duration"
                  placeholder="240"
                  className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                  value={formData.duration}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">EMI Adjustment ($)</label>
                <input
                  type="number"
                  name="emiAdjustment"
                  placeholder="100"
                  className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                  value={formData.emiAdjustment}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Prepayment ($)</label>
                <input
                  type="number"
                  name="prepayment"
                  placeholder="0"
                  className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                  value={formData.prepayment}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="text-center">
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold py-3 px-8 rounded-lg hover:shadow-lg hover:from-blue-700 hover:to-cyan-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Running Simulation...' : 'Run Simulation'}
              </button>
            </div>

            {error && (
              <div className="bg-red-900 border-l-4 border-red-500 text-red-200 p-4 rounded-lg">
                <p className="font-semibold">Error</p>
                <p>{error}</p>
              </div>
            )}
          </form>
        </div>

        {result && (
          <div className="bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-700">
            <h2 className="text-3xl font-bold text-white mb-6">Simulation Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gray-700 p-6 rounded-xl border border-gray-600 text-center">
                <h3 className="text-lg font-semibold text-green-400 mb-2">Interest Saved</h3>
                <p className="text-3xl font-bold text-green-300">${result.interestSaved ?? '0'}</p>
              </div>
              <div className="bg-gray-700 p-6 rounded-xl border border-gray-600 text-center">
                <h3 className="text-lg font-semibold text-blue-400 mb-2">New EMI</h3>
                <p className="text-3xl font-bold text-blue-300">${result.newEmi ?? '0'}</p>
              </div>
              <div className="bg-gray-700 p-6 rounded-xl border border-gray-600 text-center">
                <h3 className="text-lg font-semibold text-purple-400 mb-2">Months Remaining</h3>
                <p className="text-3xl font-bold text-purple-300">{result.months ?? 'N/A'}</p>
              </div>
              <div className="bg-gray-700 p-6 rounded-xl border border-gray-600 text-center">
                <h3 className="text-lg font-semibold text-yellow-400 mb-2">New Debt-Free Date</h3>
                <p className="text-xl font-bold text-yellow-300">{result.newEndDate ? new Date(result.newEndDate).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
