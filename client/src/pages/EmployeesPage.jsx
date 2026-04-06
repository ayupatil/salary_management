import EmployeeList from '@/components/employees/EmployeeList';

function EmployeesPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Employee Management</h2>
        <p className="text-gray-600 text-base">
          Manage employee records, add new employees, and update information.
        </p>
      </div>
      <EmployeeList />
    </div>
  );
}

export default EmployeesPage;
