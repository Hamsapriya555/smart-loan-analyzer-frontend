import React, { useEffect, useState, useMemo } from 'react';
import { useDashboard } from '../context/DashboardContext';

const StressAnalysis = () => {
  const { dashboardData, fetchDashboardData } = useDashboard();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  // Calculate stress contribution per loan (real data)
  const stressData = useMemo(() => {
    if (!dashboardData || !dashboardData.recentLoans) return [];
    
    const disposableIncome = dashboardData.monthlyIncome - dashboardData.monthlyExpenses;
    
    // Build stress data from actual loans
    return dashboardData.recentLoans.map(loan => ({
      name: loan.loanType || loan.type || 'Loan',
      amount: loan.amount || 0,
      emi: loan.emi || 0,
      stress: disposableIncome > 0 ? Math.round(((loan.emi || 0) / disposableIncome) * 100) : 0
    })).sort((a, b) => b.stress - a.stress); // Sort by stress descending
  }, [dashboardData]);

  const maxStress = Math.max(1, ...stressData.map(d => d.stress));

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <h1 className="text-2xl font-semibold text-gray-900">Stress Analysis</h1>
        <p className="text-gray-600">Stress contribution by loan</p>
      </div>

      {!dashboardData ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 text-gray-600">Loading dashboard data...</div>
      ) : (
        <>
          {/* Per-Loan Stress Bar Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="text-gray-900 font-semibold mb-3">Stress Contribution by Loan</h3>
            {stressData.length > 0 ? (
              <>
                <div className="space-y-3">
                  {stressData.map((loan, i) => {
                    const barWidth = (loan.stress / maxStress) * 100;
                    const stressColor = loan.stress < 30 ? 'bg-green-500' : loan.stress < 50 ? 'bg-yellow-500' : 'bg-red-500';
                    return (
                      <div key={i} className="flex items-center gap-4">
                        <div className="w-32 text-sm font-medium text-gray-700 truncate">{loan.name}</div>
                        <div className="flex-1">
                          <div className="bg-gray-100 rounded-full h-8 overflow-hidden">
                            <div 
                              className={`${stressColor} h-full flex items-center justify-end pr-2 transition-all`}
                              style={{ width: `${barWidth}%` }}
                            >
                              <span className="text-xs font-semibold text-white">{loan.stress}%</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right text-sm text-gray-600">
                          <p className="font-medium">${Number(loan.emi).toLocaleString()}</p>
                          <p className="text-xs text-gray-500">EMI</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">No loans found</div>
            )}
          </div>

          {/* Stress Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <p className="text-sm text-gray-500">Monthly Income</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">${Number(dashboardData.monthlyIncome || 0).toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <p className="text-sm text-gray-500">Total EMI</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">${Number(dashboardData.totalEMI || 0).toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <p className="text-sm text-gray-500">Stress Score</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{dashboardData.stressScore || 0}</p>
            </div>
          </div>

          {/* Key Insights */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <h3 className="font-semibold text-blue-900 mb-2">Key Insights</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              {stressData.length > 0 ? (
                <>
                  <li>• <strong>{stressData[0].name}</strong> contributes the most stress ({stressData[0].stress}%)</li>
                  <li>• Total EMI is ${Number(dashboardData.totalEMI).toLocaleString()} of your disposable income</li>
                  <li>• Disposable income: ${Number(dashboardData.monthlyIncome - dashboardData.monthlyExpenses).toLocaleString()}</li>
                </>
              ) : (
                <li>• Add loans to see stress analysis</li>
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default StressAnalysis;
