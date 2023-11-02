import { WithId } from 'mongodb'

type SanitizedResponse<T> = T & {
  id: string
}

const sanitizer = <T>({ _id, ...data }: WithId<T>) => ({
  id: _id,
  ...data,
})

export function sanitizeResponse<T>(data: WithId<T>): SanitizedResponse<T>

export function sanitizeResponse<T>(data: WithId<T>[]): SanitizedResponse<T>[]

export function sanitizeResponse<T>(data: WithId<T> | WithId<T>[]) {
  if (Array.isArray(data)) return data.map(sanitizer)

  return sanitizer(data)
}
