require "test_helper"

class SeedsTest < ActiveSupport::TestCase
  test "seed script should be idempotent" do
    # Run seed script twice
    load Rails.root.join("db/seeds.rb")
    first_count = Employee.count

    load Rails.root.join("db/seeds.rb")
    second_count = Employee.count

    # Count should remain same (script clears before seeding)
    assert_equal first_count, second_count
    assert_equal 10_000, Employee.count
  end

  test "seed script should create exactly 10000 employees" do
    Employee.delete_all

    load Rails.root.join("db/seeds.rb")

    assert_equal 10_000, Employee.count
  end

  test "seed script should include timestamps" do
    Employee.delete_all

    load Rails.root.join("db/seeds.rb")

    employee = Employee.first
    assert_not_nil employee.created_at
    assert_not_nil employee.updated_at
  end
end
