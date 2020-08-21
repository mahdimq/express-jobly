const express = require('express')
const Company = require('../models/company')
const jsonschema = require('jsonschema')
const router = new express.Router()
const companySchema = require('../schemas/companySchema.json')

const ExpressError = require('../helpers/expressError')
const { ensureLoggedIn, isAdmin } = require('../middleware/auth')

// GET ALL COMPANIES
router.get('/', ensureLoggedIn, async (req, res, next) => {
	try {
		// const { search, min_employees, max_employees } = req.query
		// if (search) {
		// 	const company = await Company.findBySearch(search)
		// 	return res.json({ company })
		// }

		// if (min_employees) {
		// 	const companies = await Company.findByMin(min_employees)
		// 	return res.json({ companies })
		// }

		// if (max_employees) {
		// 	const companies = await Company.findByMax(max_employees)
		// 	return res.json({ companies })
		// }

		// if (min_employees && max_employees) {
		// 	const companies = await Company.findByMinMax(min_employees, max_employees)
		// 	return res.json({ companies })
		// }
		const companies = await Company.findAll(req.query)
		return res.json({ companies })
	} catch (err) {
		return next(err)
	}
})

// GET SINGLE COMPANY BY HANDLE
router.get('/:handle', ensureLoggedIn, async (req, res, next) => {
	try {
		const company = await Company.findByHandle(req.params.handle)
		return res.json({ company })
	} catch (err) {
		return next(err)
	}
})

// POST COMPANY
router.post('/', isAdmin, async (req, res, next) => {
	try {
		const result = jsonschema.validate(req.body, companySchema)
		if (!result.valid) throw new ExpressError(result.errors.map((err) => err.stack, 400))

		const company = await Company.create(req.body)
		return res.status(201).json({ company })
	} catch (err) {
		return next(err)
	}
})

// PATCH COMPANY
router.patch('/:handle', isAdmin, async (req, res, next) => {
	try {
		const result = jsonschema.validate(req.body, companySchema)
		if (!result.valid) {
			const listOfErrors = result.errors.map((err) => err.stack)
			return next({
				status: 400,
				error: listOfErrors
			})
		}
		const company = await Company.update(req.params.handle, req.body)
		return res.json({ company })
	} catch (err) {
		return next(err)
	}
})

// DELETE COMPANY
router.delete('/:handle', isAdmin, async (req, res, next) => {
	try {
		await Company.delete(req.params.handle)
		return res.json({ message: 'Company has been deleted!' })
	} catch (err) {
		return next(err)
	}
})

module.exports = router
