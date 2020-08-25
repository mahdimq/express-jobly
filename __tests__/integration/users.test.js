const request = require('supertest')
const app = require('../../app')
const { initializeData, clearDatabase, closeConnection, DATA } = require('./config')

beforeEach(async function () {
	try {
		await initializeData()
	} catch (err) {
		// console.error(err)
		return next(err)
	}
})
afterEach(async function () {
	try {
		await clearDatabase()
	} catch (err) {
		// console.error(err)
		return next(err)
	}
})

afterAll(async () => {
	await closeConnection()
})

// TEST ROUTE FOR ALL USERS
describe('GET /users', async () => {
	test('Get all users authenticated', async () => {
		const res = await request(app).get(`/users?_token=${DATA.tokens.userToken}`)

		expect(res.body.users).toHaveLength(2)
	})
	test('Responds with a 401 if user not authenticated', async () => {
		const res = await request(app).get('/users')

		expect(res.statusCode).toBe(401)
		expect(JSON.parse(res.text).message).toBe('Unauthorized, you must login first')
	})
})

// TEST ROUTE TO CREATE A SINGLE USER
describe('POST /user', async () => {
	test('Register a single new user', async () => {
		const res = await request(app).post(`/users?_token=${DATA.tokens.userToken}`).send({
			username: 'newUser',
			password: 'password',
			first_name: 'FirstName',
			last_name: 'LastName',
			email: 'test@user.com',
			photo_url: 'http://user.pic',
			is_admin: false
		})

		expect(res.statusCode).toBe(201)
		expect(res.body).toHaveProperty('token')
	})
	test('Register a new user with invalid data', async () => {
		const res = await request(app).post(`/users?_token=${DATA.tokens.userToken}`).send({
			username: 'username',
			password: 'password',
			first_name: 'FirstName',
			last_name: 'LastName',
			email: 'abcdef',
			photo_url: 12345
		})

		expect(res.statusCode).toBe(500)
	})
	test('Register with duplicated username gives an error', async () => {
		const res = await request(app).post(`/users?_token=${DATA.tokens.adminToken}`).send({
			username: 'newUser',
			password: 'password',
			first_name: 'FirstName',
			last_name: 'LastName',
			email: 'test3@user.com'
		})

		expect(res.statusCode).toBe(500)
	})
	test('Register with duplicated email gives an error', async () => {
		const res = await request(app).post(`/users?_token=${DATA.tokens.userToken}`).send({
			username: 'username3',
			password: 'password',
			first_name: 'FirstName',
			last_name: 'LastName',
			email: 'test@user.com'
		})

		expect(res.statusCode).toBe(500)
	})
})

// TEST ROUTE TO GET A SINGLE USER
describe('GET SINGLE /users/:username', async () => {
	test('Get a single user (authenticated)', async () => {
		const res = await request(app).get(`/users/username?_token=${DATA.tokens.userToken}`)

		expect(res.body.user.username).toBe('username')
		expect(res.body.user.email).toBe('test@user.com')
		expect(res.body.user).toHaveProperty('username')
		expect(res.body.user).not.toHaveProperty('password')
	})
	test('Responds with a 401 if user is not authenticated', async () => {
		const res = await request(app).get('/users/username')

		expect(res.statusCode).toBe(401)
		expect(JSON.parse(res.text).message).toBe('Unauthorized, you must login first')
	})
	test('Responds with 404 if user is not found', async () => {
		const res = await request(app).get(`/users/fake?_token=${DATA.tokens.userToken}`)

		expect(res.statusCode).toBe(404)
	})
})

// TEST ROUTE TO UPDATE A SINGLE USER
describe('PATCH /users/:id', async () => {
	test("Update a single user's information as admin", async () => {
		const res = await request(app).patch(`/users/${DATA.users[0].username}`).send({
			first_name: 'NewFirstName',
			last_name: 'NewLastName',
			_token: DATA.tokens.adminToken
		})

		expect(res.statusCode).toBe(200)
		expect(res.body).toHaveProperty('username')
		expect(res.body.first_name).toBe('NewFirstName')
		expect(res.body.last_name).toBe('NewLastName')
		expect(res.body.username).not.toBe(null)
	})
	test("Update the authorized user's information", async () => {
		const res = await request(app).patch(`/users/username2`).send({
			username: 'username2',
			first_name: 'NewFirstName',
			last_name: 'NewLastName',
			email: 'test2@user.com',
			_token: DATA.tokens.userToken
		})

		expect(res.statusCode).toBe(200)
		expect(res.body.username).toBe('username2')
		expect(res.body.email).toBe('test2@user.com')
		expect(res.body.first_name).toBe('NewFirstName')
		expect(res.body.last_name).toBe('NewLastName')
	})
	test('Wrong user cannot update user information', async () => {
		const res = await request(app).patch(`/users/${DATA.users[0].username}`).send({
			username: 'username2',
			first_name: 'FirstName',
			last_name: 'LastName',
			email: 'newemail@user.com',
			_token: DATA.tokens.userToken
		})

		expect(JSON.parse(res.text).message).toBe('Unauthorized, you must login first')
	})
	test('should return 404 error if no user found', async () => {
		const res = await request(app).patch('/users/fake').send({
			first_name: 'FirstName',
			_token: DATA.tokens.adminToken
		})
		expect(res.status).toBe(404)
	})
})

// TEST ROUTE TO DELETE A SINGLE USER
describe('DELETE /users/:id', async () => {
	test('Delete a correct user as admin', async () => {
		const res = await request(app).delete(
			`/users/${DATA.users[1].username}?_token=${DATA.tokens.adminToken}`
		)

		expect(res.statusCode).toBe(200)
		expect(res.body.message).toBe('User deleted')
	})
	test('Delete a correct user being the same user', async () => {
		const res = await request(app).delete(
			`/users/${DATA.users[1].username}?_token=${DATA.tokens.userToken}`
		)

		expect(res.statusCode).toBe(200)
		expect(res.body.message).toBe('User deleted')
	})
	test('Responds with a 401 if user not authenticated', async () => {
		const res = await request(app).delete(
			`/users/${DATA.users[0].username}?_token=${DATA.tokens.userToken}`
		)

		expect(res.statusCode).toBe(401)
		expect(JSON.parse(res.text).message).toBe('Unauthorized, you must login first')
	})
	test('Responds with a 404 if user is not found', async () => {
		const res = await request(app).delete(`/users/fake?_token=${DATA.tokens.adminToken}`)

		expect(res.statusCode).toBe(404)
	})
})
