class Employee < ApplicationRecord
  validates :full_name, :job_title, :country, :salary, presence: true
end