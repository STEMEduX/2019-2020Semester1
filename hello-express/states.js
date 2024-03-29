const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 8080

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/', (req, res) => res.send('welcome to states application!'))

//data store in memory. in production, it can be in database
let allStates = [ 
	{ code: 'MN', name:'Minnesota'},
	{ code: 'WI', name: 'Wisconsin'},
	{ code: 'IL', name: 'Illinois'}
]
//getting all states
app.get('/states', (req, res) => {
	console.log('getting all states')
	res.send(allStates)
}) 

app.get('/states/:code', (req, res) => {
	console.log(`getting all states for ${req.params.code}`);
	//validation
	if (!req.params.code || req.params.code.length !== 2) {
		res.status(400).send({success: false, error: `Invalid state code: ${req.params.code}!`})
		return
	}

	//searching
	let found = allStates.filter( s => s.code === req.params.code.toUpperCase())

	if (found.length === 0) {
		res.status(404).send({success: false, error: 'not found'})
		return
	}

	res.send(found);
})  

app.post('/states', function(req, res) {
	console.log(`adding state ${JSON.stringify(req.body)}`); //need setup body-parser for request.body to work
	//validation - 400
	let { code, name } = req.body
	let validateResult = validateInput(code, name);
	if (validateInput.success === false) {
		res.status(400).send(validateResult)
		return
	}

	//check existing - 409
	let existing = allStates.filter( s => s.code === code.toUpperCase())
	if (existing.length !== 0) {
		res.status(409).send({ success: false, error: `State ${code} already exists!` })
		return
	}

	//add - 201
	allStates.push({ code, name });
	res.status(201).send({ success: true, error: `${code} created` })
})  

app.put('/states/:code', (req, res) => {
	//validation - 400
	let code = req.params.code
	let { name } = req.body
	let validateResult = validateInput(code, name);
	if (validateInput.success === false) {
		res.status(400).send(validateResult)
		return
	}
	//check exists - 404
	let existing = allStates.filter( s => s.code === code.toUpperCase())
	if (existing.length === 0) {
		res.status(404).send({success: false, error: 'not found'})
		return
	}
	//update - 200
	// allStates.forEach(state => {
	// 	if (state.code === code.toUpperCase()) {
	// 		state.name = name
	// 	}
	// });
	allStates = allStates.map( (e) => { 
		if (e.code === code.toUpperCase()) {
			e.name = name;
		}
		return e
	})
	res.send({ success: true, error: `${code} updated` })
})

app.delete('/states/:code', (req, res) => {
	//validation - 400
	let code = req.params.code
	let { name } = req.body
	let validateResult = validateInput(code, name);
	if (validateInput.success === false) {
		res.status(400).send(validateResult)
		return
	}
	//check exists - 404
	let existing = allStates.filter( s => s.code === code.toUpperCase())
	if (existing.length === 0) {
		res.status(404).send({success: false, error: 'not found'})
		return
	}
	//remove - 200
	allStates = allStates.filter( s => s.code !== code.toUpperCase())
	res.send({ success: true, error: `${code} removed` })
})

const validateInput = (code, name) => {
	
	if (!code || code.length != 2) {
		return { success: false, error: `Invalid state code: ${code}!` }
	}
	if (!name) {
		return { success: false, error: 'State name is required!' }
	}
	return { success: true, error: '' }
}

app.listen(port, () => console.log(`Example app listening on port ${port}!`))