require "test_helper"

class EmployeeTest < ActiveSupport::TestCase
  def build_employee(overrides = {})
    Employee.new(
      full_name: "John Doe",
      job_title: "Engineer",
      country: "India",
      salary: 50000,
      **overrides
    )
  end

  test "is valid with all required attributes" do
    employee = build_employee
    assert employee.valid?
  end

  test "is invalid without full_name" do
    employee = build_employee(full_name: nil)
    assert_not employee.valid?
  end

  test "is invalid without job_title" do
    employee = build_employee(job_title: nil)
    assert_not employee.valid?
  end

  test "is invalid without country" do
    employee = build_employee(country: nil)
    assert_not employee.valid?
  end

  test "is invalid without salary" do
    employee = build_employee(salary: nil)
    assert_not employee.valid?
  end
end