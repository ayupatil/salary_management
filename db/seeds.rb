first_names = File.read(Rails.root.join("db/content/first_names.txt")).split("\n")
last_names  = File.read(Rails.root.join("db/content/last_names.txt")).split("\n")
job_titles  = [ "Engineer", "Manager", "Designer", "QA", "HR" ]
countries   = [ "India", "USA", "UK", "Germany", "France" ]

raise "first_names.txt is empty" if first_names.empty?
raise "last_names.txt is empty"  if last_names.empty?

employees_data = []

10_000.times do
  employees_data << {
    full_name: "#{first_names.sample} #{last_names.sample}",
    job_title: job_titles.sample,
    country: countries.sample,
    salary: rand(40_000..200_000)
  }
end

Employee.insert_all(employees_data)
puts "Seeded 10,000 employees!"
