const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const db = require('../../db')
const SECRET_KEY = 'test'

const DATA = {}

async function initializeData() {
	try {
		let tokens = { adminToken: '', userToken: '' }

		// CREATE TEST USER ONE
		const hashedPassword1 = await bcrypt.hash('password', 1)
		const user1 = await db.query(
			`INSERT INTO users (username, password, first_name, last_name, email, is_admin)
			 VALUES ('username', $1, 'FirstName', 'LastName', 'test@user.com', true)
			 RETURNING username, is_admin`,
			[hashedPassword1]
		)

		tokens.adminToken = jwt.sign(
			{
				username: user1.rows[0].username,
				is_admin: user1.rows[0].is_admin
			},
			SECRET_KEY
		)

		// CREATE TEST USER TWO
		const hashedPassword2 = await bcrypt.hash('password', 1)
		const user2 = await db.query(
			`INSERT INTO users (username, password, first_name, last_name, email, is_admin)
			 VALUES ('username2', $1, 'FirstName', 'LastName', 'test2@user.com', false)
			 RETURNING username, is_admin`,
			[hashedPassword2]
		)

		tokens.userToken = jwt.sign(
			{
				username: user2.rows[0].username,
				is_admin: user2.rows[0].is_admin
			},
			SECRET_KEY
		)

		users = [user1.rows[0], user2.rows[0]]

		const company1 = await db.query(
			`INSERT INTO companies (handle, name, num_employees, description, logo_url)
       VALUES ($1, $2, $3, $4, $5)
			 RETURNING *`,
			['testcomp', 'Test Company', 123, 'test description', 'http://test.logo']
		)

		// CREATE TEST COMPANY TWO
		const company2 = await db.query(
			`INSERT INTO companies (handle, name, num_employees, description, logo_url)
       VALUES ($1, $2, $3, $4, $5)
			 RETURNING *`,
			['testcomp2', 'Test Company2', 456, 'test description', 'http://test.logo']
		)

		companies = [company1.rows[0], company2.rows[0]]

		// CREATE TEST JOB ONE
		const job1 = await db.query(
			`INSERT INTO jobs (title, salary, equity, company_handle)
							VALUES ('Test Job', 10000, 0.5, 'testcomp')
							RETURNING *`
		)

		// CREATE TEST JOB TWO
		const job2 = await db.query(
			`INSERT INTO jobs (title, salary, equity, company_handle)
							VALUES ('Test Job2', 10000, 0.5, 'testcomp2')
							RETURNING *`
		)

		jobs = [job1.rows[0], job2.rows[0]]

		DATA.tokens = tokens
		DATA.users = users
		DATA.jobs = jobs
		DATA.companies = companies
	} catch (err) {
		return err
	}
}

async function clearDatabase() {
	try {
		await db.query('DELETE FROM users')
		await db.query('DELETE FROM companies')
		await db.query('DELETE FROM jobs')
		await db.query('ALTER SEQUENCE jobs_id_seq RESTART WITH 1')
	} catch (err) {
		return err
	}
}

async function closeConnection() {
	try {
		await db.end()
	} catch (err) {
		return err
	}
}

module.exports = {
	initializeData,
	clearDatabase,
	closeConnection,
	DATA
}
