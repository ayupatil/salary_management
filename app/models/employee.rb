class Employee < ApplicationRecord
  acts_as_paranoid

  validates :full_name, :job_title, :country, :salary, presence: true
  validates :salary, numericality: { greater_than: 0 }
  validates :full_name, length: { minimum: 2 }
end
