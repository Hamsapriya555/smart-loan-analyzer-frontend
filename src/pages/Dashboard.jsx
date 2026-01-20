import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDashboard } from '../context/DashboardContext';
import { dashboardService } from '../services/api';
import AiAssistant from "../components/AiAssistant";

const formatCurrency = (n) => `${Number(n || 0).toLocaleString()}`;

const Dashboard = () => {
  const { user, refreshKey } = useAuth();
  const { dashboardData, fetchDashboardData } = useDashboard();
  const [showFinancialSetup, setShowFinancialSetup] = useState(false);
  const [incomeInput, setIncomeInput] = useState('');
  const [expensesInput, setExpensesInput] = useState('');
  const [setupLoading, setSetupLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [refreshKey, fetchDashboardData]);

  const handleSetFinancialInfo = async () => {
    setSetupLoading(true);
    try {
      await dashboardService.updateFinancialInfo({
        monthlyIncome: Number(incomeInput) || 0,
        monthlyExpenses: Number(expensesInput) || 0,
      });
      await fetchDashboardData();
      setShowFinancialSetup(false);
      setIncomeInput('');
      setExpensesInput('');
    } catch (err) {
      console.error('Failed to update financial info:', err);
    } finally {
      setSetupLoading(false);
    }
  };

  const handleSetSampleData = async () => {
    setSetupLoading(true);
    try {
      await dashboardService.updateFinancialInfo({
        monthlyIncome: 50000,
        monthlyExpenses: 20000,
      });
      await fetchDashboardData();
      setShowFinancialSetup(false);
    } catch (err) {
      console.error('Failed to set sample data:', err);
    } finally {
      setSetupLoading(false);
    }
  };

  const score = dashboardData?.stressScore ?? 0;
  const scoreText = score >= 70 ? 'Low Stress' : score >= 40 ? 'Moderate' : 'High Stress';
  const needleRotation = Math.min(180, Math.max(0, (score / 100) * 180));

  return (
    <div className="py-2">
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Welcome, {user?.name || 'John'}!</h1>
          <p className="text-gray-600 mt-1">Here's your financial stress overview.</p>
        </div>

        {/* Financial Info Setup - shown if income is 0 */}
        {(!dashboardData?.monthlyIncome || dashboardData.monthlyIncome === 0) && !showFinancialSetup && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-800 mb-3">ℹ️ Please set your monthly income and expenses to see accurate financial insights:</p>
            <button
              onClick={() => setShowFinancialSetup(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm mr-2"
            >
              Setup Financial Info
            </button>
            <button
              onClick={handleSetSampleData}
              disabled={setupLoading}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm disabled:opacity-50"
            >
              {setupLoading ? 'Loading...' : 'Use Sample Data'}
            </button>
          </div>
        )}

        {/* Financial Info Form */}
        {showFinancialSetup && (
          <div className="mb-6 bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Set Your Financial Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Monthly Income ($)</label>
                <input
                  type="number"
                  value={incomeInput}
                  onChange={(e) => setIncomeInput(e.target.value)}
                  placeholder="50000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Monthly Expenses ($)</label>
                <input
                  type="number"
                  value={expensesInput}
                  onChange={(e) => setExpensesInput(e.target.value)}
                  placeholder="20000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSetFinancialInfo}
                disabled={setupLoading || !incomeInput || !expensesInput}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
              >
                {setupLoading ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => setShowFinancialSetup(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        
        {!dashboardData ? (
          <div className="text-center py-10 text-gray-500">Loading dashboard...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* LEFT COLUMN: KPIs + Loan Overview + Recent Loans */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                  <p className="text-sm text-gray-500">Monthly Income</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{formatCurrency(dashboardData.monthlyIncome)}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                  <p className="text-sm text-gray-500">Monthly Expenses</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{formatCurrency(dashboardData.monthlyExpenses)}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                  <p className="text-sm text-gray-500">Total Loan EMI</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{formatCurrency(dashboardData.totalEMI)}</p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <h3 className="text-gray-900 font-semibold mb-3">Loan Overview</h3>
                {/* Placeholder for bar chart */}
                <div className="h-40 bg-gradient-to-b from-blue-50 to-blue-100 rounded-lg border border-blue-100 flex items-end gap-3 p-3">
                  {[30, 35, 28, 40, 50, 60, 65].map((v, i) => (
                    <div key={i} className="flex-1">
                      <div className="bg-blue-500/80 rounded-t w-full" style={{ height: `${v}%` }} />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  {['Mar', 'May', 'Jun', 'Jul', 'Aug', 'Sep'].map((m) => (<span key={m}>{m}</span>))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <h3 className="text-gray-900 font-semibold mb-3">Recent Loans</h3>
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loan Type</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interest</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100 text-sm">
                      {(dashboardData?.recentLoans || []).map((r, i) => (
                        <tr key={i}>
                          <td className="px-4 py-2 text-gray-700">{r.loanType || r.type || 'Unnamed Loan'}</td>
                          <td className="px-4 py-2 text-gray-700">{formatCurrency(r.amount)}</td>
                          <td className="px-4 py-2 text-gray-700">{r.interestRate}%</td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${r.status==='Active' || r.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border border-green-200' : r.status==='Paid' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' : 'bg-gray-50 text-gray-700 border border-gray-200'}`}>{r.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* CENTER COLUMN: Gauge + Tips */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <h3 className="text-gray-900 font-semibold mb-3 text-center">Stress Level</h3>
                <div className="relative w-full mx-auto" style={{ height: 180 }}>
                  {/* Gauge background */}
                  <div className="absolute inset-x-0 bottom-0 h-24 mx-6 rounded-b-full overflow-hidden">
                    <div className="flex w-full h-full">
                      <div className="flex-1 bg-green-400/90" />
                      <div className="flex-1 bg-yellow-400/90" />
                      <div className="flex-1 bg-red-400/90" />
                    </div>
                  </div>
                  {/* Gauge arc */}
                  <div className="absolute inset-x-0 bottom-0 mx-6" style={{ height: 140 }}>
                    <div className="w-full h-full bg-white rounded-t-full shadow-inner" />
                  </div>
                  {/* Needle */}
                  <div className="absolute left-1/2 bottom-6 transform -translate-x-1/2" style={{ transform: `translateX(-50%) rotate(${needleRotation - 90}deg)` }}>
                    <div className="w-28 h-1 bg-gray-700 origin-left rounded" />
                    <div className="w-4 h-4 bg-gray-800 rounded-full -ml-2 -mt-1" />
                  </div>
                  {/* Labels */}
                  <div className="absolute inset-x-0 bottom-0 flex justify-between text-xs text-gray-600 px-6 pb-2">
                    <span>Low</span>
                    <span>High</span>
                  </div>
                </div>
                <div className="text-center mt-4">
                  <p className={`text-lg font-semibold ${score < 40 ? 'text-red-600' : score < 70 ? 'text-yellow-600' : 'text-green-600'}`}>{score < 40 ? 'High Stress' : score < 70 ? 'Moderate' : 'Low Stress'}</p>
                  <p className="text-sm text-gray-500">Score: {score}</p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <h3 className="text-gray-900 font-semibold mb-3">Tips to Reduce Stress</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { icon: '✂️', text: 'Cut Unnecessary Expenses' },
                    { icon: '📄', text: 'Consider Debt Consolidation' },
                    { icon: '🐖', text: 'Increase Savings & Emergency Fund' },
                  ].map((t, i) => (
                    <div key={i} className="h-full flex flex-col items-center justify-center text-center bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      <div className="text-3xl mb-2">{t.icon}</div>
                      <div className="text-sm text-gray-700 font-medium">{t.text}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <h3 className="text-gray-900 font-semibold mb-3">Stress Trend Analysis</h3>
                <div className="h-40 relative">
                  {dashboardData?.stressTrend && dashboardData.stressTrend.length > 0 ? (
                    <svg viewBox="0 0 100 40" className="w-full h-full">
                      <defs>
                        <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.6" />
                          <stop offset="100%" stopColor="#ef4444" stopOpacity="0.05" />
                        </linearGradient>
                      </defs>
                      {dashboardData.stressTrend.map((d, i) => {
                        const x = (i / (dashboardData.stressTrend.length - 1)) * 100;
                        const stressPercent = Math.min(100, d.stress);
                        const barHeight = (stressPercent / 100) * 30;
                        return <rect key={i} x={x - 3} y={30 - barHeight} width="6" height={barHeight} fill="#ef4444" opacity="0.7" />;
                      })}
                      <polyline points={dashboardData.stressTrend.map((d, i) => `${(i / (dashboardData.stressTrend.length - 1)) * 100},${30 - Math.min(100, d.stress) / 100 * 30}`).join(' ')} fill="none" stroke="#ef4444" strokeWidth="1.5" />
                    </svg>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">No stress data available</div>
                  )}
                  <div className="absolute bottom-0 inset-x-0 flex justify-between text-xs text-gray-500 px-2">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: AI Assistant - Only render after data is loaded */}
            <AiAssistant 
              monthlyIncome={dashboardData.monthlyIncome}
              monthlyExpenses={dashboardData.monthlyExpenses}
              totalEMI={dashboardData.totalEMI}
              stressScore={dashboardData.stressScore}
              loans={dashboardData.recentLoans}
            />
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;
