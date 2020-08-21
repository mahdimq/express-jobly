// process.env.NODE_ENV = 'test'
// const request = require('supertest')
// const app = require('../../app')
// const db = require('../../db')
// const Job = require('../../models/job')

// let testJob

// beforeEach(async () => {
// 	await db.query('DELETE FROM jobs') //<-- Empty tables

// 	testJob = await Job.create({
// 		title: 'Test Job',
// 		salary: 10000,
// 		equity: 5,
// 		company_handle: 'testcompany'
// 	})
// })

// afterAll(async () => {
// 	await db.end() //<-- Close connection to database
// })

// console.log('#####################################')
// console.log('#####################################')
// console.log(testJob)
// console.log('#####################################')
// console.log('#####################################')

// // TEST ROUTE FOR ALL JOBS
// describe('GET /jobs', () => {
// 	test('Get list of all jobs', async () => {
// 		const res = await request(app).get('/jobs')
// 		expect(res.statusCode).toBe(200)
// 		expect(res.body).toBeInstanceOf(Object)
// 		expect(res.body.job[0]).toHaveProperty('id')
// 		expect(res.body).toEqual({
// 			jobs: [
// 				{
// 					title: 'Test Job'
// 				}
// 			]
// 		})
// 	})
// })

// // TEST ROUTE FOR ONE JOB
// describe('GET /job/:id', () => {
// 	test('Get a single job', async () => {
// 		const res = await request(app).get(`/jobs/${testJob.id}`)
// 		expect(res.statusCode).toBe(200)
// 		expect(res.body).toEqual({
// 			job: {
// 				title: 'Test Job',
// 				salary: 10000,
// 				equity: 5,
// company_handle: 'testcompany'
// 			}
// 		})
// 	})
// 	test('Respond with 404 for invalid code', async () => {
// 		const res = await request(app).get(`/jobs/error`)
// 		expect(res.statusCode).toBe(404)
// 	})
// })

// // TEST ROUTE TO POST A NEW COMPANY
// describe('POST /job', () => {
// 	test('Create a single new job', async () => {
// 		const res = await request(app).post(`/jobs`).send({
// 			title: 'Test Job2',
// 			salary: 10000,
// 			equity: 5,
// company_handle: 'testcompany'
// 		})
// 		expect(res.statusCode).toBe(201)
// 		expect(res.body).toBeInstanceOf(Object)
// 		expect(res.body.job).toHaveProperty('id')
// 		expect(res.body).toEqual({
// 			job: {
// 				title: 'Test Job2',
// 				salary: 10000,
// 				equity: 5,
// company_handle: 'testcompany'
// 			}
// 		})
// 	})
// 	test('job with duplcate id returns 400 error', async () => {
// 		const response = await request(app).post(`/jobs`).send({
// 			title: 'Test Job',
// 			salary: 10000,
// 			equity: 5,
// company_handle: 'testcompany'
// 		})
// 		expect(response.status).toBe(500)
// 	})
// 	test('job with missing fields returns 400 error', async () => {
// 		const response = await request(app).post(`/jobs`).send({
// 			title: 'Test Job2',
// 			salary: 10000
// 		})
// 		expect(response.status).toBe(500)
// 	})
// })

// // TEST ROUTE TO UPDATE A COMPANY
// describe('PATCH /job/:id', () => {
// 	test('Update a single job', async () => {
// 		const res = await request(app).patch(`/jobs/${testJob.id}`).send({
// 			title: 'Test Job',
// 			salary: 10000,
// 			equity: 5,
// company_handle: 'testcompany'
// 		})
// 		expect(res.statusCode).toBe(200)
// 		expect(res.body).toBeInstanceOf(Object)
// 		expect(res.body.job).toHaveProperty('id')
// 		expect(res.body).toEqual({
// 			job: {
// 				title: 'Test Job',
// 				salary: 10000,
// 				equity: 5,
// company_handle: 'testcompany'
// 			}
// 		})
// 	})
// 	test('Respond with 404 for invalid id', async () => {
// 		const res = await request(app).patch(`/jobs/error`).send({
// 			title: 'Test Job',
// 			salary: 10000,
// 			equity: 5,
// company_handle: 'testcompany'
// 		})
// 		expect(res.statusCode).toBe(404)
// 	})
// })

// // TEST ROUTE TO DELETE A COMPANY
// describe('DELETE /job/:id', () => {
// 	test('Delete a single job', async () => {
// 		const res = await request(app).delete(`/jobs/${testJob.id}`)
// 		expect(res.statusCode).toBe(200)
// 		expect(res.body).toEqual({ message: 'Job deleted!' })
// 	})
// })

// ############################################################################################################################################################
// ############################################################################################################################################################
// ############################################################################################################################################################
// ############################################################################################################################################################
// ############################################################################################################################################################
// ############################################################################################################################################################
// ############################################################################################################################################################
// ############################################################################################################################################################
// ############################################################################################################################################################

// npm packages
const request = require('supertest')

// app imports
const app = require('../../app')

const { TEST_DATA, afterEachHook, beforeEachHook, afterAllHook } = require('./config')

beforeEach(async () => {
	await beforeEachHook(TEST_DATA)
})

describe('POST /jobs', async function () {
	test('Creates a new job', async function () {
		const response = await request(app).post(`/jobs`).send({
			_token: TEST_DATA.userToken,
			company_handle: TEST_DATA.currentCompany.handle,
			title: 'Software Engineer in Test',
			salary: 1000000,
			equity: 0.2
		})
		expect(response.statusCode).toBe(201)
		expect(response.body.job).toHaveProperty('id')
	})

	test('Prevents creating a job without required title field', async function () {
		const response = await request(app).post(`/jobs`).send({
			_token: TEST_DATA.userToken,
			salary: 1000000,
			equity: 0.2,
			company_handle: TEST_DATA.currentCompany.handle
		})
		expect(response.statusCode).toBe(400)
	})
})

describe('GET /jobs', async function () {
	test('Gets a list of 1 job', async function () {
		const response = await request(app).get(`/jobs`)
		const jobs = response.body.jobs
		expect(jobs).toHaveLength(1)
		expect(jobs[0]).toHaveProperty('company_handle')
		expect(jobs[0]).toHaveProperty('title')
	})

	test('Has working search', async function () {
		await request(app).post(`/jobs`).send({
			title: 'Software Engineer in Test',
			salary: 1000000,
			equity: 0.2,
			company_handle: TEST_DATA.currentCompany.handle,
			_token: TEST_DATA.userToken
		})

		await request(app).post(`/jobs`).send({
			title: 'Web Dev',
			salary: 1000000,
			company_handle: TEST_DATA.currentCompany.handle,
			_token: TEST_DATA.userToken
		})

		const response = await request(app)
			.get('/jobs?search=web+dev')
			.send({ _token: TEST_DATA.userToken })
		expect(response.body.jobs).toHaveLength(1)
		expect(response.body.jobs[0]).toHaveProperty('company_handle')
		expect(response.body.jobs[0]).toHaveProperty('title')
	})
})

describe('GET /jobs/:id', async function () {
	test('Gets a single a job', async function () {
		const response = await request(app)
			.get(`/jobs/${TEST_DATA.jobId}`)
			.send({ _token: TEST_DATA.userToken })
		expect(response.body.job).toHaveProperty('id')

		expect(response.body.job.id).toBe(TEST_DATA.jobId)
	})

	test('Responds with a 404 if it cannot find the job in question', async function () {
		const response = await request(app).get(`/jobs/999`).send({ _token: TEST_DATA.userToken })
		expect(response.statusCode).toBe(404)
	})
})

describe('PATCH /jobs/:id', async function () {
	test("Updates a single a job's title", async function () {
		const response = await request(app)
			.patch(`/jobs/${TEST_DATA.jobId}`)
			.send({ title: 'xkcd', _token: TEST_DATA.userToken })
		expect(response.body.job).toHaveProperty('id')

		expect(response.body.job.title).toBe('xkcd')
		expect(response.body.job.id).not.toBe(null)
	})

	test("Updates a single a job's equity", async function () {
		const response = await request(app).patch(`/jobs/${TEST_DATA.jobId}`).send({
			_token: TEST_DATA.userToken,
			equity: 0.5
		})
		expect(response.body.job).toHaveProperty('id')
	})

	test('Prevents a bad job update', async function () {
		const response = await request(app).patch(`/jobs/${TEST_DATA.jobId}`).send({
			_token: TEST_DATA.userToken,
			cactus: false
		})
		expect(response.statusCode).toBe(400)
	})

	test('Responds with a 404 if it cannot find the job in question', async function () {
		// delete job first
		await request(app).delete(`/jobs/${TEST_DATA.jobId}`).send({
			_token: TEST_DATA.userToken,
			title: 'instructor'
		})
		const response = await request(app).patch(`/jobs/${TEST_DATA.jobId}`).send({
			_token: TEST_DATA.userToken,
			title: 'instructor'
		})
		expect(response.statusCode).toBe(404)
	})
})

describe('DELETE /jobs/:id', async function () {
	test('Deletes a single a job', async function () {
		const response = await request(app)
			.delete(`/jobs/${TEST_DATA.jobId}`)
			.send({ _token: TEST_DATA.userToken })
		expect(response.body).toEqual({ message: 'Job deleted' })
	})

	test('Responds with a 404 if it cannot find the job in question', async function () {
		// delete job first
		await request(app).delete(`/jobs/${TEST_DATA.jobId}`).send({ _token: TEST_DATA.userToken })
		const response = await request(app)
			.delete(`/jobs/${TEST_DATA.jobId}`)
			.send({ _token: TEST_DATA.userToken })
		expect(response.statusCode).toBe(404)
	})
})

afterEach(async function () {
	await afterEachHook()
})

afterAll(async function () {
	await afterAllHook()
})
