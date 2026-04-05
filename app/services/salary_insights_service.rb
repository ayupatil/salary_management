class SalaryInsightsService
  def initialize(country:, job_title: nil)
    @country = country
    @job_title = job_title
  end

  def call
    raise ArgumentError, I18n.t("error.required", field: I18n.t("field.country")) if @country.blank?

    employees = Employee.where(country: @country)

    if @job_title.present?
      { avg_salary: employees.where(job_title: @job_title).average(:salary).to_f }
    else
      {
        min_salary: employees.minimum(:salary),
        max_salary: employees.maximum(:salary),
        avg_salary: employees.average(:salary).to_f,
        total_employees: employees.count
      }
    end
  end
end
