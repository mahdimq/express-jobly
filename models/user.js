const db = require('../db')
const sqlForPartialUpdate = require('../helpers/partialUpdate')
const ExpressError = require('../helpers/expressError')

class User {
	static async findAll() {
		const result = await db.query(
			`SELECT username, first_name, last_name, email
        FROM users
        ORDER BY username`
		)

		if (result.rows.length === 0) throw new ExpressError('User not found', 404)
		return result.rows
	}

	static async findByUsername(username) {
		const result = await db.query(
			`SELECT username, first_name, last_name, email, photo_url
		   FROM users
		   WHERE username = $1`,
			[username]
		)

		const user = result.rows[0]

		if (!user) throw new ExpressError(`There are no users with a username of '${username}'`, 404)

		// const companyInfo = await db.query(
		// 	`SELECT name, num_employees, description, logo_url
		//       FROM companies
		//       WHERE handle = $1`,
		// 	[user.company_handle]
		// )

		// user.company = companyInfo.rows[0]

		return user
	}

	static async create(data) {
		const result = await db.query(
			`INSERT INTO users (username, password, first_name, last_name, email, photo_url, is_admin)
	       VALUES ($1, $2, $3, $4, $5, $6, $7)
	       RETURNING *`,
			[
				data.username,
				data.password,
				data.first_name,
				data.last_name,
				data.email,
				data.photo_url,
				data.is_admin
			]
		)
		if (result.rows.length === 0) {
			throw new ExpressError('User could not be added', 400)
		}

		return result.rows[0]
	}

	static async update(username, data) {
		let { query, values } = sqlForPartialUpdate('users', data, 'username', username)

		const result = await db.query(query, values)

		if (!result.rows[0]) {
			throw new ExpressError(`There are no users with a username of '${username}'`, 404)
		}

		return result.rows[0]
	}

	static async delete(username) {
		const result = await db.query(
			`DELETE FROM users
		   WHERE username=$1
		   RETURNING username`,
			[username]
		)

		if (result.rows.length === 0) {
			throw new ExpressError(`There are no users with a username of '${username}'`, 404)
		}
	}
}

module.exports = User
