const express = require('express')
const User = require('../models/user')
const jsonschema = require('jsonschema')
const userSchema = require('../schemas/userSchema.json')
const updateUserSchema = require('../schemas/updateUserSchema.json')
const ExpressError = require('../helpers/expressError')
const { ensureCorrectUser, ensureLoggedIn } = require('../middleware/auth')
const router = new express.Router()

// GET ALL USERS
router.get('/', ensureLoggedIn, async (req, res, next) => {
	try {
		const users = await User.findAll()
		return res.json({ users })
	} catch (err) {
		return next(err)
	}
})

// CREATE A SINGLE USER
router.post('/', ensureLoggedIn, async (req, res, next) => {
	try {
		const result = jsonschema.validate(req.body, userSchema)
		if (!result.valid) throw new ExpressError(result.errors.map((err) => err.stack, 400))

		const user = await User.create(req.body)

		// Get and save to variable user token with payload
		const token = jwt.sign({ username: user.username, is_admin: user.is_admin }, SECRET_KEY)

		return res.status(201).json({ token })
	} catch (err) {
		return next(err)
	}
})

// GET A SINGLE USER
router.get('/:username', ensureLoggedIn, async (req, res, next) => {
	try {
		const user = await User.findByUsername(req.params.username)
		return res.json({ user })
	} catch (err) {
		return next(err)
	}
})

// UPDATE A SINGLE USER
router.patch('/:username', ensureCorrectUser, async (req, res, next) => {
	try {
		const result = jsonschema.validate(req.body, updateUserSchema)
		if (!result.valid) {
			const listOfErrors = result.errors.map((err) => err.stack)
			return next({
				status: 400,
				error: listOfErrors
			})
		}
		const user = await User.update(req.params.username, req.body)
		return res.json({ user })
	} catch (err) {
		return next(err)
	}
})

// DELETE A SINGLE USER
router.delete('/:username', ensureCorrectUser, async (req, res, next) => {
	try {
		const result = await User.delete(req.params.username)
		return res.json({ message: 'User deleted' })
	} catch (err) {
		return next(err)
	}
})

module.exports = router
