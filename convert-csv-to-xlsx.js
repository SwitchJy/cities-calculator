const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Input and output file paths
const inputPath = path.join(__dirname, 'public', '2024-cities-social-insurance-standards.csv');
const outputPath = path.join(__dirname, 'public', '2024-cities-social-insurance-standards.xlsx');

try {
  // Read the CSV file
  const csvContent = fs.readFileSync(inputPath, 'utf8');

  // Parse CSV content
  const lines = csvContent.split('\n').filter(line => line.trim() !== '');
  const headers = lines[0].split(',');

  // Convert CSV to worksheet data
  const wsData = lines.map(line => line.split(','));

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths for better readability
  const colWidths = [
    { wch: 10 }, // city_name
    { wch: 8 },  // year
    { wch: 10 }, // base_min
    { wch: 10 }, // base_max
    { wch: 8 }   // rate
  ];
  ws['!cols'] = colWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, '2024社保标准');

  // Write Excel file
  XLSX.writeFile(wb, outputPath);

  console.log('✅ CSV转换为Excel成功！');
  console.log(`📁 输出文件: ${outputPath}`);
  console.log(`📊 转换了 ${lines.length - 1} 个城市的数据`);

} catch (error) {
  console.error('❌ 转换失败:', error.message);
  process.exit(1);
}