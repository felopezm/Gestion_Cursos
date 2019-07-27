const mongoose = require('mongoose')
var uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const notificationsSchema = new Schema({
  
    estado: {
        type: Number,
        required: true
    },
    texto: {
        type: String,
        required: true
    },
    idUsuario: {
        type: String,
        required:true
    },
    tipoUsuario: {
        type: String,
        default: '',
    },
    

})

notificationsSchema.plugin(uniqueValidator);
const Notifications = mongoose.model('notifications', notificationsSchema);

module.exports = Notifications