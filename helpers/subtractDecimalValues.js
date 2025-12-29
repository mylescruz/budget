export default function subtractDecimalValues(value1, value2) {
  return (parseFloat(value1) * 100 - parseFloat(value2) * 100) / 100;
}
