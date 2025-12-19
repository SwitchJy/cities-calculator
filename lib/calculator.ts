import { getSalaries, getCityByName, clearResults, insertResult } from './database'
import { Result } from '@/types'

interface CalculationParams {
  cityName?: string
  year?: string
}

/**
 * Calculate social insurance contributions for all employees
 * @param params - Optional parameters including city name and year
 */
export async function calculateContributions(params: CalculationParams = {}) {
  const { cityName = '佛山', year } = params

  try {
    // Step 1: Get all salary data
    const salaries = await getSalaries()

    // Step 2: Group salaries by employee and calculate average
    const employeeSalaries = salaries.reduce((acc, salary) => {
      if (!acc[salary.employee_name]) {
        acc[salary.employee_name] = []
      }
      acc[salary.employee_name].push(salary.salary_amount)
      return acc
    }, {} as Record<string, number[]>)

    // Step 3: Get city standards (currently hardcoded for Foshan)
    const cityStandards = await getCityByName(cityName, year)

    if (!cityStandards) {
      throw new Error(`未找到${cityName}${year ? year + '年' : ''}的社保标准数据`)
    }

    // Step 4: Clear existing results
    await clearResults()

    // Step 5: Calculate for each employee
    const results: Omit<Result, 'id' | 'created_at'>[] = []

    for (const [employeeName, monthlySalaries] of Object.entries(employeeSalaries)) {
      // Calculate average monthly salary
      const avgSalary = monthlySalaries.reduce((sum, salary) => sum + salary, 0) / monthlySalaries.length

      // Determine contribution base
      let contributionBase: number
      if (avgSalary < cityStandards.base_min) {
        contributionBase = cityStandards.base_min
      } else if (avgSalary > cityStandards.base_max) {
        contributionBase = cityStandards.base_max
      } else {
        contributionBase = avgSalary
      }

      // Calculate company fee
      const companyFee = contributionBase * cityStandards.rate

      results.push({
        employee_name: employeeName,
        avg_salary: Math.round(avgSalary * 100) / 100, // Round to 2 decimal places
        contribution_base: Math.round(contributionBase * 100) / 100,
        company_fee: Math.round(companyFee * 100) / 100
      })
    }

    // Step 6: Insert results into database
    const insertedResults: Result[] = []
    for (const result of results) {
      const inserted = await insertResult(result)
      insertedResults.push(inserted)
    }

    return {
      success: true,
      message: `成功计算${insertedResults.length}名员工的社保费用`,
      data: insertedResults,
      cityStandards: {
        city_name: cityStandards.city_name,
        year: cityStandards.year,
        base_min: cityStandards.base_min,
        base_max: cityStandards.base_max,
        rate: cityStandards.rate
      }
    }

  } catch (error) {
    console.error('计算社保费用时出错:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : '计算失败',
      data: null
    }
  }
}