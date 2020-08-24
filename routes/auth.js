const express = require('express')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const { SECRET_KEY } = require('../config')
const router = new express.Router()

// authenticate a user and return a JSON Web Token

router.post('/login', async function (req, res, next) {
	try {
		const user = await User.authenticate(req.body)
		const token = jwt.sign({ username: user.username, is_admin: user.is_admin }, SECRET_KEY)
		return res.json({ token })
	} catch (err) {
		return next(err)
	}
})

// router.post('/signup', async (req, res, next) => {
// 	try {
// 		const user = req.body

// 		const result = await User.create(user)

// 		return res.status(201).json(result)
// 	} catch (e) {
// 		return next(e)
// 	}
// })

module.exports = router
