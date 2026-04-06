require "test_helper"

class EmployeeTest < ActiveSupport::TestCase
  include EmployeeTestHelper

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

  test "salary should be greater than 0" do
    employee = build_employee(salary: 0)
    assert_not employee.valid?
  end

  test "salary should be numeric" do
    employee = build_employee(salary: "abc")
    assert_not employee.valid?
  end

  test "full_name should not be blank" do
    employee = build_employee(full_name: "")
    assert_not employee.valid?
  end

  test "full_name should be atleast 2 chars long" do
    employee = build_employee(full_name: "a")
    assert_not employee.valid?
  end
end
