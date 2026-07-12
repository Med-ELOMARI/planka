
const COLORS = [
  '#2ecc71',
  '#3498db',
  '#8e44ad',
  '#e67e22',
  '#e74c3c',
  '#1abc9c',
  '#2c3e50',
];

export const getColorFromFirstLetter = (str) => {
  if (!str || str.length === 0) {
    return COLORS[0];
  }

  return COLORS[str.charCodeAt(0) % COLORS.length];
};
