export function getInitials(firstName, lastName) {
  const i1 = firstName[0].toUpperCase();
  const i2 = lastName[0].toUpperCase();

  const string = i1 + i2;
  return string;
}
