require "test_helper"

class EmployeesControllerTest < ActionDispatch::IntegrationTest
  include EmployeeTestHelper

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
    create_employee

    get "/employees"
    assert_response :success
  end

  test "should show employee" do
    employee = create_employee

    get "/employees/#{employee.id}"
    assert_response :success
  end

  test "should update employee" do
    employee = create_employee

    patch "/employees/#{employee.id}", params: {
      employee: { full_name: "Updated Name" }
    }

    assert_response :success
    assert_equal "Updated Name", employee.reload.full_name
  end

  test "should delete employee" do
    employee = create_employee

    assert_difference("Employee.count", -1) do
      delete "/employees/#{employee.id}"
    end

    assert_response :no_content
  end

  test "should return salary insights for a country" do
    create_employee(country: "India", salary: 100)
    create_employee(country: "India", salary: 200)

    get "/employees/insights", params: { country: "India" }

    assert_response :success
    json = JSON.parse(response.body)

    assert_equal 100, json["min_salary"]
    assert_equal 200, json["max_salary"]
    assert_equal 150.0, json["avg_salary"]
    assert_equal 2, json["total_employees"]
  end

  test "should return avg salary for job title in a country" do
    create_employee(country: "India", job_title: "Engineer", salary: 100)
    create_employee(country: "India", job_title: "Engineer", salary: 300)
    create_employee(country: "India", job_title: "Manager", salary: 500)

    get "/employees/insights", params: {
      country: "India",
      job_title: "Engineer"
    }

    assert_response :success
    json = JSON.parse(response.body)

    assert_equal 100, json["min_salary"]
    assert_equal 300, json["max_salary"]
    assert_equal 200.0, json["avg_salary"]
    assert_equal 2, json["total_employees"]
  end

  test "should return error when country param is missing" do
    get "/employees/insights"

    assert_response :bad_request

    json = JSON.parse(response.body)
    expected_msg = I18n.t("error.required", field: I18n.t("field.country"))
    assert_equal expected_msg, json["error"]
  end

  test "should paginate employees list with default values" do
    30.times { |i| create_employee(full_name: "Employee #{i}") }
    get "/employees"
    assert_response :success
    json = JSON.parse(response.body)

    assert json["employees"].is_a?(Array)
    assert_equal 30, json["employees"].length
    assert_equal 30, json["pagination"]["total_count"]
    assert_equal 1, json["pagination"]["current_page"]
    assert_equal 1, json["pagination"]["total_pages"]
    assert_equal 50, json["pagination"]["per_page"]
  end

  test "should paginate employees with custom per_page" do
    55.times { |i| create_employee(full_name: "Employee #{i}") }
    get "/employees", params: { page: 1, per_page: 20 }
    assert_response :success
    json = JSON.parse(response.body)

    assert_equal 20, json["employees"].length
    assert_equal 55, json["pagination"]["total_count"]
    assert_equal 1, json["pagination"]["current_page"]
    assert_equal 3, json["pagination"]["total_pages"]
    assert_equal 20, json["pagination"]["per_page"]
  end

  test "should return second page of employees" do
    55.times { |i| create_employee(full_name: "Employee #{i}") }
    get "/employees", params: { page: 2, per_page: 50 }
    assert_response :success
    json = JSON.parse(response.body)

    assert_equal 5, json["employees"].length
    assert_equal 2, json["pagination"]["current_page"]
  end

  test "should filter employees by country" do
    create_employee(full_name: "John India", country: "India")
    create_employee(full_name: "Jane USA", country: "USA")
    create_employee(full_name: "Bob India", country: "India")

    get "/employees", params: { country: "India" }
    assert_response :success
    json = JSON.parse(response.body)

    assert_equal 2, json["employees"].length
    assert_equal 2, json["pagination"]["total_count"]
    json["employees"].each do |emp|
      assert_equal "India", emp["country"]
    end
  end

  test "should filter employees by job_title" do
    create_employee(full_name: "John Engineer", job_title: "Engineer")
    create_employee(full_name: "Jane Manager", job_title: "Manager")
    create_employee(full_name: "Bob Engineer", job_title: "Engineer")

    get "/employees", params: { job_title: "Engineer" }
    assert_response :success
    json = JSON.parse(response.body)

    assert_equal 2, json["employees"].length
    json["employees"].each do |emp|
      assert_equal "Engineer", emp["job_title"]
    end
  end

  test "should filter employees by both country and job_title" do
    create_employee(full_name: "John", country: "India", job_title: "Engineer")
    create_employee(full_name: "Jane", country: "USA", job_title: "Engineer")
    create_employee(full_name: "Bob", country: "India", job_title: "Manager")

    get "/employees", params: { country: "India", job_title: "Engineer" }
    assert_response :success
    json = JSON.parse(response.body)

    assert_equal 1, json["employees"].length
    assert_equal "John", json["employees"][0]["full_name"]
  end

  test "should search employees by name" do
    create_employee(full_name: "John Doe")
    create_employee(full_name: "Jane Smith")
    create_employee(full_name: "Johnny Walker")

    get "/employees", params: { search: "John" }
    assert_response :success
    json = JSON.parse(response.body)

    assert_equal 2, json["employees"].length
    json["employees"].each do |emp|
      assert_match(/John/i, emp["full_name"])
    end
  end

  test "should combine search with filters" do
    create_employee(full_name: "John Doe", country: "India")
    create_employee(full_name: "John Smith", country: "USA")
    create_employee(full_name: "Jane Doe", country: "India")

    get "/employees", params: { search: "John", country: "India" }
    assert_response :success
    json = JSON.parse(response.body)

    assert_equal 1, json["employees"].length
    assert_equal "John Doe", json["employees"][0]["full_name"]
  end
end
