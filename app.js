/** Express app for jobly. */

const express = require('express')
const morgan = require('morgan')
const ExpressError = require('./helpers/expressError')
const companyRoutes = require('./routes/companies')
const jobRoutes = require('./routes/jobs')
const userRoutes = require('./routes/users')
const authRoutes = require('./routes/auth')

const app = express()

app.use(express.json())

app.use('/companies', companyRoutes)
app.use('/jobs', jobRoutes)
app.use('/users', userRoutes)
app.use('/', authRoutes)

// add logging system
app.use(morgan('tiny'))

/** 404 handler */

app.use(function (req, res, next) {
	const err = new ExpressError('Not Found', 404)

	// pass the error to the next piece of middleware
	return next(err)
})

/** general error handler */

app.use(function (err, req, res, next) {
	res.status(err.status || 500)
	console.error(err.stack)

	return res.json({
		status: err.status,
		message: err.message
	})
})

module.exports = app
