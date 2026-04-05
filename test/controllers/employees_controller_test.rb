require "test_helper"

class EmployeesControllerTest < ActionDispatch::IntegrationTest
  def build_params(overrides = {})
    {
      full_name: "John Doe",
      job_title: "Engineer",
      country: "India",
      salary: 50000
    }.merge(overrides)
  end

  test "should create employee" do
    assert_difference("Employee.count", 1) do
      post "/employees", params: { employee: build_params }
    end

    assert_response :created
  end

  test "should not create invalid employee" do
    post "/employees", params: { employee: build_params(full_name: nil) }

    assert_response :unprocessable_entity
  end

  test "should get index" do
    Employee.create!(build_params)

    get "/employees"

    assert_response :success
  end

  test "should show employee" do
    employee = Employee.create!(build_params)

    get "/employees/#{employee.id}"

    assert_response :success
  end

  test "should update employee" do
    employee = Employee.create!(build_params)

    patch "/employees/#{employee.id}", params: {
      employee: { full_name: "Updated Name" }
    }

    assert_response :success
    assert_equal "Updated Name", employee.reload.full_name
  end

  test "should delete employee" do
    employee = Employee.create!(build_params)

    assert_difference("Employee.count", -1) do
      delete "/employees/#{employee.id}"
    end

    assert_response :no_content
  end
end