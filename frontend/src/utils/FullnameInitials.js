export function getInitials(firstName, lastName) {
  const i1 = firstName ? firstName[0].toUpperCase() : "";
  const i2 = lastName ? lastName[0].toUpperCase() : "";

  const string = i1 + i2;
  return string;
}

export function getInitials2(fullName) {
  const names = fullName.split(" ");

  const initials = names.slice(0, 2).map((name) => name[0].toUpperCase());

  const initialsStr = initials.join("");

  return initialsStr;
}
