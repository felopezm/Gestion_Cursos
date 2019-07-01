//Requires
require('./config/config')
require('./helpers/helpers')
const express = require('express')
const app = express()
const path = require('path')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

//Paths
const dirPublic = path.join(__dirname, "../public")
const dirNode_modules = path.join(__dirname, '../node_modules')

//Static
app.use(express.static(dirPublic))
app.use('/css', express.static(dirNode_modules + '/bootstrap/dist/css'));
app.use('/js', express.static(dirNode_modules + '/jquery/dist'));
app.use('/js', express.static(dirNode_modules + '/popper.js/dist'));
app.use('/js', express.static(dirNode_modules + '/bootstrap/dist/js'));

//BodyParser
app.use(bodyParser.urlencoded({ extended: false }));

//Routes
app.use(require('./routes/index'));

mongoose.connect(process.env.URLDB, { useNewUrlParser: true }, (err) => {
	if (err) {
		return console.log(err);
	}
	console.log('Conectado Mongo db');
});

app.listen(process.env.PORT, () => {
	console.log('servidor en el puerto ' + process.env.PORT)
});