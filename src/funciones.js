const fs = require('fs');
let cursos = [];
let inscripciones = [];

const listar_cursos = () => {
    try {
        cursos = require('./cursos.json')
    } catch (error) {
        cursos = [];
    }
} 

const listar_inscripciones = () => {
    try {
        inscripciones = require('./inscripciones.json')
    } catch (error) {
        inscripciones = [];
    }
} 


const ver_cursos = () => {
    listar_cursos();
    if (inscripciones.length == 0) {
        console.log(`No hay cursos, que mostrar`);
    } else {
        let inscrip = ``;
        cursos.forEach(datos => {
            inscrip += `<tr>
                            <td>${datos.id}</td>
                            <td>${datos.nombre}</td>
                            <td>${datos.descripcion}</td>
                            <td>${datos.valor}</td>
                            <td>${datos.modalidad}</td>
                            <td>${datos.intensidad}</td>
                            <td>${datos.estado}</td>
                        </tr>`;
        });
        return inscrip;
    }
}

const crear_curso = curso => {
    listar_cursos();
    let duplicado = cursos.find(data => data.id == curso.id)
    if (!duplicado) {
        curso.estado = 'DISPONIBLE';
        cursos.push(curso);
        guardar_curso();
        return true;
    } else {
        console.log(`El id del curso ya existe`);
        return false;
    }
}

const actualizar_curso = (curso_) => {
    listar_cursos();
    let curso = cursos.find(data => data.id == curso_.id)
    if (curso) {
        curso["estado"] = curso_.estado;
        guardar_curso();
        return true;
    } else {
        console.log(`Error, curso no existe`);
        return false;
    }
}

const guardar_curso = () => {
    let new_curso = JSON.stringify(cursos);
    fs.writeFile('src/cursos.json', new_curso, (err) => {
        if (err) throw (err);     
        console.log(`Curso guardo con exito`);
    })
}

const crear_inscripcion = inscripcion => {
    listar_inscripciones();
    let duplicado = inscripciones.find(data => data.id_curso == inscripcion.id_curso && data.cedula == inscripcion.cedula)
    if (!duplicado) {
        inscripciones.push(inscripcion);
        guardar_inscripcion();
        return true;
    } else {
        console.log(`El estudiante ya esta registrado en este curso`);
        return false;
    }
}

const guardar_inscripcion = () => {
    let new_inscripciones = JSON.stringify(inscripciones);
    fs.writeFile('src/inscripciones.json', new_inscripciones, (err) => {
        if (err) throw (err);     
        console.log(`Inscripcion guardada con exito`);
    })
}

const eliminar_estudiante = (estudiante) => {
    listar_inscripciones();  
    let nuevas_inscripciones = inscripciones.filter(eliminar => estudiante.cedula != eliminar.cedula || estudiante.id_curso != eliminar.id_curso);
    if (nuevas_inscripciones.length == inscripciones.length) {
        console.log('Ningún estudiante tiene la cedula a eliminar');
        return false;
    } else {
        inscripciones = nuevas_inscripciones;
        guardar_inscripcion();
        console.log('El estudiante eliminado correctamente');
        return true;
    }
}

module.exports = {
    crear_curso,
    ver_cursos,
    crear_inscripcion,
    actualizar_curso,
    eliminar_estudiante
}