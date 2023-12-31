const { sqlForPartialUpdate, sqlForCompanyPartialFilter, sqlForJobPartialFilter } = require('./sql');

describe('prepare partial data for sql query update', function () {
	test('works', function () {
		const data = {
			firstName: 'Test',
			lastName: 'User',
			email: '123@gmail.com',
		};
		const jsToSql = {
			firstName: 'first_name',
			lastName: 'last_name',
			isAdmin: 'is_admin',
		};
		const result = sqlForPartialUpdate(data, jsToSql);

		expect(result.setCols).toBe('"first_name"=$1, "last_name"=$2, "email"=$3');
		expect(result.values).toEqual(['Test', 'User', '123@gmail.com']);
	});

	test('fails - no data', function () {
		const data = null;
		const jsToSql = {
			firstName: 'first_name',
			lastName: 'last_name',
			isAdmin: 'is_admin',
		};

		try {
			const result = sqlForPartialUpdate(data, jsToSql);
		} catch (err) {
			console.log(err);
			expect(err.message).toEqual('No data');
			expect(err.status).toEqual(400);
		}
	});
});

describe('prepare partial data for sql query filtering companies', function () {
	test('works - filter by name only', function () {
		const data = {
			nameLike: 'c',
		};
		const result = sqlForCompanyPartialFilter(data);
		expect(result.filterCols).toEqual('name ILIKE $1');
		expect(result.values).toEqual(['%c%']);
	});

	test('works - filter by min employees only', function () {
		const data = {
			minEmployees: 5,
		};
		const result = sqlForCompanyPartialFilter(data);
		expect(result.filterCols).toEqual('num_employees>=$1');
		expect(result.values).toEqual([5]);
	});

	test('works - filter by max employees only', function () {
		const data = {
			maxEmployees: 500,
		};
		const result = sqlForCompanyPartialFilter(data);
		expect(result.filterCols).toEqual('num_employees<=$1');
		expect(result.values).toEqual([500]);
	});

	test('works - filter using all three methods', function () {
		const data = {
			minEmployees: 5,
			maxEmployees: 500,
			nameLike: 'c',
		};
		const result = sqlForCompanyPartialFilter(data);
		expect(result.filterCols).toEqual('num_employees>=$1 AND num_employees<=$2 AND name ILIKE $3');
		expect(result.values).toEqual([5, 500, '%c%']);
	});

	test('fails - no data', function () {
		try {
			const data = {};
			const result = sqlForCompanyPartialFilter(data);
		} catch (err) {
			expect(err.status).toEqual(400);
			expect(err.message).toEqual('Must use at least one filter: minEmployees, maxEmployees, nameLike');
		}
	});

	test('fails - incorrect filter method given', function () {
		try {
			const data = {
				random: 'rand',
			};
			const result = sqlForCompanyPartialFilter(data);
		} catch (err) {
			expect(err.status).toEqual(400);
			expect(err.message).toEqual('Filter does not match allowed methods: minEmployees, maxEmployees, nameLike');
		}
	});
});

describe('prepare partial data for sql query filtering jobs', function () {
	test('works - filter by title only', function () {
		const data = {
			title: 'j',
		};
		const result = sqlForJobPartialFilter(data);
		expect(result.filterCols).toEqual('title ILIKE $1');
		expect(result.values).toEqual(['%j%']);
	});

	test('works - filter by min salary only', function () {
		const data = {
			minSalary: 5000,
		};
		const result = sqlForJobPartialFilter(data);
		expect(result.filterCols).toEqual('salary>=$1');
		expect(result.values).toEqual([5000]);
	});

	test('works - filter by has equity only', function () {
		const data = {
			hasEquity: 'true',
		};
		const result = sqlForJobPartialFilter(data);
		expect(result.filterCols).toEqual('equity > 0');
		expect(result.values).toEqual([]);
	});

	test('works - filter using all three methods', function () {
		const data = {
			title: 'j',
			minSalary: 5000,
			hasEquity: 'true',
		};
		const result = sqlForJobPartialFilter(data);
		expect(result.filterCols).toEqual('title ILIKE $1 AND salary>=$2 AND equity > 0');
		expect(result.values).toEqual(['%j%', 5000]);
	});

	test('fails - no data', function () {
		try {
			const data = {};
			const result = sqlForJobPartialFilter(data);
		} catch (err) {
			expect(err.status).toEqual(400);
			expect(err.message).toEqual('Must use at least one filter: title, minSalary, hasEquity');
		}
	});

	test('fails - incorrect filter method given', function () {
		try {
			const data = {
				random: 'rand',
			};
			const result = sqlForJobPartialFilter(data);
		} catch (err) {
			expect(err.status).toEqual(400);
			expect(err.message).toEqual('Filter does not match allowed methods: title, minSalary, hasEquity');
		}
	});
});
