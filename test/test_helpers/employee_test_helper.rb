module EmployeeTestHelper
  # Returns a hash of default employee attributes
  def build_params(overrides = {})
    {
      full_name: "John Doe",
      job_title: "Engineer",
      country: "India",
      salary: 50_000,
      **overrides
    }
  end

  # Build an unsaved employee instance for validation tests
  def build_employee(overrides = {})
    Employee.new(build_params(overrides))
  end

  # Create and persist an employee record for tests
  def create_employee(overrides = {})
    Employee.create!(build_params(overrides))
  end
end