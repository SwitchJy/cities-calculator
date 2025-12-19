import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { insertSalaries } from '@/lib/database'
import { SalaryInput } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { success: false, message: '请选择要上传的文件' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
      return NextResponse.json(
        { success: false, message: '仅支持Excel文件（.xlsx、.xls）或CSV文件' },
        { status: 400 }
      )
    }

    // Read file buffer
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'buffer' })

    // Get first worksheet
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const data = XLSX.utils.sheet_to_json(worksheet)

    // Validate and transform data
    const salaries: SalaryInput[] = []
    const errors: string[] = []

    // Helper function to find the correct column name
    const findColumn = (row: any, possibleNames: string[]): string | null => {
      for (const name of possibleNames) {
        // Check exact match
        if (row[name] !== undefined) return name
        // Check with trimming
        for (const key in row) {
          if (key.trim() === name) return key
        }
      }
      return null
    }

    for (let i = 0; i < data.length; i++) {
      const row: any = data[i]

      // Find column names (handle variations)
      const employeeIdCol = findColumn(row, ['employee_id', 'employeeid', '工号', '员工编号', '员工工号'])
      const employeeNameCol = findColumn(row, ['employee_name', 'employeename', '姓名', '员工姓名'])
      const monthCol = findColumn(row, ['month', '月份', '年月'])
      const salaryAmountCol = findColumn(row, ['salary_amount', 'salaryamount', '工资', '工资金额', '金额'])

      // Get values with fallback
      const employeeId = employeeIdCol ? String(row[employeeIdCol]).trim() : ''
      const employeeName = employeeNameCol ? String(row[employeeNameCol]).trim() : ''
      const month = monthCol ? String(row[monthCol]).trim() : ''
      const salaryAmount = salaryAmountCol ? Number(row[salaryAmountCol]) : 0

      // Validate required fields
      if (!employeeId) {
        errors.push(`第${i + 2}行：未找到或员工工号为空（查找列：employee_id、工号、员工编号等）`)
        continue
      }
      if (!employeeName) {
        errors.push(`第${i + 2}行：未找到或员工姓名为空`)
        continue
      }
      if (!month) {
        errors.push(`第${i + 2}行：未找到或月份为空`)
        continue
      }

      // Transform data
      const salary: SalaryInput = {
        employee_id: employeeId,
        employee_name: employeeName,
        month: month,
        salary_amount: salaryAmount
      }

      // Validate data
      // Validate month format (YYYYMM)
      if (!/^\d{6}$/.test(salary.month)) {
        errors.push(`第${i + 2}行：月份格式不正确，应为YYYYMM（如202401）`)
        continue
      }

      const year = parseInt(salary.month.substring(0, 4))
      const monthNum = parseInt(salary.month.substring(4, 6))

      if (year < 2000 || year > 2100) {
        errors.push(`第${i + 2}行：年份不在有效范围内`)
        continue
      }

      if (monthNum < 1 || monthNum > 12) {
        errors.push(`第${i + 2}行：月份不在有效范围内（1-12）`)
        continue
      }

      // Validate salary amount
      if (isNaN(salary.salary_amount) || salary.salary_amount < 0) {
        errors.push(`第${i + 2}行：工资金额必须是正数`)
        continue
      }

      salaries.push(salary)
    }

    if (errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: '数据验证失败',
          errors
        },
        { status: 400 }
      )
    }

    if (salaries.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: '没有有效的数据可以导入'
        },
        { status: 400 }
      )
    }

    // Insert data into database
    console.log(`准备插入${salaries.length}条工资数据`)
    const insertedSalaries = await insertSalaries(salaries)
    console.log(`成功插入${insertedSalaries.length}条工资数据`)

    return NextResponse.json({
      success: true,
      message: `成功导入${insertedSalaries.length}条工资数据`,
      data: insertedSalaries
    })

  } catch (error) {
    console.error('Upload salaries error:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : '上传失败'
      },
      { status: 500 }
    )
  }
}