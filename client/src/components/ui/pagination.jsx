import React from 'react';
import { Button } from './button';
import { Icon } from '@iconify/react';

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}) => {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div
      className={`flex items-center justify-between bg-white border border-gray-200 rounded-lg gap-2 px-3 py-2 ${className}`}
    >
      <div className="text-sm text-gray-700">
        Page <span className="font-semibold">{currentPage}</span> of{' '}
        <span className="font-semibold">{totalPages}</span>
      </div>

      <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentPage === 1}
          aria-label="Previous"
      >
        <Icon icon='carbon:chevron-left' width='16' height='16' />
      </Button>

      <Button
        variant="outline"
        onClick={handleNext}
        disabled={currentPage === totalPages}
        aria-label="Next"
      >
        <Icon icon='carbon:chevron-right' width='16' height='16' />
      </Button>
    </div>
  );
};

export { Pagination };
