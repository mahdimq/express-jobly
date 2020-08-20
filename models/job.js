const db = require('../db')
const sqlForPartialUpdate = require('../helpers/partialUpdate')
const ExpressError = require('../helpers/expressError')

class Job {
	static async findAll(search = '', min_salary = 0, min_equity = 1) {
		const result = await db.query(
			`SELECT *
			 FROM jobs
			 WHERE company_handle ILIKE $1
			 AND salary >= $2
			 AND equity >= $3
			 ORDER BY date_posted`,
			[`%${search}%`, min_salary, min_equity]
		)

		if (result.rows.length === 0) throw new expressError('Job not found', 404)
		return result.rows
	}

	static async findById(id) {
		const result = await db.query(
			`SELECT *
	      FROM jobs
	      WHERE id = $1`,
			[id]
		)

		if (result.rows.length === 0)
			throw new ExpressError(`There are no jobs with an id of '${id}'`, 404)

		return result.rows[0]
	}

	static async create(data) {
		const result = await db.query(
			`INSERT INTO jobs (title, salary, equity, company_handle)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
			[data.title, data.salary, data.equity, data.company_handle]
		)
		if (result.rows.length === 0) {
			throw new ExpressError("Couldn't add job", 400)
		}

		return result.rows[0]
	}

	static async update(id, data) {
		const result = await db.query(
			`UPDATE jobs
		   SET title=$1, salary=$2, equity=$3, company_handle=$4
		   WHERE id=$5
		   RETURNING *`,
			[data.title, data.salary, data.equity, data.company_handle]
		)

		if (result.rows.length === 0)
			throw new expressError(`There are no jobs with an id of '${id}'`, 404)

		// return result.rows[0]
		// let { query, values } = sqlForPartialUpdate('jobs', data, 'id', id)

		// const result = await db.query(query, values)

		// if (!result.rows[0]) {
		// 	throw new ExpressError(`There are no jobs with an id of '${id}'`, 404)
		// }

		return result.rows[0]
	}

	static async delete(id) {
		const result = await db.query(
			`DELETE FROM jobs
	     WHERE id=$1
	     RETURNING id`,
			[id]
		)

		if (result.rows.length === 0) {
			throw new ExpressError(`There are no jobs with an id of '${id}'`, 404)
		}
	}
}

module.exports = Job
