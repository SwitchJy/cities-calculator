import { supabase, supabaseAdmin } from './supabase'
import { City, Salary, Result, CityInput, SalaryInput } from '@/types'

// Helper function to check if Supabase is configured
function checkSupabaseConfig() {
  if (!supabase || !supabaseAdmin) {
    throw new Error('Supabase is not configured. Please check your environment variables.')
  }
}

// Cities table operations
export async function insertCity(city: CityInput) {
  checkSupabaseConfig()
  const { data, error } = await supabaseAdmin!
    .from('cities')
    .insert(city)
    .select()
    .single()

  if (error) throw error
  return data as City
}

export async function insertCities(cities: CityInput[]) {
  checkSupabaseConfig()
  const { data, error } = await supabaseAdmin!
    .from('cities')
    .insert(cities)
    .select()

  if (error) throw error
  return data as City[]
}

export async function getCities() {
  checkSupabaseConfig()
  const { data, error } = await supabase!
    .from('cities')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as City[]
}

export async function getCityByName(cityName: string, year?: string) {
  checkSupabaseConfig()
  let query = supabaseAdmin!
    .from('cities')
    .select('*')
    .eq('city_name', cityName)

  if (year) {
    query = query.eq('year', year)
  }

  const { data, error } = await query.order('year', { ascending: false }).limit(1)

  if (error) throw error
  return data?.[0] as City
}

// Salaries table operations
export async function insertSalary(salary: SalaryInput) {
  checkSupabaseConfig()
  const { data, error } = await supabaseAdmin!
    .from('salaries')
    .insert(salary)
    .select()
    .single()

  if (error) throw error
  return data as Salary
}

export async function insertSalaries(salaries: SalaryInput[]) {
  checkSupabaseConfig()
  const { data, error } = await supabaseAdmin!
    .from('salaries')
    .insert(salaries)
    .select()

  if (error) throw error
  return data as Salary[]
}

export async function getSalaries() {
  checkSupabaseConfig()
  const { data, error } = await supabaseAdmin!
    .from('salaries')
    .select('*')
    .order('employee_name, month')

  if (error) throw error
  return data as Salary[]
}

export async function getSalariesByEmployee(employeeName: string) {
  checkSupabaseConfig()
  const { data, error } = await supabase!
    .from('salaries')
    .select('*')
    .eq('employee_name', employeeName)
    .order('month')

  if (error) throw error
  return data as Salary[]
}

// Results table operations
export async function clearResults() {
  checkSupabaseConfig()
  const { error } = await supabaseAdmin!
    .from('results')
    .delete()
    .neq('id', 0) // Delete all rows

  if (error) throw error
}

export async function insertResult(result: Omit<Result, 'id' | 'created_at'>) {
  checkSupabaseConfig()
  const { data, error } = await supabaseAdmin!
    .from('results')
    .insert(result)
    .select()
    .single()

  if (error) throw error
  return data as Result
}

export async function getResults() {
  checkSupabaseConfig()
  const { data, error } = await supabase!
    .from('results')
    .select('*')
    .order('employee_name')

  if (error) throw error
  return data as Result[]
}