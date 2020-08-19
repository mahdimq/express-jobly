const db = require('../db')
const sqlForPartialUpdate = require('../helpers/partialUpdate')
const ExpressError = require('../helpers/expressError')

class Company {
	static async findAll(data) {
		let { search = '', min_employees = 0, max_employees = 9999999 } = data
		if (min_employees > max_employees)
			throw new ExpressError('MIN employees should be less than MAX employees', 400)

		const result = await db.query(
			`SELECT handle, name
		   FROM companies
		   WHERE name ILIKE $1
		   AND num_employees BETWEEN $2 AND $3
		   ORDER BY name`,
			[`%${search}%`, min_employees, max_employees]
		)

		if (!result.rows) throw new ExpressError('Match not found', 400)
		return result.rows
	}

	// static async findBySearch(data) {
	// 	let { search } = data
	// 	const result = await db.query(
	// 		`SELECT name, handle
	//      FROM companies
	//      WHERE search=$1`,
	// 		[`%${search}%`]
	// 	)
	// 	return result.rows
	// }

	// static async findByMin(data) {
	// 	const result = await db.query(
	// 		`SELECT handle, name, num_employees
	//      FROM companies
	//      WHERE num_employees > $1`,
	// 		[data]
	// 	)
	// 	if (result.rows.length === 0) {
	// 		throw { message: `There is no company with minimum employees '${data}`, status: 404 }
	// 	}
	// }

	// static async findByMax(data) {
	// 	const result = await db.query(
	// 		`SELECT handle, name, num_employees
	//      FROM companies
	//      WHERE num_employees < $1`,
	// 		[data]
	// 	)
	// 	if (result.rows.length === 0) {
	// 		throw { message: `There is no company with maximum employees '${data}`, status: 404 }
	// 	}
	// }

	// static async findByMinMax(min, max) {
	// 	if (min > max) throw new ExpressError(`MIN employees should be less than MAX employees`, 400)
	// 	const result = await db.query(
	// 		`SELECT handle, name, num_employees
	//      FROM companies
	//      WHERE num_employees
	//      BETWEEN $1 AND $2`,
	// 		[min, max]
	// 	)
	// 	if (result.rows.length === 0) {
	// 		throw {
	// 			message: `No companies found with Min-Employees: ${min}, Max-Employees: ${max}`,
	// 			status: 404
	// 		}
	// 	}
	// }

	static async findByHandle(handle) {
		const result = await db.query(
			`SELECT handle, name, num_employees, description, logo_url
       FROM companies
       WHERE handle = $1`,
			[handle]
		)

		if (result.rows.length === 0)
			throw new ExpressError(`There is no company with a handle '${handle}`, 404)

		return result.rows[0]
	}

	static async create(data) {
		const result = await db.query(
			`INSERT INTO companies (handle, name, num_employees, description, logo_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING handle, name, num_employees, description, logo_url`,
			[data.handle, data.name, data.num_employees, data.description, data.logo_url]
		)

		return result.rows[0]
	}

	// static async update(handle, data) {
	// 	const result = await db.query(
	// 		`UPDATE companies
	//      SET name=$1, num_employees=$2, description=$3, logo_url=$4
	//      WHERE handle=$5
	//      RETURNING handle, name, num_employees, description, logo_url`,
	// 		[data.name, data.num_employees, data.description, data.logo_url, handle]
	// 	)

	// 	if (result.rows.length === 0) {
	// 		throw new ExpressError(`There is no company with a handle '${handle}`, 404)
	// 	}

	// 	return result.rows[0]
	// }

	static async update(handle, data) {
		let { query, values } = sqlForPartialUpdate('companies', data, 'handle', handle)

		const result = await db.query(query, values)
		const company = result.rows[0]

		if (!company) {
			throw new ExpressError(`There exists no company '${handle}`, 404)
		}

		return company
	}

	static async delete(handle) {
		const result = await db.query(
			`DELETE FROM companies
       WHERE handle=$1
       RETURNING handle`,
			[handle]
		)

		if (result.rows.length === 0) {
			throw new ExpressError(`There is no company with a handle '${handle}`, 404)
		}
	}
}

module.exports = Company
