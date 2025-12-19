'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function UploadPage() {
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const [calculating, setCalculating] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')
  const [citiesFile, setCitiesFile] = useState<File | null>(null)
  const [salariesFile, setSalariesFile] = useState<File | null>(null)
  const [selectedCity, setSelectedCity] = useState('')
  const [availableCities, setAvailableCities] = useState<string[]>([])

  const showMessage = (msg: string, type: 'success' | 'error') => {
    setMessage(msg)
    setMessageType(type)
    setTimeout(() => {
      setMessage('')
      setMessageType('')
    }, 5000)
  }

  const handleCitiesFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setCitiesFile(file || null)
  }

  const handleSalariesFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setSalariesFile(file || null)
  }

  // 获取可用的城市列表
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch('/api/cities')
        if (response.ok) {
          const data = await response.json()
          console.log('获取到的城市数据:', data)
          const uniqueCities = [...new Set(data.map((city: any) => city.city_name).filter(Boolean))] as string[]
          console.log('处理后的城市列表:', uniqueCities)
          setAvailableCities(uniqueCities)
          // 如果有城市数据，默认选择第一个
          if (uniqueCities.length > 0) {
            setSelectedCity(uniqueCities[0])
          }
        } else {
          console.error('获取城市数据失败:', response.status)
        }
      } catch (error) {
        console.error('Failed to fetch cities:', error)
      }
    }
    fetchCities()
  }, [])

  const handleUpload = async () => {
    if (!citiesFile && !salariesFile) {
      showMessage('请先选择要上传的文件', 'error')
      return
    }

    setUploading(true)
    setMessage('')

    try {
      const uploadPromises = []

      if (citiesFile) {
        const formData = new FormData()
        formData.append('file', citiesFile)
        uploadPromises.push(
          fetch('/api/upload/cities', {
            method: 'POST',
            body: formData
          }).then(res => res.json()).then(result => ({ type: '城市数据', result }))
        )
      }

      if (salariesFile) {
        const formData = new FormData()
        formData.append('file', salariesFile)
        uploadPromises.push(
          fetch('/api/upload/salaries', {
            method: 'POST',
            body: formData
          }).then(res => res.json()).then(result => ({ type: '工资数据', result }))
        )
      }

      const results = await Promise.all(uploadPromises)

      let successCount = 0
      let errorCount = 0
      let totalRecords = 0

      for (const { type, result } of results) {
        if (result.success) {
          successCount++
          totalRecords += result.data.length
        } else {
          errorCount++
          showMessage(`${type}上传失败：${result.message || '未知错误'}`, 'error')
        }
      }

      if (successCount > 0) {
        showMessage(`成功上传${successCount}个文件，共${totalRecords}条记录`, 'success')
        // Clear file inputs and state
        setCitiesFile(null)
        setSalariesFile(null)
        const citiesInput = document.getElementById('cities-file-input') as HTMLInputElement
        const salariesInput = document.getElementById('salaries-file-input') as HTMLInputElement
        if (citiesInput) citiesInput.value = ''
        if (salariesInput) salariesInput.value = ''
      }

      if (errorCount > 0 && successCount === 0) {
        // All uploads failed
        setUploading(false)
        return
      }
    } catch (error) {
      showMessage('上传失败，请重试', 'error')
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
    }
  }

  
  const handleCalculate = async () => {
    setCalculating(true)
    setMessage('')

    try {
      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cityName: selectedCity  // 使用选中的城市
        })
      })

      const result = await response.json()

      if (result.success) {
        // 先显示成功消息
        showMessage(`计算完成！成功计算${result.data.length}名员工的社保费用`, 'success')
        // 然后跳转到结果页面
        setTimeout(() => {
          router.push('/results')
        }, 1500) // 1.5秒后跳转，让用户看到成功消息
      } else {
        showMessage(result.message || '计算失败', 'error')
      }
    } catch (error) {
      showMessage('计算失败，请重试', 'error')
      console.error('Calculate error:', error)
    } finally {
      setCalculating(false)
    }
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-blue-600 hover:text-blue-500">
            ← 返回首页
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">数据管理</h1>
          <div className="w-16"></div> {/* 占位符保持标题居中 */}
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div className="flex-shrink-0 px-4 sm:px-6 lg:px-8">
          <div className={`max-w-7xl mx-auto p-3 rounded-lg ${
            messageType === 'success'
              ? 'bg-green-100 text-green-800 border border-green-200'
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {message}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 px-4 sm:px-6 lg:px-8 pb-4 overflow-hidden">
        <div className="max-w-4xl mx-auto h-full flex flex-col gap-4">
          {/* Excel数据上传 */}
          <div className="bg-white rounded-lg shadow-md p-6 flex-1 flex flex-col">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Excel数据上传
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
              {/* 城市社保标准上传 */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <input
                  id="cities-file-input"
                  type="file"
                  className="hidden"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleCitiesFileSelect}
                  disabled={uploading}
                />
                <label htmlFor="cities-file-input" className="cursor-pointer">
                  <svg className="mx-auto h-8 w-8 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <h3 className="text-sm font-medium text-gray-900 mb-1">城市社保标准</h3>
                  <p className="text-xs text-gray-500 mb-2">
                    {citiesFile ? citiesFile.name : '点击选择城市标准文件'}
                  </p>
                  <div className="text-xs text-gray-400">
                    city_name, year, base_min, base_max, rate
                  </div>
                </label>
              </div>

              {/* 员工工资数据上传 */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <input
                  id="salaries-file-input"
                  type="file"
                  className="hidden"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleSalariesFileSelect}
                  disabled={uploading}
                />
                <label htmlFor="salaries-file-input" className="cursor-pointer">
                  <svg className="mx-auto h-8 w-8 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <h3 className="text-sm font-medium text-gray-900 mb-1">员工工资数据</h3>
                  <p className="text-xs text-gray-500 mb-2">
                    {salariesFile ? salariesFile.name : '点击选择工资数据文件'}
                  </p>
                  <div className="text-xs text-gray-400">
                    employee_id, employee_name, month, salary_amount
                  </div>
                </label>
              </div>
            </div>

            {/* 上传按钮 */}
            <div className="mt-4 flex justify-center">
              <button
                onClick={handleUpload}
                disabled={uploading || (!citiesFile && !salariesFile)}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? '上传中...' : '上传'}
              </button>
            </div>
          </div>

          {/* 执行计算 */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  执行计算
                </h2>
                <div className="flex flex-col gap-2">
                  <div>
                    <label className="text-sm font-medium text-gray-700">选择城市：</label>
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="mt-1 block w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
                      disabled={calculating}
                    >
                      {availableCities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="text-sm text-gray-600">
                    将根据{selectedCity}市的社保标准计算员工社保费用
                  </p>
                </div>
              </div>
              <button
                onClick={handleCalculate}
                disabled={calculating}
                className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {calculating ? '计算中...' : '执行计算并存储结果'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}