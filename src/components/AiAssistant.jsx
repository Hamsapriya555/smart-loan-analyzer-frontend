import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { assistantService, dashboardService } from '../services/api';

const AiAssistant = ({ monthlyIncome = 0, monthlyExpenses = 0, totalEMI = 0, stressScore = 0, loans = [] }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [assistantLoading, setAssistantLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Helper to format currency safely
  const formatSafeCurrency = (value) => {
    const num = Number(value) || 0;
    return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Helper to format percentage safely
  const formatSafePercent = (value) => {
    const num = Number(value) || 0;
    return `${num.toFixed(2)}%`;
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', text: input };
    setMessages((m) => [...m, userMessage]);
    setAssistantLoading(true);
    
    try {
      // ✅ Fetch real dashboard data before sending request
      const dashResponse = await dashboardService.getData();
      const dashboardData = dashResponse?.data?.data;
      
      if (!dashboardData) {
        setMessages((m) => [...m, 
          { role: 'assistant', text: 'Unable to fetch financial data. Please try again.' }
        ]);
        setAssistantLoading(false);
        setInput('');
        return;
      }

      // ✅ Sanitize all values from dashboard
      const safeIncome = Number(dashboardData.monthlyIncome) || 0;
      const safeExpenses = Number(dashboardData.monthlyExpenses) || 0;
      const safeEMI = Number(dashboardData.totalEMI) || 0;
      const safeScore = Number(dashboardData.stressScore) || 0;
      const safeLoans = Array.isArray(dashboardData.recentLoans) ? dashboardData.recentLoans : [];

      // ✅ Check if income data is available before proceeding
      if (safeIncome === 0) {
        setMessages((m) => [...m, 
          { role: 'assistant', text: 'Income data not available yet. Please set your financial information on the Dashboard first.' }
        ]);
        setAssistantLoading(false);
        setInput('');
        return;
      }

      // ✅ Build payload with REAL financial data from backend
      const payload = {
        message: input,
        monthlyIncome: safeIncome,
        monthlyExpenses: safeExpenses,
        totalEMI: safeEMI,
        stressScore: safeScore,
        loans: safeLoans
      };
      
      const res = await assistantService.chat(payload);
      
      // ✅ Safely extract reply and sanitize any NaN values
      let reply = res?.data?.data?.reply || 'No response received';
      
      // Replace any NaN occurrences with safe placeholder
      reply = reply.replace(/NaN/g, '0.00');
      reply = reply.replace(/undefined/g, 'unavailable');
      
      setMessages((m) => [...m, { role: 'assistant', text: reply }]);
      setInput('');
    } catch (err) {
      console.error('Assistant error:', err);
      setMessages((m) => [...m, { role: 'assistant', text: 'Sorry, I couldn\'t process your request. Please try again.' }]);
    } finally {
      setAssistantLoading(false);
    }
  };

  const handleSuggestion = (suggestion) => {
    setInput(suggestion);
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-xl shadow-xl p-6 border border-gray-200 z-50 w-80">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Financial Assistant</h3>
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => handleSuggestion("How is my debt health score calculated?")} className="px-3 py-1 bg-blue-900 text-blue-200 rounded text-sm hover:bg-blue-800">Debt Health Score</button>
        <button onClick={() => handleSuggestion("Which loan should I close first?")} className="px-3 py-1 bg-blue-900 text-blue-200 rounded text-sm hover:bg-blue-800">Loan Priority</button>
        <button onClick={() => handleSuggestion("How can I reduce my EMI?")} className="px-3 py-1 bg-blue-900 text-blue-200 rounded text-sm hover:bg-blue-800">Reduce EMI</button>
        <button onClick={() => handleSuggestion("What happens if my income increases?")} className="px-3 py-1 bg-blue-900 text-blue-200 rounded text-sm hover:bg-blue-800">Income Increase</button>
        <button onClick={() => handleSuggestion("How can I become debt-free faster?")} className="px-3 py-1 bg-blue-900 text-blue-200 rounded text-sm hover:bg-blue-800">Debt-Free Faster</button>
      </div>
      <div className="border border-gray-200 rounded-lg p-4 h-64 overflow-y-auto mb-4 bg-[#f9fafb]">
        {messages.map((m, i) => (
          <div key={i} className={`mb-2 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
            <span className={`inline-block px-3 py-2 rounded-lg ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 border border-gray-200'}`}>
              {m.text}
            </span>
          </div>
        ))}
        {assistantLoading && <div className="text-left"><span className="inline-block px-3 py-2 rounded-lg bg-white text-gray-700 border border-gray-200">Typing...</span></div>}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ask about EMI, debt health, loans..."
        />
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700">Send</button>
      </form>
    </div>
  );
};

export default AiAssistant;
