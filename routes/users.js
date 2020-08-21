const express = require('express')
const User = require('../models/user')
const router = new express.Router()
const jsonschema = require('jsonschema')
const userSchema = require('../schemas/userSchema.json')
const ExpressError = require('../helpers/expressError')

// GET ALL USERS
router.get('/', async (req, res, next) => {
	try {
		const users = await User.findAll()
		return res.json({ users })
	} catch (err) {
		return next(err)
	}
})

// CREATE A SINGLE USER
router.post('/', async (req, res, next) => {
	try {
		const result = jsonschema.validate(req.body, userSchema)
		if (!result.valid) throw new ExpressError(result.errors.map((err) => err.stack, 400))

		const user = await User.create(req.body)
		return res.json({ user })
	} catch (err) {
		return next(err)
	}
})

// GET A SINGLE USER
router.get('/:username', async (req, res, next) => {
	try {
		const user = await User.findByUsername(req.params.username)
		return res.json({ user })
	} catch (err) {
		return next(err)
	}
})

// UPDATE A SINGLE USER
router.patch('/:username', async (req, res, next) => {
	try {
		const result = jsonschema.validate(req.body, userSchema)
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
router.delete('/:username', async (req, res, next) => {
	try {
		const result = await User.delete(req.params.username)
		return res.json({ message: 'User deleted' })
	} catch (err) {
		return next(err)
	}
})

module.exports = router
