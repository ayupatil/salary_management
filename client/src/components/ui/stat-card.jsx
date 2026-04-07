import React from 'react';

/**
 * StatCard Component
 * 
 * Displays a single metric/statistic in a card format
 * Used in dashboards and analytics views
 * 
 * @param {string} label - The metric label (e.g., "Average Salary")
 * @param {string} value - The formatted value (e.g., "$120,844")
 * @param {string} icon - Optional icon/emoji to display (e.g., "💰")
 * @param {string} className - Optional additional CSS classes
 */
export function StatCard({ label, value, icon, className = '' }) {
  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-600">{label}</h3>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
