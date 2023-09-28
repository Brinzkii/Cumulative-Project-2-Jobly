'use strict';

const db = require('../db.js');
const { BadRequestError, NotFoundError } = require('../expressError');
const Job = require('./job');
const { commonBeforeAll, commonBeforeEach, commonAfterEach, commonAfterAll } = require('./_testCommon.js');

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe('create', function () {
	const newJob = {
		title: 'new job',
		salary: 15000,
		equity: '0.25',
		companyHandle: 'c3',
	};

	test('works', async function () {
		let job = await Job.create(newJob);
		newJob.id = job.id;
		newJob.company = newJob.companyHandle;
		delete newJob.companyHandle;
		expect(job).toEqual(newJob);

		const result = await db.query(
			`SELECT id, title, salary, equity, company_handle AS "company"
           FROM jobs
           WHERE title = 'new job'`
		);
		expect(result.rows).toEqual([
			{
				id: expect.any(Number),
				title: 'new job',
				salary: 15000,
				equity: '0.25',
				company: 'c3',
			},
		]);
	});
});

/************************************** findAll */

describe('findAll', function () {
	test('works: no filter', async function () {
		let jobs = await Job.findAll();
		expect(jobs).toEqual([
			{
				id: expect.any(Number),
				title: 'j1',
				salary: 5000,
				equity: '0',
				company: 'c1',
			},
			{
				id: expect.any(Number),
				title: 'j2',
				salary: 10000,
				equity: '0.15',
				company: 'c2',
			},
			{
				id: expect.any(Number),
				title: 'j3',
				salary: 20000,
				equity: '0.30',
				company: 'c2',
			},
		]);
	});
});

/************************************** get */

describe('get', function () {
	test('works', async function () {
		let search = await Job.findAll();
		let jobFound = search[0];
		let job = await Job.get(jobFound.id);
		expect(job).toEqual({
			id: expect.any(Number),
			title: expect.any(String),
			salary: expect.any(Number),
			equity: expect.any(String),
			company: expect.any(String),
		});
	});

	test('not found if no such job', async function () {
		try {
			await Job.get(0);
			fail();
		} catch (err) {
			expect(err instanceof NotFoundError).toBeTruthy();
		}
	});
});

/************************************** filter */

describe('filter', function () {
	test('works', async function () {
		let jobs = await Job.filter('', 5000, 'true');
		expect(jobs).toEqual([
			{
				id: expect.any(Number),
				title: 'j2',
				salary: 10000,
				equity: '0.15',
				company: 'c2',
			},
			{
				id: expect.any(Number),
				title: 'j3',
				salary: 20000,
				equity: '0.30',
				company: 'c2',
			},
		]);
	});

	test('bad request if no data', async function () {
		try {
			let res = await Job.filter();
		} catch (err) {
			expect(err.message).toEqual('Must use at least one filter: title, minSalary, hasEquity');
			expect(err.status).toEqual(400);
		}
	});
});

/************************************** update */

describe('update', function () {
	const updateData = {
		title: 'New Job Title',
		salary: 100000,
		equity: '0.9',
	};

	test('works', async function () {
		let jobRes = await Job.findAll();
		let updateJob = jobRes[0];
		let job = await Job.update(updateJob.id, updateData);
		expect(job).toEqual({
			id: updateJob.id,
			title: 'New Job Title',
			salary: 100000,
			equity: '0.9',
			company: updateJob.company,
		});

		const result = await db.query(
			`SELECT title, salary, equity
           FROM jobs
           WHERE id = ${updateJob.id}`
		);
		expect(result.rows).toEqual([updateData]);
	});

	test('works: null fields', async function () {
		const updateDataSetNulls = {
			title: 'New Job',
			salary: 10000,
			equity: null,
		};
		let jobRes = await Job.findAll();
		let updateJob = jobRes[0];

		let job = await Job.update(updateJob.id, updateDataSetNulls);
		expect(job).toEqual({
			id: expect.any(Number),
			title: 'New Job',
			salary: 10000,
			equity: null,
			company: updateJob.company,
		});

		const result = await db.query(
			`SELECT title, salary, equity
           FROM jobs
           WHERE id = ${updateJob.id}`
		);
		expect(result.rows).toEqual([
			{
				title: 'New Job',
				salary: 10000,
				equity: null,
			},
		]);
	});

	test('not found if no such job', async function () {
		try {
			await Job.update(0, updateData);
			fail();
		} catch (err) {
			expect(err instanceof NotFoundError).toBeTruthy();
		}
	});

	test('bad request with no data', async function () {
		try {
			let jobRes = await Job.findAll();
			let updateJob = jobRes[0];

			await Job.update(updateJob.id, {});
			fail();
		} catch (err) {
			expect(err instanceof BadRequestError).toBeTruthy();
		}
	});
});

/************************************** remove */

describe('remove', function () {
	test('works', async function () {
		let jobRes = await Job.findAll();
		let removeJob = jobRes[0];

		await Job.remove(removeJob.id);
		const res = await db.query(`SELECT title FROM jobs WHERE id=${removeJob.id}`);
		expect(res.rows.length).toEqual(0);
	});

	test('not found if no such company', async function () {
		try {
			await Job.remove(0);
			fail();
		} catch (err) {
			expect(err instanceof NotFoundError).toBeTruthy();
		}
	});
});
