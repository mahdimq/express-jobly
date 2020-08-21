process.env.NODE_ENV = 'test'
const request = require('supertest')
const app = require('../../app')
const db = require('../../db')
const Job = require('../../models/job')

let testJob

beforeEach(async () => {
	await db.query('DELETE FROM jobs') //<-- Empty tables

	testJob = await Job.create({
		title: 'Test Job',
		salary: 10000,
		equity: 5,
		company_handle: 'testcompany'
	})
})

afterAll(async () => {
	await db.end() //<-- Close connection to database
})

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
// 				company_handle: 'testcompany'
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
