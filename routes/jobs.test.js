'use strict';

const request = require('supertest');

const db = require('../db');
const app = require('../app');
const Job = require('../models/job');

const {
	commonBeforeAll,
	commonBeforeEach,
	commonAfterEach,
	commonAfterAll,
	u1Token,
	u2Token,
} = require('./_testCommon');

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe('POST /jobs', function () {
	const newJob = {
		title: 'New Job',
		salary: 50000,
		equity: 0.015,
		companyHandle: 'c1',
	};

	test('ok for admin', async function () {
		const resp = await request(app).post('/jobs').send(newJob).set('authorization', `Bearer ${u1Token}`);
		expect(resp.statusCode).toEqual(201);
		expect(resp.body).toEqual({
			job: {
				id: expect.any(Number),
				title: 'New Job',
				salary: 50000,
				equity: '0.015',
				company: 'c1',
			},
		});
	});

	test('unauth request if not admin', async function () {
		const resp = await request(app).post('/jobs').send(newJob).set('authorization', `Bearer ${u2Token}`);
		expect(resp.statusCode).toEqual(401);
		expect(resp.body.error.message).toEqual('Must be admin to access');
	});

	test('bad request with missing data', async function () {
		const resp = await request(app)
			.post('/jobs')
			.send({
				title: 'new',
				salary: 10,
			})
			.set('authorization', `Bearer ${u1Token}`);
		expect(resp.statusCode).toEqual(400);
	});

	test('bad request with invalid data', async function () {
		const resp = await request(app)
			.post('/jobs')
			.send({
				title: 'New Job',
				salary: 50000,
				equity: '0.015',
				companyHandle: 'not-a-company',
			})
			.set('authorization', `Bearer ${u1Token}`);
		expect(resp.statusCode).toEqual(400);
	});
});

/************************************** GET /jobs */

describe('GET /jobs', function () {
	test('ok for anon', async function () {
		const resp = await request(app).get('/jobs');
		expect(resp.body).toEqual({
			jobs: [
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
					equity: '0.3',
					company: 'c2',
				},
			],
		});
	});

	test('fails: test next() handler', async function () {
		// there's no normal failure event which will cause this route to fail ---
		// thus making it hard to test that the error-handler works with it. This
		// should cause an error, all right :)
		await db.query('DROP TABLE jobs CASCADE');
		const resp = await request(app).get('/jobs').set('authorization', `Bearer ${u1Token}`);
		expect(resp.statusCode).toEqual(500);
	});
});

/************************************** GET /jobs/:id */

describe('GET /jobs/:id', function () {
	test('works for anon', async function () {
		const testJob = await Job.findAll();
		const job = testJob[0];
		const resp = await request(app).get(`/jobs/${job.id}`);
		expect(resp.body).toEqual({
			job: {
				id: expect.any(Number),
				title: job.title,
				salary: job.salary,
				equity: job.equity,
				company: expect.any(Object),
			},
		});
	});

	test('not found for no such job', async function () {
		const resp = await request(app).get(`/job/nope`);
		expect(resp.statusCode).toEqual(404);
	});
});

/************************************** PATCH /jobs/:id */

describe('PATCH /jobs/:id', function () {
	test('works for admin', async function () {
		const testJob = await Job.findAll();
		const job = testJob[0];
		const resp = await request(app)
			.patch(`/jobs/${job.id}`)
			.send({
				title: 'New Job',
			})
			.set('authorization', `Bearer ${u1Token}`);
		expect(resp.body).toEqual({
			job: {
				id: expect.any(Number),
				title: 'New Job',
				salary: job.salary,
				equity: job.equity,
				company: job.company,
			},
		});
	});

	test('unauth for non admin', async function () {
		const testJob = await Job.findAll();
		const job = testJob[0];
		const resp = await request(app)
			.patch(`/jobs/${job.id}`)
			.send({
				title: 'J1-new',
			})
			.set('authorization', `Bearer ${u2Token}`);
		expect(resp.statusCode).toEqual(401);
	});

	test('unauth for anon', async function () {
		const testJob = await Job.findAll();
		const job = testJob[0];
		const resp = await request(app).patch(`/jobs/${job.id}`).send({
			title: 'J1-new',
		});
		expect(resp.statusCode).toEqual(401);
	});

	test('not found on no such company', async function () {
		const resp = await request(app)
			.patch(`/jobs/0`)
			.send({
				title: 'new nope',
			})
			.set('authorization', `Bearer ${u1Token}`);
		expect(resp.statusCode).toEqual(404);
	});

	test('bad request on company change attempt', async function () {
		const testJob = await Job.findAll();
		const job = testJob[0];
		const resp = await request(app)
			.patch(`/jobs/${job.id}`)
			.send({
				companyHandle: 'c3',
			})
			.set('authorization', `Bearer ${u1Token}`);
		expect(resp.statusCode).toEqual(400);
	});

	test('bad request on invalid data', async function () {
		const testJob = await Job.findAll();
		const job = testJob[0];
		const resp = await request(app)
			.patch(`/jobs/c1`)
			.send({
				salary: 'not-a-salary',
			})
			.set('authorization', `Bearer ${u1Token}`);
		expect(resp.statusCode).toEqual(400);
	});
});

/************************************** DELETE /jobs/:id */

describe('DELETE /jobs/:id', function () {
	test('works for admin', async function () {
		const testJob = await Job.findAll();
		const job = testJob[0];
		const resp = await request(app).delete(`/jobs/${job.id}`).set('authorization', `Bearer ${u1Token}`);
		expect(resp.body).toEqual({ deleted: `id(${job.id}) - ${job.title}` });
	});

	test('unauth for non admin', async function () {
		const testJob = await Job.findAll();
		const job = testJob[0];
		const resp = await request(app).delete(`/jobs/${job.id}`).set('authorization', `Bearer ${u2Token}`);
		expect(resp.statusCode).toEqual(401);
	});

	test('unauth for anon', async function () {
		const testJob = await Job.findAll();
		const job = testJob[0];
		const resp = await request(app).delete(`/jobs/${job.id}`);
		expect(resp.statusCode).toEqual(401);
	});

	test('not found for no such company', async function () {
		const resp = await request(app).delete(`/jobs/0`).set('authorization', `Bearer ${u1Token}`);
		expect(resp.statusCode).toEqual(404);
	});
});
