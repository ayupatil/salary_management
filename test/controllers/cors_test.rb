require "test_helper"
class CorsTest < ActionDispatch::IntegrationTest
  test "should set CORS headers for GET request" do
    get "/employees", headers: { "Origin" => "http://localhost:5173" }

    assert_response :success
    assert_equal "http://localhost:5173", response.headers["Access-Control-Allow-Origin"]
  end

  test "should handle OPTIONS preflight request" do
    process :options, "/employees", headers: {
      "Origin" => "http://localhost:5173",
      "Access-Control-Request-Method" => "POST",
      "Access-Control-Request-Headers" => "Content-Type"
    }
    assert_response :success
    assert_equal "http://localhost:5173", response.headers["Access-Control-Allow-Origin"]
    assert_includes response.headers["Access-Control-Allow-Methods"], "POST"
  end
end
