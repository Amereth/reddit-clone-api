export const sanitizeString = (str: string) =>
  str.replace(/(?!\.[^.]+$)\.|[^\w.]+/g, '')
