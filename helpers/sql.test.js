const { sqlForPartialUpdate } = require('./sql');

describe('update partial data fields', function () {
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
