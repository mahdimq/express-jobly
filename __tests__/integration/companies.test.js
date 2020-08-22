const request = require('supertest')
const app = require('../../app')

const { initializeData, clearDatabase, closeConnection, DATA } = require('./config')

beforeEach(async function () {
	try {
		await initializeData()
	} catch (err) {
		return next(err)
	}
})

afterEach(async function () {
	try {
		await clearDatabase()
	} catch (err) {
		return next(err)
	}
})

afterAll(async () => {
	await closeConnection()
})

// TEST ROUTE FOR ALL COMPANIES
describe('GET /companies', () => {
	test('Get list of all companies', async () => {
		const res = await request(app).get(`/companies?_token=${DATA.tokens.userToken}`)

		expect(res.body.companies).toHaveLength(2)
	})

	test('Responds with 401 if user is not authenticated', async () => {
		const res = await request(app).get('/companies')

		expect(res.statusCode).toBe(401)
		expect(JSON.parse(res.text).message).toBe('Unauthorized, you must login first')
	})
})

// TEST ROUTE TO POST A NEW COMPANY
describe('POST /companies', () => {
	test('Create a single new company as an admin', async () => {
		const res = await request(app).post('/companies').send({
			handle: 'company1',
			name: 'Company One',
			num_employees: 111,
			description: 'test description',
			logo_url: 'http://test.logo',
			_token: DATA.tokens.adminToken
		})
		expect(res.statusCode).toBe(201)
		expect(res.body.company).toHaveProperty('handle')
	})

	test('Non admin cannot create a new company', async () => {
		const res = await request(app).post('/companies').send({
			handle: 'company1',
			name: 'Company One',
			num_employees: 111,
			description: 'test description',
			logo_url: 'http://test.logo',
			_token: DATA.tokens.userToken
		})

		expect(res.statusCode).toBe(401)
		expect(JSON.parse(res.text).message).toBe('Unauthorized, admin privileges required')
	})

	test('Company with duplicate handle returns 500 error', async () => {
		const res = await request(app).post(`/companies`).send({
			handle: 'testcomp',
			name: 'Test Company',
			num_employees: 123,
			description: 'test description',
			logo_url: 'http://test.logo',
			_token: DATA.tokens.adminToken
		})
		expect(res.statusCode).toBe(500)
	})
})

// TEST ROUTE FOR ONE COMPANY
describe('GET SINGLE /companies/:handle', () => {
	test('Get a single company', async () => {
		const res = await request(app).get(`/companies/testcomp?_token=${DATA.tokens.userToken}`)

		expect(res.body.company.name).toBe('Test Company')
		// expect(res.body.company.jobs).toHaveLength(1)
		expect(res.body.company.description).toBe('test description')
	})

	test('Responds with a 401 if user is not authenticated', async () => {
		const res = await request(app).get('/companies/testcomp')

		expect(res.statusCode).toBe(401)
		expect(JSON.parse(res.text).message).toBe('Unauthorized, you must login first')
	})

	test('Responds with a 404 if company is not found', async () => {
		const res = await request(app).get(`/companies/fake?_token=${DATA.tokens.userToken}`)

		expect(res.statusCode).toBe(404)
	})
})

// TEST ROUTE TO UPDATE A COMPANY
describe('PATCH /companies/:handle', () => {
	test('Update a single company as admin', async () => {
		const res = await request(app).patch(`/companies/testcomp`).send({
			handle: 'testcomp',
			name: 'Another Test Company',
			num_employees: 5000,
			description: 'test description',
			logo_url: 'http://test.logo',
			_token: DATA.tokens.adminToken
		})

		expect(res.statusCode).toBe(200)
		expect(res.body.company.name).toBe('Another Test Company')
		expect(res.body.company.num_employees).toBe(5000)
		expect(res.body.company.description).toBe('test description')
		expect(res.body.company.logo_url).toBe('http://test.logo')
	})

	test('Responds with a 404 if company is not found', async () => {
		const res = await request(app).patch('/companies/fake').send({
			handle: 'testcomp',
			name: 'Test Company',
			num_employees: 1234,
			description: 'test description',
			logo_url: 'http://test.logo',
			_token: DATA.tokens.adminToken
		})

		expect(res.statusCode).toBe(404)
	})
})

// TEST ROUTE TO DELETE A COMPANY
describe('DELETE /companies/:handle', () => {
	test('Delete a single company as admin', async () => {
		const res = await request(app).delete(`/companies/testcomp?_token=${DATA.tokens.adminToken}`)

		expect(res.statusCode).toBe(200)
		expect(res.body.message).toBe('Company has been deleted!')
	})

	test('Responds with a 401 if user is not authenticated', async () => {
		const res = await request(app).delete(`/companies/testcomp?_token=${DATA.tokens.userToken}`)

		expect(res.statusCode).toBe(401)
		expect(JSON.parse(res.text).message).toBe('Unauthorized, admin privileges required')
	})

	test('Responds with a 404 if company is not found', async () => {
		const res = await request(app).delete(`/companies/fake?_token=${DATA.tokens.adminToken}`)

		expect(res.statusCode).toBe(404)
	})
})
