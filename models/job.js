'use strict';

const db = require('../db');
const { BadRequestError, NotFoundError } = require('../expressError');
const { sqlForPartialUpdate, sqlForJobPartialFilter } = require('../helpers/sql');

/** Related functions for jobs */

class Job {
	/** Create a job (from data), update db, return new job
	 *  data.
	 *
	 * data should be { title, salary, equity, companyHandle }
	 *
	 * Returns { title, salary, equity, company }
	 *   where company is { handle, name,
	 *   description, numEmployees, logoUrl }
	 * */

	static async create(data) {
		const { title, salary, equity, companyHandle } = data;
		const querySql = `INSERT INTO jobs
		(title, salary, equity, company_handle)
		VALUES ($1, $2, $3, $4)
		RETURNING id, title, salary, equity, company_handle AS "company"`;
		const result = await db.query(querySql, [title, salary, equity, companyHandle]);
		const job = result.rows[0];

		return job;
	}

	/** Find all jobs.
	 *
	 * Returns [{ title, salary, equity, company: { handle, name,
	 * description, numEmployees, logoUrl }}, ...]
	 * */

	static async findAll() {
		const jobsRes = await db.query(
			`SELECT id, title, salary, equity, company_handle AS "company"
           FROM jobs
           ORDER BY title`
		);
		return jobsRes.rows;
	}

	/** WORK IN PROGRESS
	 *
	 *  Find all jobs matching given criteria
	 *
	 *  Accepts any combination of title, minSalary and hasEquity
	 *
	 *  Returns [{ title, salary, equity, company: { handle, name,
	 *  description, numEmployees, logoUrl }}, ...]
	 */

	static async filter(data) {
		const { filterCols, values } = sqlForJobPartialFilter(data);
		const querySql = `SELECT id, title, salary, equity, company_handle AS "company"
        FROM jobs
		WHERE ${filterCols}
		ORDER BY title`;

		const result = await db.query(querySql, [...values]);
		return result.rows;
	}

	/** Given a job id, return data about job.
	 *
	 * Returns { title, salary, equity, company }
	 *   where company is { handle, name,
	 *   description, numEmployees, logoUrl }
	 *
	 * Throws NotFoundError if not found.
	 **/

	static async get(id) {
		const jobRes = await db.query(
			`SELECT id, title, salary, equity, company_handle AS "company"
            FROM jobs
           WHERE id = $1`,
			[id]
		);

		const job = jobRes.rows[0];

		if (!job) throw new NotFoundError(`No job: ${id}`);

		const companyRes = await db.query(
			`
		SELECT handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl" 
		FROM companies
		WHERE handle = $1`,
			[job.company]
		);

		job.company = companyRes.rows[0];

		return job;
	}

	/** Update job data with `data`.
	 *
	 * This is a "partial update" --- it's fine if data doesn't contain all the
	 * fields; this only changes provided ones.
	 *
	 * Data can include: {title, salary, equity, companyHandle}
	 *
	 * Returns {title, salary, equity, company}
	 *   where company is { handle, name,
	 *   description, numEmployees, logoUrl }
	 *
	 * Throws NotFoundError if not found.
	 */

	static async update(id, data) {
		const { setCols, values } = sqlForPartialUpdate(data, {});
		const handleVarIdx = '$' + (values.length + 1);

		const querySql = `UPDATE jobs 
                      SET ${setCols} 
                      WHERE id = ${handleVarIdx} 
                      RETURNING id, title, salary, equity, company_handle AS "company"`;
		const result = await db.query(querySql, [...values, id]);
		const job = result.rows[0];

		if (!job) throw new NotFoundError(`No job: ${id}`);

		return job;
	}

	/** Delete given job from database; returns undefined.
	 *
	 * Throws NotFoundError if job not found.
	 **/

	static async remove(id) {
		const result = await db.query(
			`DELETE
           FROM jobs
           WHERE id = $1
           RETURNING id, title`,
			[id]
		);
		const job = result.rows[0];

		if (!job) throw new NotFoundError(`No job: ${id}`);

		return job;
	}
}

module.exports = Job;
