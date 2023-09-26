const { BadRequestError } = require("../expressError");

/** Prepares partial user data for use in sql query `dataToUpdate` and `jsToSql`.
 *
 *  This is a "partial update" --- it's fine if data doesn't contain
 *  all the fields; this only changes provided ones.
 *
 *  Data can include:
 *   { firstName, lastName, password, email, isAdmin } 
 * 
 *  jsToSql:
 *   { firstName: 'first_name', lastName: 'last_name', isAdmin: 'is_admin'}
 * 
 *  Returns:
 *   {
 *      setCols: ['"first_name"=$1', '"age"=$2'],
 *      values: [value1, value2, ...,]
 *   }
 *  */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  try {
		const keys = Object.keys(dataToUpdate);

		if (keys.length === 0) throw new BadRequestError('No data');

		// {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
		const cols = keys.map((colName, idx) => `"${jsToSql[colName] || colName}"=$${idx + 1}`);

		return {
			setCols: cols.join(', '),
			values: Object.values(dataToUpdate),
		};
  } catch (err) {
		throw new BadRequestError('No data');
  }
}

module.exports = { sqlForPartialUpdate };
