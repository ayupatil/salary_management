require "test_helper"

class SalaryInsightsServiceTest < ActiveSupport::TestCase
  include EmployeeTestHelper

  test "should return consistent metrics shape for country insights" do
    create_employee(salary: 10000)
    create_employee(salary: 20000)

    result = SalaryInsightsService.new(country: "India").call

    assert_equal 10000, result[:min_salary]
    assert_equal 20000, result[:max_salary]
    assert_equal 15000.0, result[:avg_salary]
    assert_equal 2, result[:total_employees]
  end

  test "should return consistent metrics shape for job title insights" do
    create_employee(job_title: "Engineer", salary: 10000)
    create_employee(job_title: "Engineer", salary: 30000)
    create_employee(job_title: "Manager", salary: 50000)

    result = SalaryInsightsService.new(
      country: "India",
      job_title: "Engineer"
    ).call

    # Should return same shape as country insights
    assert_equal 10000, result[:min_salary]
    assert_equal 30000, result[:max_salary]
    assert_equal 20000.0, result[:avg_salary]
    assert_equal 2, result[:total_employees]
  end

  test "should handle country with no employees" do
    result = SalaryInsightsService.new(country: "Japan").call

    assert_nil result[:min_salary]
    assert_nil result[:max_salary]
    assert_equal 0.0, result[:avg_salary]
    assert_equal 0, result[:total_employees]
  end

  test "should handle job title with no employees in country" do
    create_employee(job_title: "Manager")

    result = SalaryInsightsService.new(
      country: "India",
      job_title: "Engineer"
    ).call

    assert_nil result[:min_salary]
    assert_nil result[:max_salary]
    assert_equal 0.0, result[:avg_salary]
    assert_equal 0, result[:total_employees]
  end

  test "should raise error when country is blank" do
    assert_raises(ArgumentError) do
      SalaryInsightsService.new(country: "").call
    end
  end
end
