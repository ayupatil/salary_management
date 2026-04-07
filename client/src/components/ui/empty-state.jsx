import React from 'react';

const EmptyState = ({ title, description, icon, action, className = '' }) => {
  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg p-12 text-center ${className}`}
    >
      {icon && <div className="mb-4 flex justify-center">{icon}</div>}
      <p className="text-gray-500 text-lg">{title}</p>
      {description && (
        <p className="text-gray-400 text-sm mt-2">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};

export { EmptyState };
