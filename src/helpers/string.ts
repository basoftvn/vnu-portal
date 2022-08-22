export function replaceAt(
  original: string,
  index: number,
  replacement: string,
  deleteLength = -1,
): string {
  const leftPart = original.substring(0, index);
  const rightPart = original.substring(
    deleteLength === -1 ? index + replacement.length : index + deleteLength,
  );

  return leftPart + replacement + rightPart;
}
