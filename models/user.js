const db = require('../db')
const update = require('../helpers/partialUpdate')
const ExpressError = require('../helpers/expressError')
const bcrypt = require('bcrypt')
const { BCRYPT_WORK_FACTOR } = require('../config')

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

		return user
	}

	static async create(data) {
		const { username, password, first_name, last_name, email, photo_url, is_admin } = data
		const duplicateCheck = await db.query(
			`SELECT username
		    FROM users
		    WHERE username = $1`,
			[data.username]
		)
		if (duplicateCheck.rows[0])
			throw new ExpressError(`User already exists with username '${data.username}`, 400)

		// Hash the password entered by user
		const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR)

		const result = await db.query(
			`INSERT INTO users (username, password, first_name, last_name, email, photo_url, is_admin)
		     VALUES ($1, $2, $3, $4, $5, $6, $7)
		     RETURNING *`,
			[username, hashedPassword, first_name, last_name, email, photo_url, is_admin]
		)
		if (result.rows.length === 0) throw new ExpressError('User could not be added', 400)

		return result.rows[0]
	}

	static async update(username, data) {
		let { query, values } = update('users', data, 'username', username)

		const result = await db.query(query, values)
		const user = result.rows[0]

		if (!user) {
			throw new ExpressError(`There are no users with a username of '${username}'`, 404)
		}

		return user
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

	static async authenticate(data) {
		const result = await db.query(
			`
        SELECT username, password, is_admin
        FROM users
        WHERE username = $1
        `,
			[data.username]
		)
		const user = result.rows[0]
		if (await bcrypt.compare(data.password, user.password)) {
			// make a jwt
			const token = jwt.sign({ user }, SECRET_KEY)
			return { token }
		}
	}

	// static async authenticate(data) {
	// 	// try to find the user first
	// 	const result = await db.query(
	// 		`SELECT username, password, first_name, last_name, email, photo_url, is_admin
	//      FROM users
	//      WHERE username = $1`,
	// 		[data.username]
	// 	)

	// 	const user = result.rows[0]

	// 	if (user) {
	// 		// compare hashed password to a new hash from password
	// 		const isValid = await bcrypt.compare(data.password, user.password)
	// 		if (isValid) {
	// 			return user
	// 		}
	// 	}

	// 	throw ExpressError('Invalid Password', 401)
	// }
}

module.exports = User
