ENV["RAILS_ENV"] ||= "test"
require_relative "../config/environment"
require "rails/test_help"

Dir[Rails.root.join("test/test_helpers/**/*.rb")].each { |file| require file }

class ActiveSupport::TestCase
  parallelize(workers: :number_of_processors)
end
