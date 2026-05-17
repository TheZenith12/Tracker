export function formatMNT(amount: number): string {
  return new Intl.NumberFormat('mn-MN', { style: 'currency', currency: 'MNT', maximumFractionDigits: 0 }).format(amount)
}

export function getMonthName(month: number): string {
  const names = ['1-р сар','2-р сар','3-р сар','4-р сар','5-р сар','6-р сар',
                  '7-р сар','8-р сар','9-р сар','10-р сар','11-р сар','12-р сар']
  return names[(month - 1) % 12] || `${month}-р сар`
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('mn-MN', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}
