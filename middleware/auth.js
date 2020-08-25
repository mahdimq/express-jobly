const jwt = require('jsonwebtoken')
const ExpressError = require('../helpers/expressError')
const { SECRET_KEY } = require('../config')

function ensureLoggedIn(req, res, next) {
	try {
		const token = req.body._token || req.query._token
		const payload = jwt.verify(token, SECRET_KEY)

		// res.username = token.username
		// res.is_admin = token.is_admin
		req.username = payload

		return next()
	} catch (err) {
		return next(new ExpressError('Unauthorized, you must login first', 401))
	}
}

function isAdmin(req, res, next) {
	try {
		const token = req.body._token || req.query._token
		const payload = jwt.verify(token, SECRET_KEY)

		req.username = payload

		if (req.username.is_admin) return next()
		throw new ExpressError('Unauthorized, admin privileges required', 401)
	} catch (err) {
		return next(err)
	}
}

function ensureCorrectUser(req, res, next) {
	try {
		let token = req.body._token || req.query._token

		token = jwt.verify(token, SECRET_KEY)
		res.username = token.username
		res.is_admin = token.is_admin

		if (token.is_admin || token.username === req.params.username) {
			return next()
		} else {
			throw new ExpressError('Unauthorized, you must login first', 401)
		}
	} catch (err) {
		return next(err)
	}
}

module.exports = { ensureLoggedIn, ensureCorrectUser, isAdmin }
