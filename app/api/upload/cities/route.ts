import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { insertCities } from '@/lib/database'
import { CityInput } from '@/types'

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
    const cities: CityInput[] = []
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

      // Find column names (handle variations and typos)
      const cityNameCol = findColumn(row, ['city_name', 'city_namte', 'cityname', '城市名', '城市名称'])
      const yearCol = findColumn(row, ['year', '年份', '年度'])
      const baseMinCol = findColumn(row, ['base_min', 'basemin', '基数下限', '下限', '缴费基数下限'])
      const baseMaxCol = findColumn(row, ['base_max', 'basemax', '基数上限', '上限', '缴费基数上限'])
      const rateCol = findColumn(row, ['rate', '缴纳比例', '比例', '费率'])

      // Get values with fallback
      const cityName = cityNameCol ? String(row[cityNameCol]).trim() : ''
      const year = yearCol ? String(row[yearCol]).trim() : ''
      const baseMin = baseMinCol ? Number(row[baseMinCol]) : 0
      const baseMax = baseMaxCol ? Number(row[baseMaxCol]) : 0
      const rate = rateCol ? Number(row[rateCol]) : 0

      // Validate required fields
      if (!cityName) {
        errors.push(`第${i + 2}行：未找到或城市名称为空（查找列：city_name、city_namte、城市名等）`)
        continue
      }
      if (!year) {
        errors.push(`第${i + 2}行：未找到或年份为空`)
        continue
      }

      // Transform data
      const city: CityInput = {
        city_name: cityName,
        year: year,
        base_min: baseMin,
        base_max: baseMax,
        rate: rate
      }

      // Validate numeric values
      if (isNaN(city.base_min) || city.base_min < 0) {
        errors.push(`第${i + 2}行：社保基数下限必须是正数`)
        continue
      }

      if (isNaN(city.base_max) || city.base_max < 0) {
        errors.push(`第${i + 2}行：社保基数上限必须是正数`)
        continue
      }

      if (city.base_max < city.base_min) {
        errors.push(`第${i + 2}行：社保基数上限不能小于下限`)
        continue
      }

      if (isNaN(city.rate) || city.rate < 0 || city.rate > 1) {
        errors.push(`第${i + 2}行：缴纳比例必须在0到1之间`)
        continue
      }

      cities.push(city)
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

    if (cities.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: '没有有效的数据可以导入'
        },
        { status: 400 }
      )
    }

    // Insert data into database
    const insertedCities = await insertCities(cities)

    return NextResponse.json({
      success: true,
      message: `成功导入${insertedCities.length}条城市数据`,
      data: insertedCities
    })

  } catch (error) {
    console.error('Upload cities error:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : '上传失败'
      },
      { status: 500 }
    )
  }
}