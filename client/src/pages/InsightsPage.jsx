import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { insightsService } from '@/services/insightsService';
import { Dropdown } from '@/components/ui/dropdown';
import { StatCard } from '@/components/ui/stat-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert } from '@/components/ui/alert';
import { EmptyState } from '@/components/ui/empty-state';
import { COUNTRY_OPTIONS, JOB_TITLE_OPTIONS } from '@/utils/constants';
import { formatCurrency, formatNumber } from '@/utils/formatters';

function InsightsPage() {
  const [country, setCountry] = useState('');
  const [jobTitle, setJobTitle] = useState('');

  // Filter out "All Countries" option - country is required
  const countryOptionsFiltered = COUNTRY_OPTIONS.filter((opt) => opt.value !== '');

  // Filter out "All Job Titles" option - job title is optional
  const jobTitleOptionsFiltered = JOB_TITLE_OPTIONS.filter((opt) => opt.value !== '');

  // Fetch insights only when country is selected
  const {
    data: insights,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['insights', { country, jobTitle }],
    queryFn: () => insightsService.getInsights({ country, jobTitle }),
    enabled: !!country, // Only fetch when country is selected
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const handleCountryChange = (e) => {
    setCountry(e.target.value);
  };

  const handleJobTitleChange = (e) => {
    setJobTitle(e.target.value);
  };

  const handleClearCountry = () => {
    setCountry('');
  };

  const handleClearJobTitle = () => {
    setJobTitle('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Salary Insights</h2>
        <p className="text-gray-600">
          View salary statistics and insights across countries and job titles.
        </p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
        <Dropdown
          id="country"
          label="Country"
          value={country}
          onChange={handleCountryChange}
          options={countryOptionsFiltered}
          placeholder="Select a country"
          required
          onClear={handleClearCountry}
          showClearButton={!!country}
        />

        <Dropdown
          id="job_title"
          label="Job Title"
          value={jobTitle}
          onChange={handleJobTitleChange}
          options={jobTitleOptionsFiltered}
          placeholder="Select a job title (optional)"
          onClear={handleClearJobTitle}
          showClearButton={!!jobTitle}
        />
      </div>

      {/* Content */}
      <div>
        {/* Empty State - No country selected */}
        {!country && (
          <EmptyState
            title="Select a country to view insights"
            description="Choose a country from the dropdown above to see salary statistics and employee metrics."
          />
        )}

        {/* Error State */}
        {country && isError && (
          <Alert variant="destructive">
            <p className="font-medium">Failed to load insights</p>
            <p className="text-sm">{error?.message || 'Please try again later.'}</p>
          </Alert>
        )}

        {/* Loading State */}
        {country && isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-32" data-testid="skeleton" />
            <Skeleton className="h-32" data-testid="skeleton" />
            <Skeleton className="h-32" data-testid="skeleton" />
            <Skeleton className="h-32" data-testid="skeleton" />
          </div>
        )}

        {/* Success State - Display Metrics */}
        {country && !isLoading && !isError && insights && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatCard
              label="Minimum Salary"
              value={formatCurrency(insights.min_salary)}
              icon="💰"
            />
            <StatCard
              label="Maximum Salary"
              value={formatCurrency(insights.max_salary)}
              icon="💰"
            />
            <StatCard
              label="Average Salary"
              value={formatCurrency(insights.avg_salary)}
              icon="📊"
            />
            <StatCard
              label="Total Employees"
              value={formatNumber(insights.total_employees)}
              icon="👥"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default InsightsPage;
