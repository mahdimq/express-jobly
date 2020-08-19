const sqlForPartialUpdate = require('../../helpers/partialUpdate')

describe('partialUpdate()', () => {
	it('should generate a proper partial update query with just 1 field', function () {
		// FIXME: write real tests!
		const { query, values } = sqlForPartialUpdate(
			'companies',
			{ name: 'fake name' },
			'description',
			'fake description'
		)

		expect(query).toEqual('UPDATE companies SET name=$1 WHERE description=$2 RETURNING *')
		expect(values).toEqual(['fake name', 'fake description'])
	})
})
