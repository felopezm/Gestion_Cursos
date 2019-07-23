const mongoose = require('mongoose')
var uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const usuariosSchema = new Schema({
    cedula: {
        type: String,
        required: true,
        unique: true
        //trim:true       
    },
    nombre: {
        type: String,
        required: true
    },
    email: {
        type: String,
        requeired:true,
        unique: true,
        trim:true
    },
    telefono: {
        type: Number,
        required:true
    },
    tipo:{
        type:Number,
        required:true,
        enum:{values:[1,2,3]}

    },
    password:{
        type: String,
        required: true
    },
    foto:{
        type:Buffer
    }
})

usuariosSchema.plugin(uniqueValidator);
const Usuario = mongoose.model('Usuario', usuariosSchema);

module.exports = Usuario