const express = require('express')
const Job = require('../models/job')
const router = new express.Router()
const jsonschema = require('jsonschema')
const jobSchema = require('../schemas/jobSchema.json')
const updateJobSchema = require('../schemas/updateJobSchema.json')
const ExpressError = require('../helpers/expressError')
const { ensureLoggedIn, isAdmin } = require('../middleware/auth')

// GET ALL JOBS
router.get('/', ensureLoggedIn, async (req, res, next) => {
	try {
		const { search, salary, equity } = req.query

		const jobs = await Job.findAll(search, salary, equity)
		return res.json({ jobs })
	} catch (err) {
		return next(err)
	}
})

// POST JOB
router.post('/', isAdmin, async (req, res, next) => {
	try {
		const result = jsonschema.validate(req.body, jobSchema)
		if (!result.valid) throw new ExpressError(result.errors.map((err) => err.stack, 400))

		const job = await Job.create(req.body)
		return res.status(201).json({ job })
	} catch (err) {
		return next(err)
	}
})

// GET SINGLE JOB
router.get('/:id', ensureLoggedIn, async (req, res, next) => {
	try {
		const job = await Job.findById(req.params.id)
		return res.json({ job })
	} catch (err) {
		return next(err)
	}
})

// UPDATE SINGLE JOB
router.patch('/:id', isAdmin, async (req, res, next) => {
	try {
		const result = jsonschema.validate(req.body, updateJobSchema)
		if (!result.valid) {
			const listOfErrors = result.errors.map((err) => err.stack)
			return next({
				status: 400,
				error: listOfErrors
			})
		}
		const job = await Job.update(req.params.id, req.body)
		return res.json({ job })
	} catch (err) {
		return next(err)
	}
})

// DELETE SINGLE JOB
router.delete('/:id', isAdmin, async (req, res, next) => {
	try {
		const job = await Job.delete(req.params.id)
		return res.json({ message: 'Job deleted' })
	} catch (err) {
		return next(err)
	}
})
module.exports = router
