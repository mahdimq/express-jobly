process.env.NODE_ENV = 'test'
const request = require('supertest')
const app = require('../../app')
const db = require('../../db')
const Company = require('../../models/company')

let testCompany

beforeEach(async () => {
	await db.query('DELETE FROM companies') //<-- Empty tables

	testCompany = await Company.create({
		handle: 'testcomp',
		name: 'Test Company',
		num_employees: 1234,
		description: 'test description',
		logo_url: 'http://test.logo'
	})
})

afterAll(async () => {
	await db.end() //<-- Close connection to database
})

// TEST ROUTE FOR ALL COMPANIES
describe('GET /companies', () => {
	test('Get list of all companies', async () => {
		const res = await request(app).get('/companies')
		expect(res.statusCode).toBe(200)
		expect(res.body).toBeInstanceOf(Object)
		expect(res.body.companies[0]).toHaveProperty('handle')
		expect(res.body).toEqual({
			companies: [
				{
					handle: 'testcomp',
					name: 'Test Company'
				}
			]
		})
	})
})

// TEST ROUTE FOR ONE COMPANY
describe('GET /companies/:handle', () => {
	test('Get a single company', async () => {
		const res = await request(app).get(`/companies/${testCompany.handle}`)
		expect(res.statusCode).toBe(200)
		expect(res.body).toEqual({
			company: {
				handle: 'testcomp',
				name: 'Test Company',
				num_employees: 1234,
				description: 'test description',
				logo_url: 'http://test.logo'
			}
		})
	})
	test('Respond with 404 for invalid code', async () => {
		const res = await request(app).get(`/companies/error`)
		expect(res.statusCode).toBe(404)
	})
})

// TEST ROUTE TO POST A NEW COMPANY
describe('POST /companies', () => {
	test('Create a single new company', async () => {
		const res = await request(app).post(`/companies`).send({
			handle: 'testcomp2',
			name: 'Test Company2',
			num_employees: 1234,
			description: 'test description',
			logo_url: 'http://test.logo'
		})
		expect(res.statusCode).toBe(201)
		expect(res.body).toBeInstanceOf(Object)
		expect(res.body.company).toHaveProperty('handle')
		expect(res.body).toEqual({
			company: {
				handle: 'testcomp2',
				name: 'Test Company2',
				num_employees: 1234,
				description: 'test description',
				logo_url: 'http://test.logo'
			}
		})
	})
	test('company with duplcate handle returns 400 error', async () => {
		const response = await request(app).post(`/companies`).send({
			handle: 'testcomp',
			name: 'Test Company',
			num_employees: 1234,
			description: 'test description',
			logo_url: 'http://test.logo'
		})
		expect(response.status).toBe(500)
	})
	test('company with missing fields returns 400 error', async () => {
		const response = await request(app).post(`/companies`).send({
			name: 'Test Company2',
			num_employees: 1234
		})
		expect(response.status).toBe(500)
	})
})

// TEST ROUTE TO UPDATE A COMPANY
describe('PATCH /companies/:handle', () => {
	test('Update a single company', async () => {
		const res = await request(app).patch(`/companies/${testCompany.handle}`).send({
			handle: 'testcomp',
			name: 'Test Company',
			num_employees: 1234,
			description: 'test description',
			logo_url: 'http://test.logo'
		})
		expect(res.statusCode).toBe(200)
		expect(res.body).toBeInstanceOf(Object)
		expect(res.body.company).toHaveProperty('handle')
		expect(res.body).toEqual({
			company: {
				handle: 'testcomp',
				name: 'Test Company',
				num_employees: 1234,
				description: 'test description',
				logo_url: 'http://test.logo'
			}
		})
	})
	test('Respond with 404 for invalid handle', async () => {
		const res = await request(app).patch(`/companies/error`).send({
			handle: 'testcomp',
			name: 'Test Company',
			num_employees: 1234,
			description: 'test description',
			logo_url: 'http://test.logo'
		})
		expect(res.statusCode).toBe(404)
	})
})

// TEST ROUTE TO DELETE A COMPANY
describe('DELETE /companies/:handle', () => {
	test('Delete a single company', async () => {
		const res = await request(app).delete(`/companies/${testCompany.handle}`)
		expect(res.statusCode).toBe(200)
		expect(res.body).toEqual({ message: 'Company has been deleted!' })
	})
})
