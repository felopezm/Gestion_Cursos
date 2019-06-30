const mongoose = require('mongoose')
var uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const inscripcionesSchema = new Schema({
    id_curso: {
        type: Number,
        required: true,
        
        //trim:true       
    },
    cedula: {
        type: String,
        required: true,
   
        //trim:true       
    },
    nombre: {
        type: String,
        required: true
    },
    email: {
        type: String,
        requeired:true,
       
    },
    telefono: {
        type: Number,
        required:true
    }
   
})

inscripcionesSchema.plugin(uniqueValidator);
const inscripcion = mongoose.model('Inscripcion', inscripcionesSchema);

module.exports = inscripcion