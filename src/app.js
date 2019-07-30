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
mongoose.connect('mongodb+srv://fede:fede@cluster0-2wst6.mongodb.net/gestion_cursos?retryWrites=true&w=majority', { useNewUrlParser: true }, (err) => {
	if (err) {
		return console.log(err);
	}
	console.log('Conectado Mongo db');
});

server.listen(process.env.PORT, () => {
	console.log('servidor en el puerto ' + process.env.PORT)


});
var Usuarios = require('./models/usuarios');
var notificaciones = require('./models/notifications');
const { UsuariosSockets } = require('./models/usuariosSocket');
const usuarioSocket = new UsuariosSockets();
io.on('connection', client => {
	
client.on("getMessage",(usuario)=>{
	console.log("getmessage");
	
		console.log(usuario)
	
		Usuarios.findOne({ _id: usuario }, (err, result) => {
			if (err) {
				return console.log(err);
			}
			if(result==null) return;
			console.log("result:")
			console.log(result)
			notificaciones.find({
				$and:
					[{
						$or:
							[
								{ idUsuario: result._id },
								{ idUsuario: "" }
							]
					},
					{
						$or:
							[
								{ tipoUsuario: result.tipo },
								{ tipoUsuario: "" }
							]
					}, { estado: 0 }]
			}, (err, result2) => {

				if (err) {
					return console.log(err);
				}
				console.log("result2:")
				console.log(result2)
				result2.forEach(message => {
					console.log("enviando ah "+client.id +" "+message.texto);
					client.emit("mensaje", message.texto);
					//client.to(client.id).emit("mensaje", message.texto);
					// notificaciones.findOneAndUpdate({ _id: message._id }, { estado: 1 }, (err, result3) => {

					// 	console.log("result3:")
					// 	console.log(result3)

					// 	if (err) {
					// 		return console.log(err);
					// 	} else { console.log("mensaje enviado") };
					// })

				});
			}).limit(5);
		});

	

})


	client.emit("mensaje", "Conectado")

	client.on('usuarioNuevo', (usuario) => {
		if(usuario !="no hay nada"){
		usuarioSocket.agregarUsuario(client.id, usuario);
		console.log(usuarioSocket.getUsuarios());
	}
	})
	client.on('notifications', client => {
		console.log("notificacion")
	})

	client.on("disconnect", () => {
		let usuarioBorrado = usuarioSocket.borrarUsuario(client.id);
		console.log("Usuario borrado:" + usuarioBorrado)
	})

});

	// io.on('notifications',client =>{
	// 	console.log("notificacion")
	// })

