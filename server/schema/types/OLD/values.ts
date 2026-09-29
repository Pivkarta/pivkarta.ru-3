/** MySQL возвращает DECIMAL строкой. Некорректные значения не становятся нулём. */
export function nullableNumber(value: string | number | null): number | null {
  if (value === null || value === undefined || value === '') {
    return null
  }
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

/** В старой базе JSON хранится в текстовых полях, иногда пустых или повреждённых. */
export function legacyJson(value: unknown): unknown {
  if (typeof value !== 'string') {
    return value ?? null
  }
  try {
    return JSON.parse(value) as unknown
  } catch {
    return null
  }
}
