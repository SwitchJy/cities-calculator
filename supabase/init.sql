-- Create cities table
CREATE TABLE cities (
  id SERIAL PRIMARY KEY,
  city_name TEXT NOT NULL,
  year TEXT NOT NULL,
  base_min INTEGER NOT NULL,
  base_max INTEGER NOT NULL,
  rate DECIMAL(10, 4) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create salaries table
CREATE TABLE salaries (
  id SERIAL PRIMARY KEY,
  employee_id TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  month TEXT NOT NULL, -- Format: YYYYMM
  salary_amount INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create results table
CREATE TABLE results (
  id SERIAL PRIMARY KEY,
  employee_name TEXT NOT NULL,
  avg_salary DECIMAL(12, 2) NOT NULL,
  contribution_base DECIMAL(12, 2) NOT NULL,
  company_fee DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_cities_city_year ON cities(city_name, year);
CREATE INDEX idx_salaries_employee ON salaries(employee_name, month);
CREATE INDEX idx_results_employee ON results(employee_name);

-- Enable Row Level Security
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE salaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow all operations for now (in production, restrict as needed)
CREATE POLICY "Enable all operations on cities" ON cities FOR ALL USING (true);
CREATE POLICY "Enable all operations on salaries" ON salaries FOR ALL USING (true);
CREATE POLICY "Enable all operations on results" ON results FOR ALL USING (true);

-- Insert sample data for Foshan
INSERT INTO cities (city_name, year, base_min, base_max, rate) VALUES
('佛山', '2024', 1900, 25000, 0.154);

-- Insert sample salary data
INSERT INTO salaries (employee_id, employee_name, month, salary_amount) VALUES
('EMP001', '张三', '202401', 8000),
('EMP001', '张三', '202402', 8500),
('EMP001', '张三', '202403', 8000),
('EMP001', '张三', '202404', 9000),
('EMP001', '张三', '202405', 8500),
('EMP001', '张三', '202406', 8000),
('EMP001', '张三', '202407', 9500),
('EMP001', '张三', '202408', 8500),
('EMP001', '张三', '202409', 8000),
('EMP001', '张三', '202410', 9000),
('EMP001', '张三', '202411', 8500),
('EMP001', '张三', '202412', 10000),
('EMP002', '李四', '202401', 15000),
('EMP002', '李四', '202402', 15000),
('EMP002', '李四', '202403', 16000),
('EMP002', '李四', '202404', 15500),
('EMP002', '李四', '202405', 15000),
('EMP002', '李四', '202406', 16500),
('EMP002', '李四', '202407', 16000),
('EMP002', '李四', '202408', 15500),
('EMP002', '李四', '202409', 17000),
('EMP002', '李四', '202410', 16000),
('EMP002', '李四', '202411', 16500),
('EMP002', '李四', '202412', 17000),
('EMP003', '王五', '202401', 1800),
('EMP003', '王五', '202402', 1800),
('EMP003', '王五', '202403', 2000),
('EMP003', '王五', '202404', 1800),
('EMP003', '王五', '202405', 2200),
('EMP003', '王五', '202406', 1800),
('EMP003', '王五', '202407', 2000),
('EMP003', '王五', '202408', 1800),
('EMP003', '王五', '202409', 2200),
('EMP003', '王五', '202410', 2000),
('EMP003', '王五', '202411', 1800),
('EMP003', '王五', '202412', 2500);