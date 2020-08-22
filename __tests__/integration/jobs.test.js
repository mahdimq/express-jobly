const request = require('supertest')
const app = require('../../app')

const { initializeData, clearDatabase, closeConnection, DATA } = require('./config')

beforeEach(async function () {
	try {
		await initializeData()
	} catch (err) {
		// console.error(err)
		return err
	}
})

afterEach(async function () {
	try {
		await clearDatabase()
	} catch (err) {
		// console.error(err)
		return err
	}
})

afterAll(async () => {
	await closeConnection()
})

// TEST ROUTE TO CREATE JOB
describe('POST /jobs', async () => {
	test('Create a new job as an admin', async () => {
		const res = await request(app).post('/jobs').send({
			title: 'Test Job',
			salary: 1000,
			equity: 0.6,
			company_handle: 'testcomp',
			_token: DATA.tokens.adminToken
		})

		expect(res.status).toBe(201)
		expect(res.body.job).toHaveProperty('id')
	})

	test('Non admin cannot create a job', async () => {
		const res = await request(app).post('/jobs').send({
			title: 'Test Job',
			salary: 1000,
			equity: 0.6,
			company_handle: 'testcomp',
			_token: DATA.tokens.userToken
		})

		expect(res.statusCode).toBe(401)
		expect(JSON.parse(res.text).message).toBe('Unauthorized, admin privileges required')
	})
})

// TEST ROUTE FOR ALL JOBS
describe('GET /jobs', async () => {
	test('Get list of all jobs', async () => {
		const res = await request(app).get(`/jobs?_token=${DATA.tokens.userToken}`)

		expect(res.body.jobs).toHaveLength(2)
	})

	test('Responds with 401 if user is not authenticated', async () => {
		const res = await request(app).get('/jobs')

		expect(res.statusCode).toBe(401)
		expect(JSON.parse(res.text).message).toBe('Unauthorized, you must login first')
	})
})

// TEST ROUTE FOR SINGLE JOB
describe('GET SINGLE /jobs/:id', async () => {
	test('Get a single job', async () => {
		const res = await request(app).get(`/jobs/${DATA.jobs[0].id}?_token=${DATA.tokens.userToken}`)
		expect(res.body.job.title).toBe('Test Job')
		expect(res.body.job.id).toEqual(expect.any(Number))
	})
	test('Responds with 401 if user is not authenticated', async () => {
		const res = await request(app).get('/jobs/1')
		expect(res.statusCode).toBe(401)
		expect(JSON.parse(res.text).message).toBe('Unauthorized, you must login first')
	})
	test('Responds with 404 if job is not found', async () => {
		const res = await request(app).get(`/jobs/999/?_token=${DATA.tokens.userToken}`)
		console.log('#############')
		console.log('#############')
		console.log('RES.BODY: ', res)
		console.log('#############')
		console.log('#############')
		expect(res.status).toBe(404)
	})
})

// TEST ROUTE TO UPDATE A SINGLE JOB
describe('PATCH /jobs/:id', async () => {
	test('Update a jobs information as admin', async () => {
		const res = await request(app).patch('/jobs/1').send({
			title: 'New Job',
			salary: 1000,
			equity: 0.6,
			company_handle: 'testcomp',
			_token: DATA.tokens.adminToken
		})

		expect(res.status).toBe(200)
		expect(res.body.job.title).toBe('New Job')
	})

	test('Responds with 401 if user is not authenticated', async () => {
		const res = await request(app).patch('/jobs/1').send({
			title: 'New Job',
			salary: 1000,
			equity: 0.6,
			company_handle: 'testcomp',
			_token: DATA.tokens.userToken
		})

		expect(res.status).toBe(401)
		expect(JSON.parse(res.text).message).toBe('Unauthorized, admin privileges required')
	})

	test('Responds with 404 if job is not found', async () => {
		const res = await request(app).patch('/jobs/999').send({
			title: 'New Job',
			salary: 1000,
			equity: 0.6,
			company_handle: 'testcomp',
			_token: DATA.tokens.adminToken
		})

		expect(res.statusCode).toBe(404)
	})
})

// TEST ROUTE TO DELETE A SINGLE JOB
describe('DELETE /jobs/:id', async () => {
	test('Delete a single job as admin', async () => {
		const res = await request(app).delete(`/jobs/1?_token=${DATA.tokens.adminToken}`)

		expect(res.statusCode).toBe(200)
		expect(res.body.message).toBe('Job deleted')
	})

	test('Responds with 401 if user is not authenticated', async () => {
		const res = await request(app).delete(`/jobs/1?_token=${DATA.tokens.userToken}`)

		expect(res.statusCode).toBe(401)
		expect(JSON.parse(res.text).message).toBe('Unauthorized, admin privileges required')
	})

	test('Responds with 404 if job is not found', async () => {
		const res = await request(app).delete(`/jobs/999?_token=${DATA.tokens.adminToken}`)

		expect(res.status).toBe(404)
	})
})
