const hbs = require('hbs');

hbs.registerHelper('cursos', () => {
    cursos = require('../cursos.json');
    let inscrip = `<tbody>`;
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
    inscrip += `</tbody>`;
    return inscrip;
});

hbs.registerHelper('cursos_disponibles', (cursos) => {
    let inscrip = ``;
    cursos.forEach(datos => {
        if (datos.estado != "CERRADO") {
            inscrip += `<div class="col-md-6">
            <div class="panel panel-primary">
                <div class="panel-heading">
                    <h3 class="panel-title">${datos.nombre}  -  ${datos.descripcion}  -  $ ${datos.valor} <span class="pull-right clickable panel-collapsed">Ver Detalles</span></h3>
                </div>
                <div class="panel-body" style="display: none;">                     
                   <b> => ID </b>:  ${datos.id} <br>
                   <b> => NOMBRE </b>:  ${datos.nombre} <br>
                   <b> => DESCRIPCIÓN </b>:  ${datos.descripcion} <br>
                   <b> => VALOR </b>:  ${datos.valor}<br>
                   <b> => MODALIDAD </b>:  ${datos.modalidad}<br>
                   <b> => INTENSIDAD H. </b>:  ${datos.intensidad}<br>
                </div>
            </div>
        </div>`;
        }
    });
    return inscrip;
});

hbs.registerHelper('cursos_inscripcion', () => {
    cursos = require('../cursos.json');
    let inscrip = ``;
    cursos.forEach(datos => {
        if (datos.estado != "CERRADO") {
            inscrip += `
                        <option value="${datos.id}">${datos.nombre}</option>
                       `;
        }
    });

    return inscrip;
});

hbs.registerHelper('cursos_actualizar', () => {
    cursos = require('../cursos.json');
    let inscrip = ``;
    cursos.forEach(datos => {
            inscrip += `
                        <option value="${datos.id}">${datos.nombre}</option>
                       `;
    });

    return inscrip;
});

hbs.registerHelper('estudiantes_por_curso', () => {
    cursos = require('../cursos.json');
    inscripciones = require('../inscripciones.json')
    let curso_inscrip = ``;
    for (let i = 0; i < cursos.length; i++) {
        let curso = cursos[i];
        let estudiantes = ``;
        for (let j = 0; j < inscripciones.length; j++) {
            let inscripcion = inscripciones[j];
            if (inscripcion.id_curso == curso.id) {
                estudiantes += `<form id="formEstudenBycourse" action="viewEstudenByCourse" method="post">
                                => ESTUDIANTE: ${inscripcion.nombre} 
                                    <div class="row">
                                    <div class="col-sm-6">
                                        <input type="text" class="form-control" name="cedula"
                                            value="${inscripcion.cedula}">
                                    </div>
                                    <div class="col-sm-2">
                                        <input type="text" name="id_curso" class="form-control"  value="${inscripcion.id_curso}">
                                    </div>
                                    <div class="col-sm-2">
                                         <button class="btn btn-primary btn-xs">Eliminar</button>
                                    </div>
                                </div>
                                </form>`;
            }
        }
        curso_inscrip += `<div class="col-md-6">
        <div class="panel panel-primary">
            <div class="panel-heading">
                <h3 class="panel-title">${curso.nombre} <span class="pull-right clickable panel-collapsed">Ver Detalles</span></h3>
            </div>
            <div class="panel-body" style="display: none;">  
               ${estudiantes}
            </div>
        </div>
    </div>`;
    }
    return curso_inscrip;
});

hbs.registerHelper('cursos_del_estudiante', () => {
    cursos = require('../cursos.json');
    session = require('../session.json');
    inscripciones = require('../inscripciones.json')
    let curso_inscrip = ``;
    for (let i = 0; i < cursos.length; i++) {
        let curso = cursos[i];
        for (let j = 0; j < inscripciones.length; j++) {
            let inscripcion = inscripciones[j];
            if (inscripcion.id_curso == curso.id && inscripcion.cedula == session.usuario) {
                curso_inscrip += `<div class="col-md-6">
                <div class="panel panel-primary">
                    <div class="panel-heading">
                        <h3 class="panel-title">${curso.nombre} <span class="pull-right clickable panel-collapsed">Ver Detalles</span></h3>
                    </div>
                    <div class="panel-body" style="display: none;">  
                        <form id="formCourseEstuden" action="viewCoursesOffEstuden" method="post">
                        => ESTUDIANTE: ${inscripcion.nombre} 
                            <div class="row">
                            <div class="col-sm-6">
                                <input type="text" class="form-control" name="cedula"
                                    value="${inscripcion.cedula}">
                            </div>
                            <div class="col-sm-2">
                                <input type="text" name="id_curso" class="form-control"  value="${inscripcion.id_curso}">
                            </div>
                            <div class="col-sm-2">
                                <button class="btn btn-primary btn-xs">Eliminar</button>
                            </div>
                        </div>
                        </form>
                    </div>
                </div>
            </div>`;  
            }
        }
  
    }
    return curso_inscrip;
});