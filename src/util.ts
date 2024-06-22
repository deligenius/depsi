/**
 * Retrieves the parameter types from the JSDoc comment right before the constructor
 * @returns {string[]} The parameter types
 */
export function getParamsFromJsDoc(target: any) {
  // Extract the class definition as a string
  const classString = target.toString();

  // Match the JSDoc comment right before the constructor
  const jsDocMatch = classString.match(/\/\*\*([\s\S]*?)\*\/\s+constructor/);
  if (!jsDocMatch) return [];

  // Define the regex to match @param tags within the JSDoc comment
  const paramRegex = /@param\s+\{(\w+)\}\s+(\w+)/g;
  const paramTags = jsDocMatch[1].match(paramRegex);
  if (!paramTags) return [];

  // Extract the types from the @param tags
  const paramTypes = [];
  let match;
  while ((match = paramRegex.exec(jsDocMatch[1])) !== null) {
    paramTypes.push(match[1]);
  }
  return paramTypes; //e.g.: ['Logger', 'Database']
}
