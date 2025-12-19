import { NextResponse } from 'next/server'
import { getCities } from '@/lib/database'

export async function GET() {
  try {
    const cities = await getCities()
    return NextResponse.json(cities)
  } catch (error) {
    console.error('Failed to fetch cities:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : '获取城市列表失败'
      },
      { status: 500 }
    )
  }
}