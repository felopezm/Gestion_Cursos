const express = require('express')
const app = express()
const path = require('path')
const hbs = require('hbs')
const funciones = require('../funciones')
const Cursos = require('./../models/cursos')
const Usuarios = require('./../models/usuarios')
const Inscripciones = require('./../models/inscripciones')
const bcrypt = require('bcrypt')
const session = require('express-session')
//Paths
const dirViews = path.join(__dirname, '../../template/views')
const dirPartials = path.join(__dirname, '../../template/partials')

require('./../helpers/helpers')
//Session
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true

}))


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

    let cursos = Cursos.find({}).exec((err, result) => {

        if (err) {
            console.log(err);
            return [];
        }


        res.render('inscriptCourse', {
            error_inscripcion: '',
            cursos: result
        });
        return;
    });


});
app.post('/inscriptCourse', (req, res) => {
    getDuplicadoInscripcourse(req, res);
});

async function getDuplicadoInscripcourse(req, res) {

    let inscripcion = new Inscripciones({
        id_curso: req.body.id_curso,
        cedula: req.body.cedula,
        nombre: req.body.nombre,
        email: req.body.email,
        telefono: req.body.telefono

    });
    let consulta = Inscripciones.find({ cedula: req.body.cedula, id_curso: req.body.id_curso });
    let duplicado2 = await consulta.exec();
    let consulta2 = Cursos.find({});
    let cursos = await consulta2.exec();
    if (duplicado2.length > 0) {
        return res.render('inscriptCourse', {
            error_inscripcion: 'Usuario ya esta registrado en este curso',
            cursos: cursos
        });
    }
    inscripcion.save((err, result) => {
        console.log(err)
        if (err) {
            return res.render('inscriptCourse', {
                error_inscripcion: 'Error al registrar' + err,
                cursos: cursos
            });
        }
        return res.render('inscriptCourse', {
            mensaje: 'registro exitoso',
            cursos: cursos
        });
    })
}
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
            cursos: result
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


    Usuarios.findOne({ email: req.body.usuario }, (err, result) => {
        if (err)
            return console.log(err);

        if (!result) {
            return res.render('login', {
                mensaje: 'Usuario no encontrado',
            })
        }
        if (!bcrypt.compareSync(req.body.password, result.password)) {
            return res.render('login', {
                mensaje: 'Contraseña no es correcta'
            }
            )
        }

        switch (result.tipo) {

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

        req.session.usuario = result._id;
        console.log(req.session.tipoUsuario);

    });
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


    let usuario = new Usuarios({
        cedula: req.body.cedula,
        nombre: req.body.nombre,
        email: req.body.email,
        telefono: req.body.telefono,
        tipo: 1,
        password: bcrypt.hashSync(req.body.cedula, 10)
    });

    usuario.save((err, result) => {
        console.log(err)
        if (err) {
            return res.render('register', {
                error_inscripcion: 'Error al registrar' + err
            });

        }
        res.render('login', {
            mensaje: 'Usuario creado con exito ' + result.nombre
        });
    })
});
/*
* ---gestio usuario
*/
app.get('/gestionUsuarios', (req, res) => {
    Usuarios.find({}).exec((err, result) => {
        if (err) {
            return res.render('gestionUsuarios', {
                mensaje: `<p style="color:red">Error ${err}</p>`,
                usuarios: []
            });
        }
        res.render('gestionUsuarios', {
            mensaje: '',
            usuarios: result
        });
    })
});
app.post('/gestionUsuarios', (req, res) => {
    Usuarios.findOneAndUpdate({ cedula: req.body.cedula }, req.body, { new: true, runValidators: true, context: 'query' }, (err, result) => {
        if (err) {
            return res.render('gestionUsuarios', {
                mensaje: `<p style="color:red">Error ${err}</p>`,
                usuarios: []
            })
        }
        else if (result) {
            Usuarios.find({}).exec((err, result) => {
                if (err) {
                    return res.render('gestionUsuarios', {
                        mensaje: `<p style="color:red">Error ${err}</p>`,
                        usuarios: []
                    })
                }
                res.render('gestionUsuarios', {
                    mensaje: '<p style="color:green">Cambio exitoso </p>',
                    usuarios: result
                });
            })
        } else {
            Usuarios.find({}).exec((err, result) => {
                if (err) {
                    return res.render('gestionUsuarios', {
                        mensaje: `<p style="color:red">Error ${err}</p>`,
                        usuarios: []
                    })
                }
                res.render('gestionUsuarios', {
                    mensaje: '<p style="color:red">Usuario no existe, validar cedula </p>',
                    usuarios: result
                })
            })
        }
    })
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