import { format, parseISO } from 'date-fns'
import { it } from 'date-fns/locale'

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

export const formatDate = (dateString: string): string => {
  try {
    const date = parseISO(dateString)
    return format(date, 'dd/MM/yyyy', { locale: it })
  } catch (error) {
    return dateString
  }
}

export const formatDateTime = (dateString: string): string => {
  try {
    const date = parseISO(dateString)
    return format(date, 'dd/MM/yyyy HH:mm', { locale: it })
  } catch (error) {
    return dateString
  }
}

export const formatDateForInput = (date: Date): string => {
  return format(date, 'yyyy-MM-dd')
}

export const getTodayString = (): string => {
  return formatDateForInput(new Date())
}

