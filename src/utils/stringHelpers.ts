export function titleCase(str: string) {
  return str
    .split(" ")
    .map((t) => t.charAt(0).toUpperCase() + t.substring(1))
    .join(" ");
}
