import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import InsightsPage from '../InsightsPage';
import { insightsService } from '@/services/insightsService';

// Mock the insights service
vi.mock('@/services/insightsService', () => ({
  insightsService: {
    getInsights: vi.fn(),
  },
}));

// Helper to render with providers
const renderWithProviders = (component) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return render(
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    </BrowserRouter>
  );
};

describe('InsightsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render page header and description', () => {
    renderWithProviders(<InsightsPage />);
    
    expect(screen.getByText('Salary Insights')).toBeInTheDocument();
    expect(screen.getByText(/view salary statistics and insights/i)).toBeInTheDocument();
  });

  it('should render country and job title dropdowns', () => {
    renderWithProviders(<InsightsPage />);
    
    expect(screen.getByLabelText(/country/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/job title/i)).toBeInTheDocument();
  });

  it('should have country dropdown without "All Countries" option', () => {
    renderWithProviders(<InsightsPage />);
    
    const countryDropdown = screen.getByLabelText(/country/i);
    const options = Array.from(countryDropdown.options)
      .filter(opt => !opt.disabled) // Filter out disabled placeholder
      .map(opt => opt.value);
    
    // Should not include "All Countries" as a selectable option
    expect(options).not.toContain('All Countries');
    
    // Should include actual countries
    expect(options).toContain('India');
    expect(options).toContain('USA');
    expect(options).toContain('UK');
  });

  it('should have job title dropdown with "All Job Titles" option', () => {
    renderWithProviders(<InsightsPage />);
    
    const jobTitleDropdown = screen.getByLabelText(/job title/i);
    const options = Array.from(jobTitleDropdown.options).map(opt => opt.value);
    
    // Should include empty value (All Job Titles)
    expect(options).toContain('');
    
    // Should include actual job titles
    expect(options).toContain('Engineer');
    expect(options).toContain('Manager');
  });

  it('should show empty state when no country is selected', () => {
    renderWithProviders(<InsightsPage />);
    
    // Should show empty state message (not the dropdown placeholder)
    const emptyStateMessages = screen.getAllByText(/select a country/i);
    // Should have at least the empty state message (might also have dropdown placeholder)
    expect(emptyStateMessages.length).toBeGreaterThan(0);
    
    // Should not show stat cards
    expect(screen.queryByText(/minimum salary/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/maximum salary/i)).not.toBeInTheDocument();
  });

  it('should fetch insights when country is selected', async () => {
    const mockData = {
      min_salary: 40366,
      max_salary: 199907,
      avg_salary: 122402.19,
      total_employees: 398,
    };
    
    insightsService.getInsights.mockResolvedValueOnce(mockData);
    
    const user = userEvent.setup();
    renderWithProviders(<InsightsPage />);
    
    // Select a country
    const countryDropdown = screen.getByLabelText(/country/i);
    await user.selectOptions(countryDropdown, 'USA');
    
    // Should call API with correct parameters
    await waitFor(() => {
      expect(insightsService.getInsights).toHaveBeenCalledWith({
        country: 'USA',
        jobTitle: '',
      });
    });
  });

  it('should display loading skeleton while fetching', async () => {
    insightsService.getInsights.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 1000))
    );
    
    const user = userEvent.setup();
    renderWithProviders(<InsightsPage />);
    
    // Select a country
    const countryDropdown = screen.getByLabelText(/country/i);
    await user.selectOptions(countryDropdown, 'USA');
    
    // Should show loading skeletons
    await waitFor(() => {
      const skeletons = screen.getAllByTestId('skeleton');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  it('should display salary metrics after successful fetch', async () => {
    const mockData = {
      min_salary: 40366,
      max_salary: 199907,
      avg_salary: 122402.19,
      total_employees: 398,
    };
    
    insightsService.getInsights.mockResolvedValueOnce(mockData);
    
    const user = userEvent.setup();
    renderWithProviders(<InsightsPage />);
    
    // Select a country
    const countryDropdown = screen.getByLabelText(/country/i);
    await user.selectOptions(countryDropdown, 'USA');
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText(/minimum salary/i)).toBeInTheDocument();
      expect(screen.getByText(/maximum salary/i)).toBeInTheDocument();
      expect(screen.getByText(/average salary/i)).toBeInTheDocument();
      expect(screen.getByText(/total employees/i)).toBeInTheDocument();
    });
  });

  it('should format currency values correctly', async () => {
    const mockData = {
      min_salary: 40366,
      max_salary: 199907,
      avg_salary: 122402,
      total_employees: 398,
    };
    
    insightsService.getInsights.mockResolvedValueOnce(mockData);
    
    const user = userEvent.setup();
    renderWithProviders(<InsightsPage />);
    
    // Select a country
    const countryDropdown = screen.getByLabelText(/country/i);
    await user.selectOptions(countryDropdown, 'USA');
    
    // Wait for data and check formatting
    await waitFor(() => {
      expect(screen.getByText('$40,366')).toBeInTheDocument();
      expect(screen.getByText('$199,907')).toBeInTheDocument();
      expect(screen.getByText('$122,402')).toBeInTheDocument();
      expect(screen.getByText('398')).toBeInTheDocument();
    });
  });

  it('should show error alert when API fails', async () => {
    insightsService.getInsights.mockRejectedValueOnce(
      new Error('Failed to fetch insights')
    );
    
    const user = userEvent.setup();
    renderWithProviders(<InsightsPage />);
    
    // Select a country
    const countryDropdown = screen.getByLabelText(/country/i);
    await user.selectOptions(countryDropdown, 'USA');
    
    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/failed to load insights/i)).toBeInTheDocument();
    });
  });

  it('should update insights when job title filter changes', async () => {
    const mockDataAll = {
      min_salary: 40366,
      max_salary: 199907,
      avg_salary: 122402,
      total_employees: 1927,
    };
    
    const mockDataEngineers = {
      min_salary: 50000,
      max_salary: 180000,
      avg_salary: 115000,
      total_employees: 398,
    };
    
    insightsService.getInsights
      .mockResolvedValueOnce(mockDataAll)
      .mockResolvedValueOnce(mockDataEngineers);
    
    const user = userEvent.setup();
    renderWithProviders(<InsightsPage />);
    
    // Select a country
    const countryDropdown = screen.getByLabelText(/country/i);
    await user.selectOptions(countryDropdown, 'USA');
    
    // Wait for initial data
    await waitFor(() => {
      expect(screen.getByText('1,927')).toBeInTheDocument();
    });
    
    // Change job title filter
    const jobTitleDropdown = screen.getByLabelText(/job title/i);
    await user.selectOptions(jobTitleDropdown, 'Engineer');
    
    // Should call API with new parameters
    await waitFor(() => {
      expect(insightsService.getInsights).toHaveBeenCalledWith({
        country: 'USA',
        jobTitle: 'Engineer',
      });
    });
    
    // Should show updated data
    await waitFor(() => {
      expect(screen.getByText('398')).toBeInTheDocument();
    });
  });

  it('should use correct cache key with country and jobTitle', async () => {
    const mockData = {
      min_salary: 40366,
      max_salary: 199907,
      avg_salary: 122402,
      total_employees: 398,
    };
    
    insightsService.getInsights.mockResolvedValueOnce(mockData);
    
    const user = userEvent.setup();
    
    // Create a spy-able query client
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
      },
    });
    
    render(
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <InsightsPage />
        </QueryClientProvider>
      </BrowserRouter>
    );
    
    // Select a country
    const countryDropdown = screen.getByLabelText(/country/i);
    await user.selectOptions(countryDropdown, 'USA');
    
    // Wait for API call to complete
    await waitFor(() => {
      expect(insightsService.getInsights).toHaveBeenCalledWith({
        country: 'USA',
        jobTitle: '',
      });
    });
    
    // Wait for data to be displayed
    await waitFor(() => {
      expect(screen.getByText('$40,366')).toBeInTheDocument();
    });
    
    // Verify cache key structure
    const cacheKeys = Array.from(queryClient.getQueryCache().getAll())
      .map(query => query.queryKey)
      .filter(key => Array.isArray(key) && key[0] === 'insights' && key[1].country !== '');
    
    // Should have exactly one insights query with USA
    expect(cacheKeys.length).toBe(1);
    expect(cacheKeys[0]).toEqual(['insights', { country: 'USA', jobTitle: '' }]);
  });

  it('should show clear button when country is selected', async () => {
    const user = userEvent.setup();
    renderWithProviders(<InsightsPage />);

    // Initially no clear button
    expect(screen.queryByLabelText(/clear selection/i)).not.toBeInTheDocument();

    // Select a country
    const countryDropdown = screen.getByLabelText(/country/i);
    await user.selectOptions(countryDropdown, 'USA');

    // Clear button should appear
    await waitFor(() => {
      const clearButtons = screen.getAllByLabelText(/clear selection/i);
      expect(clearButtons.length).toBeGreaterThan(0);
    });
  });

  it('should clear country selection when clear button is clicked', async () => {
    const mockData = {
      min_salary: 40366,
      max_salary: 199907,
      avg_salary: 122402,
      total_employees: 398,
    };

    insightsService.getInsights.mockResolvedValueOnce(mockData);

    const user = userEvent.setup();
    renderWithProviders(<InsightsPage />);

    // Select a country
    const countryDropdown = screen.getByLabelText(/country/i);
    await user.selectOptions(countryDropdown, 'USA');

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('$40,366')).toBeInTheDocument();
    });

    // Click clear button
    const clearButtons = screen.getAllByLabelText(/clear selection/i);
    await user.click(clearButtons[0]); // First clear button is for country

    // Should show empty state again
    await waitFor(() => {
      expect(screen.getByText(/choose a country from the dropdown/i)).toBeInTheDocument();
    });

    // Dropdown should be reset
    expect(countryDropdown.value).toBe('');
  });

  it('should clear job title filter when clear button is clicked', async () => {
    const mockDataAll = {
      min_salary: 40366,
      max_salary: 199907,
      avg_salary: 122402,
      total_employees: 1927,
    };

    const mockDataEngineers = {
      min_salary: 50000,
      max_salary: 180000,
      avg_salary: 115000,
      total_employees: 398,
    };

    insightsService.getInsights
      .mockResolvedValueOnce(mockDataAll)
      .mockResolvedValueOnce(mockDataAll); // Called again after clearing job title

    const user = userEvent.setup();
    renderWithProviders(<InsightsPage />);

    // Select a country
    const countryDropdown = screen.getByLabelText(/country/i);
    await user.selectOptions(countryDropdown, 'USA');

    // Wait for initial data
    await waitFor(() => {
      expect(screen.getByText('1,927')).toBeInTheDocument();
    });

    // Select job title
    const jobTitleDropdown = screen.getByLabelText(/job title/i);
    await user.selectOptions(jobTitleDropdown, 'Engineer');

    // Wait a bit for selection to register
    await waitFor(() => {
      expect(jobTitleDropdown.value).toBe('Engineer');
    });

    // Click clear button for job title (second clear button)
    const clearButtons = screen.getAllByLabelText(/clear selection/i);
    await user.click(clearButtons[1]); // Second clear button is for job title

    // Job title should be cleared
    await waitFor(() => {
      expect(jobTitleDropdown.value).toBe('');
    });
  });
});
