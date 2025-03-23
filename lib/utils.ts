export function generateClassroomCode(): string {
  const prefix = 'CLS';
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');
  return `${prefix}-${year}-${random}`;
}
