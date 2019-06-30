const mongoose = require('mongoose')
var uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const cursosSchema = new Schema({
    nombre: {
        type: String,
        required: true,
        unique: true
        //trim:true       
    },
    password: {
        type: String,
        required: true
    },
    matematicas: {
        type: Number,
        default: 0,
        min: 0,
        max: [5, 'Ingrece un numero menor para matematicas']
    },
    ingles: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    }
})

cursosSchema.plugin(uniqueValidator);
const Estudiante = mongoose.model('Estudiante', estudianteSchema);

module.exports = Estudiante