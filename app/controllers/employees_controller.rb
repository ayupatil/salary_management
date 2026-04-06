class EmployeesController < ApplicationController
  def index
    page = params[:page] || 1
    per_page = [ params[:per_page]&.to_i || 50 ].min

    employees = Employee.all
    employees = employees.where(country: params[:country]) if params[:country].present?
    employees = employees.where(job_title: params[:job_title]) if params[:job_title].present?
    employees = employees.where("full_name LIKE ?", "%#{params[:search]}%") if params[:search].present?

    employees = employees.page(page).per(per_page)

    render json: {
      employees: employees,
      pagination: {
        current_page: employees.current_page,
        total_pages: employees.total_pages,
        total_count: employees.total_count,
        per_page: per_page
      }
    }
  end

  def show
    employee = Employee.find(params[:id])
    render json: employee
  end

  def create
    employee = Employee.new(employee_params)

    if employee.save
      render json: employee, status: :created
    else
      render json: { errors: employee.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    employee = Employee.find(params[:id])

    if employee.update(employee_params)
      render json: employee
    else
      render json: { errors: employee.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    employee = Employee.find(params[:id])
    employee.destroy

    head :no_content
  end

  def insights
    if params[:country].blank?
      return render json: { error: I18n.t("error.required", field: I18n.t("field.country")) },
                    status: :bad_request
    end

    result = SalaryInsightsService.new(
      country: params[:country],
      job_title: params[:job_title]
    ).call

    render json: result
  end

  private

  def employee_params
    params.require(:employee).permit(:full_name, :job_title, :country, :salary)
  end
end
