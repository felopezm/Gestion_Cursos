//Requires
require('./config/config');
require('./helpers/helpers');
const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const server = require('http').createServer(app);
const io = require('socket.io')(server);



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

//Conection BD
mongoose.connect('mongodb+srv://fede:fede@cluster0-2wst6.mongodb.net/gestion_cursos?retryWrites=true&w=majority' , { useNewUrlParser: true }, (err) => {
	if (err) {
		return console.log(err);
	}
	console.log('Conectado Mongo db');
});

server.listen(process.env.PORT, () => {
	console.log('servidor en el puerto ' + process.env.PORT)


});
var Cursos = require('./models/cursos');

io.on('connection', client => {
	console.log("connect");

	client.emit("mensaje","Conectado")
	
	});
	
	io.on('notifications',client =>{
		console.log("notificacion")
	})