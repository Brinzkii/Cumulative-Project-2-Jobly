'use strict';

/** Routes for jobs. */

const jsonschema = require('jsonschema');
const express = require('express');

const { BadRequestError } = require('../expressError');
const { ensureLoggedIn, ensureAdmin } = require('../middleware/auth');
const Job = require('../models/job');

const jobNewSchema = require('../schemas/jobNew.json');
const jobUpdateSchema = require('../schemas/jobUpdate.json');

const router = new express.Router();

/** POST / { job } =>  { job }
 *
 * company should be { title, salary, equity, companyHandle }
 *
 * Returns { title, salary, equity, company }
 *  where company is { handle, name, description, numEmployees, logoUrl }
 *
 * Authorization required: admin
 */

router.post('/', ensureAdmin, async function (req, res, next) {
	try {
		const validator = jsonschema.validate(req.body, jobNewSchema);
		if (!validator.valid) {
			const errs = validator.errors.map((e) => e.stack);
			throw new BadRequestError(errs);
		}

		const job = await Job.create(req.body);
		return res.status(201).json({ job });
	} catch (err) {
		return next(err);
	}
});

/** GET /  =>
 *   { jobs: [{ title, salary, equity, company: { handle, name,
 * description, numEmployees, logoUrl }}, ...] }
 *
 * Can filter on provided search filters:
 * - title (will find case-insensitive, partial matches)
 * - minSalary
 * - hasEquity
 *
 * Authorization required: none
 */

router.get('/', async function (req, res, next) {
	try {
		const { title, minSalary, hasEquity } = req.query;

		if (!title && !minSalary && !hasEquity) {
			const jobs = await Job.findAll();
			return res.json({ jobs });
		} else {
			const jobs = await Job.filter(title, minSalary, hasEquity);
			return res.json({ jobs });
		}
	} catch (err) {
		return next(err);
	}
});

/** GET /:id  =>  { job }
 *
 *  Job is { title, salary, equity, company }
 *
 * Authorization required: none
 */

router.get('/:id', async function (req, res, next) {
	try {
		const job = await Job.get(req.params.id);
		return res.json({ job });
	} catch (err) {
		return next(err);
	}
});

/** PATCH /[id] { fld1, fld2, ... } => { job }
 *
 * Patches job data.
 *
 * fields can be: { title, salary, equity }
 *
 * Returns { id, title, salary, equity, company }
 *
 * Authorization required: admin
 */

router.patch('/:id', ensureLoggedIn, ensureAdmin, async function (req, res, next) {
	try {
		const validator = jsonschema.validate(req.body, jobUpdateSchema);
		if (!validator.valid) {
			const errs = validator.errors.map((e) => e.stack);
			throw new BadRequestError(errs);
		}
		console.log(req.body);
		const job = await Job.update(req.params.id, req.body);
		return res.json({ job });
	} catch (err) {
		return next(err);
	}
});

/** DELETE /[id]  =>  { deleted: "id"(id) - title }
 *
 * Authorization: admin
 */

router.delete('/:id', ensureLoggedIn, ensureAdmin, async function (req, res, next) {
	try {
		const job = await Job.remove(req.params.id);
		console.log(job);
		return res.json({ deleted: `id(${job.id}) - ${job.title}` });
	} catch (err) {
		return next(err);
	}
});

module.exports = router;
