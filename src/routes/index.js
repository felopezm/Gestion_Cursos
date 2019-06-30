const express = require('express')
const app = express()
const path = require('path')
const hbs = require('hbs')
const funciones = require('../funciones')
const Cursos = require('./../models/cursos')

//Paths
const dirViews = path.join(__dirname, '../../template/views')
const dirPartials = path.join(__dirname, '../../template/partials')

require('./../helpers/helpers')

//hbs
app.set('view engine', 'hbs')
app.set('views', dirViews)
hbs.registerPartials(dirPartials)

app.get('/index', (req, res) => {
    res.render('index', {
        mensaje: ''
    });
});
app.get('/indexaspirante', (req, res) => {
    res.render('indexaspirante', {
        mensaje: ''
    });
});
app.get('/indexcoordinador', (req, res) => {
    res.render('indexcoordinador', {
        mensaje: ''
    });
});

/*
* ---Agregar un nuevo curso
*/
app.get('/addCourse', (req, res) => {
    Cursos.find({}).exec((err, result) => {  // dentro del find pueden ir las condiciones de la consulta
		if (err) {
			return console.log(err);
		}
        res.render('addCourse', {
            cursos: result
        });
	})
});
app.post('/addCourse', (req, res) => {
    let curso = new Cursos({
        id: req.body.id,
        nombre: req.body.nombre,
        descripcion: req.body.descripcion,
        valor: req.body.valor,
        modalidad: req.body.modalidad,
        intensidad: req.body.intensidad,
        estado: 'DISPONIBLE'
    });
    curso.save((err, result) => {
        if (err) {
           return res.render('addCourse', {
                duplicado: 'Error al guardar el curso ' + err,
                cursos: []
            });
        }
        res.render('indexcoordinador', {
            mensaje: 'Curso creado correctamente ' + result.nombre
        });
    })
});

/*
* ---Ver cursos disponibles
*/
app.get('/viewCourse', (req, res) => {
    Cursos.find({}).exec((err, result) => {  // dentro del find pueden ir las condiciones de la consulta
		if (err) {
			return console.log(err);
		}
		res.render('viewCourse', {
			cursos: result
		})
	})
});

/*
* --- realizar inscripcion al curso
*/
app.get('/inscriptCourse', (req, res) => {
    res.render('inscriptCourse', {
        error_inscripcion: ''
    });
});
app.post('/inscriptCourse', (req, res) => {
    if (!req.body.id_curso) {
        res.render('inscriptCourse', {
            error_inscripcion: 'Debes seleccionar un Curso'
        });

    } else {
        let save = funciones.crear_inscripcion(req.body);
        if (save) {
            res.render('indexaspirante', {
                mensaje: 'Inscripción creada correctamente'
            });
        } else {
            res.render('inscriptCourse', {
                error_inscripcion: 'El estudiante ya esta registrado en este curso'
            });
        }
    }
});

/*
* ---actualizar curso
*/
app.get('/updateCourse', (req, res) => {
    Cursos.find({}).exec((err, result) => { 
		if (err) {
			return console.log(err);
		}
        res.render('updateCourse', {
            error_actualizar: '',
            cursos:result
        });
	})

});
app.post('/updateCourse', (req, res) => {
    Cursos.findOneAndUpdate({ id: req.body.id }, req.body, { new: true, runValidators: true, context: 'query' }, (err, result) => {
		if (err) {
            return res.render('updateCourse', {
                error_actualizar: 'Error al actualizar el estado del curso, ' + err
            });
		} 
		res.render('indexcoordinador', {
            mensaje: `Curso ${result.nombre}, Actualizado Correctamente`
		})
    })
});

/*
* ---Estudiantes por curso
*/
app.get('/viewEstudenByCourse', (req, res) => {
    res.render('viewEstudenByCourse', {
        mensaje: ''
    });
});
app.post('/viewEstudenByCourse', (req, res) => {
    let delete_ = funciones.eliminar_estudiante(req.body);
    if (delete_) {
        res.render('indexcoordinador', {
            mensaje: 'Estudiante Eliminado Correctamente'
        });
    } else {
        res.render('viewEstudenByCourse', {
            mensaje: 'Error al eliminar el estudiante'
        });
    }
});
/*
* ---Cursos del estudiante
*/
app.get('/viewCoursesOffEstuden', (req, res) => {
    res.render('viewCoursesOffEstuden', {
        mensaje: ''
    });
});
app.post('/viewCoursesOffEstuden', (req, res) => {
    let delete_ = funciones.eliminar_estudiante(req.body);
    if (delete_) {
        res.render('indexaspirante', {
            mensaje: 'Estudiante Eliminado Correctamente'
        });
    } else {
        res.render('viewCoursesOffEstuden', {
            mensaje: 'Error al eliminar el estudiante'
        });
    }
});
/*
* ---login
*/
app.get('/', (req, res) => {

    res.render('login', {
        mensaje: ''
    });
});

app.post('/login', (req, res) => {
    let tipo = funciones.get_usuarioLogin(req.body.usuario, req.body.password);
    switch (tipo) {
        case 0:
            res.render('login', {
                mensaje: 'Usuario no existe'
            });
            break;
        case 1:
            res.render('indexaspirante', {
                mensaje: ''
            });
            break;
        case 2:
            res.render('index', {
                mensaje: ''
            });
            break;
        case 3:
            res.render('indexcoordinador', {
                mensaje: ''
            });
            break;
        default:
            break;
    }
});

/*
* --- realizar inscripcion usuario
*/

app.get('/register', (req, res) => {
    res.render('register', {
        error_inscripcion: ''
    });
});
app.post('/register', (req, res) => {


    let save = funciones.crear_usuario(req.body);
    if (save) {
        res.render('login', {
            mensaje: 'Inscripción creada correctamente'
        });
    } else {
        res.render('register', {
            error_inscripcion: 'El usuario ya esta registrado'
        });

    }
});

/*
* ---gestio usuario
*/

app.get('/gestionUsuarios', (req, res) => {

    let tabla = funciones.tablar_usuarios();
    console.log(tabla);
    res.render('gestionUsuarios', {
        error_inscripcion: '',
        tabla_usuarios: tabla
    });
});
app.post('/gestionUsuarios', (req, res) => {

    let result = funciones.actualizar_TipoUsuario(req.body.cedula, req.body.tipo);
    if (result) {
        let tabla = funciones.tablar_usuarios();
        console.log(tabla);
        res.render('gestionUsuarios', {
            mensaje: 'cambio exitoso',
            tabla_usuarios: tabla
        });
    }
    else {
        let tabla = funciones.tablar_usuarios();
        console.log(tabla);
        res.render('gestionUsuarios', {
            error_inscripcion: 'usuario no existe',
            tabla_usuarios: tabla
        });
    }

});

/*
* ---Si ahi algun error en la url
*/

app.get('*', (req, res) => {
    res.render('error', {
        estudiante: 'error'
    });
});

module.exports = app