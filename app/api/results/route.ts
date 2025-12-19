import { NextRequest, NextResponse } from 'next/server'
import { getResults } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const results = await getResults()

    return NextResponse.json({
      success: true,
      message: `获取到${results.length}条结果`,
      data: results
    })
  } catch (error) {
    console.error('Get results error:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : '获取结果失败'
      },
      { status: 500 }
    )
  }
}