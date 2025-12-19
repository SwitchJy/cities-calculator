import { NextRequest, NextResponse } from 'next/server'
import { calculateContributions } from '@/lib/calculator'

export async function POST(request: NextRequest) {
  try {
    // Get optional parameters from request body
    const body = await request.json().catch(() => ({}))
    const { cityName = '佛山', year } = body

    // Perform calculation
    const result = await calculateContributions({ cityName, year })

    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(
        {
          success: false,
          message: result.message
        },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Calculate error:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : '计算失败'
      },
      { status: 500 }
    )
  }
}