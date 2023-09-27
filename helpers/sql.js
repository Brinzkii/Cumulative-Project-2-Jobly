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

/** Prepares partial user search criteria for use in sql query `dataToFilter`
 *
 * This is a "partial filter" --- it's fine if all the fields don't contain
 * data; this only filters for provided ones
 *
 * Data can include:
 * 	{ minEmployees, maxEmployees, nameLike}
 *
 * Returns:
 * 	{
 * 		filterCols: ['"num_employees">=$1', '"num_employees"<=$2', '"name
 * 			ILIKE" $3'],
 * 		values: [minEmployees, maxEmployees, ...,]
 * 	}
 */

function sqlForPartialFilter(dataToFilter) {
	const keys = Object.keys(dataToFilter);
	let cols = [];
	let counter = 1;

	keys.forEach((colName) => {
		if (colName === 'nameLike') {
			if (dataToFilter.nameLike) {
				dataToFilter.nameLike = '%' + dataToFilter.nameLike + '%';
				cols.push(`name ILIKE $${counter}`);
				counter++;
			} else {
				delete dataToFilter.nameLike;
			}
		} else if (colName === 'minEmployees') {
			if (dataToFilter.minEmployees) {
				cols.push(`num_employees>=$${counter}`);
				dataToFilter.minEmployees = Number(dataToFilter.minEmployees);
				counter++;
			} else {
				delete dataToFilter.minEmployees;
			}
		} else if (colName === 'maxEmployees') {
			if (dataToFilter.maxEmployees) {
				cols.push(`num_employees<=$${counter}`);
				dataToFilter.maxEmployees = Number(dataToFilter.maxEmployees);
				counter++;
			} else {
				delete dataToFilter.maxEmployees;
			}
		}
	});

	return {
		filterCols: cols.join(' AND '),
		values: Object.values(dataToFilter),
	};
}

module.exports = { sqlForPartialUpdate, sqlForPartialFilter };
