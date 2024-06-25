const { BadRequestError } = require("../expressError");

/**
 * Function to generate SQL query components for a partial update operation.
 *
 * @param {Object} dataToUpdate - An object containing key-value pairs representing the fields to be updated and their new values.
 * @param {Object} jsToSql - An object mapping JavaScript-style field names to SQL column names.
 *
 * @returns {Object} - An object containing:
 *   - setCols (String): A string representing the SQL update query's column assignments with parameter placeholders.
 *   - values (Array): An array of the values to be updated, corresponding to the parameter placeholders.
 *
 * @throws {BadRequestError} - If no data is provided in dataToUpdate.
 *
 * Example:
 * const dataToUpdate = { firstName: 'Aliya', age: 32 };
 * const jsToSql = { firstName: 'first_name', age: 'age' };
 * 
 * const result = sqlForPartialUpdate(dataToUpdate, jsToSql);
 * 
 * // result.setCols => '"first_name"=$1, "age"=$2'
 * // result.values => ['Aliya', 32]
 */
function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  // Get the keys from the dataToUpdate object
  const keys = Object.keys(dataToUpdate);
  
  // If no keys are present, throw an error indicating no data was provided
  if (keys.length === 0) throw new BadRequestError("No data");

  // Generate the column assignments for the SQL query
  // Map each key to its corresponding SQL column assignment string
  // If a mapping exists in jsToSql, use the mapped SQL column name
  // Otherwise, use the key as the column name
  // The placeholder is formatted as $<index>, starting from 1
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  // Return an object with the setCols string and the array of values
  return {
    setCols: cols.join(", "),  // Join the column assignments with a comma and space
    values: Object.values(dataToUpdate),  // Get the values from the dataToUpdate object
  };
}

module.exports = { sqlForPartialUpdate };
