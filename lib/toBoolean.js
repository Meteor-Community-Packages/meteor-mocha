export function toBoolean(val) {
  try {
    return JSON.parse(val.toLowerCase())
  } catch (e) {
    return false;
  }
}
