const mongoose = require('mongoose')
var uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const cursosSchema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    nombre: {
        type: String,
        required: true
    },
    descripcion: {
        type: String,
        required: true
    },
    valor: {
        type: Number,
        default: 0,
        min: 0,
    },
    modalidad: {
        type: String,
        default: '',
    },
    intensidad: {
        type: Number,
        default: 0,
        min: 0,
    },
    estado: {
        type: String,
        required: true
    },
    docente:{
        type:String
    }
})

cursosSchema.plugin(uniqueValidator);
const Cursos = mongoose.model('Cursos', cursosSchema);

module.exports = Cursos