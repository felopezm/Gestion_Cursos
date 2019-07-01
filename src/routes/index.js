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
        estado: 'DISPONIBLE',
        docente:''
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

  Cursos.find({}).exec((err, result) => {
        if (err) {
           return console.log(err);
        }
        return res.render('inscriptCourse', {
            error_inscripcion: '',
            cursos: result
        });
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

    console.log(req);

    if(req.body.estado=="CERRADO" && req.body.docente==""){
        Cursos.find({}).exec((err, result) => {
            if (err) {
                return console.log(err);
            }
            res.render('updateCourse', {
                error_actualizar: 'Por favor ingrese cedula del docente',
                cursos: result
            });
        })

    }
    Cursos.findOneAndUpdate({ id: req.body.id }, req.body, { new: true, runValidators: true, context: 'query' }, (err, result) => {
        if (err) {

            Cursos.find({}).exec((err, result) => {
                if (err) {
                    return console.log(err);
                }
                res.render('updateCourse', {
                    error_actualizar: 'Error al actualizar el estado del curso, ' + err,
                    cursos: result
                });
            })
            
        }
        res.render('indexcoordinador', {
            mensaje: `Curso ${result.nombre}, Actualizado Correctamente`
        })
    })
});



/*
* ---Estudiantes por curso docente
*/
app.get('/viewEstudenByCourseDoc', (req, res) => {
    Usuarios.findOne({_id:req.session.usuario}).exec((err,result)=>{


        Cursos.find({docente:result.cedula}).exec((err, result2) => {
            if (err) {       
                return console.log(err);
            }
            let cursos = result2;
            Inscripciones.find({}).exec((err, result3) => {
                if (err) {          
                    return console.log(err);
                }
                res.render('viewEstudenByCourseDoc', {
                    mensaje: '',
                    cursos: cursos,
                    inscripciones: result3
                });
            })
        })

    });

    
});
app.post('/viewEstudenByCourseDoc', (req, res) => {

});




/*
* ---Estudiantes por curso
*/
app.get('/viewEstudenByCourse', (req, res) => {
    Cursos.find({}).exec((err, result) => {
        if (err) {       
            return console.log(err);
        }
        let cursos = result;
        Inscripciones.find({}).exec((err, result2) => {
            if (err) {          
                return console.log(err);
            }
            res.render('viewEstudenByCourse', {
                mensaje: '',
                cursos: cursos,
                inscripciones: result2
            });
        })
    })
});
app.post('/viewEstudenByCourse', (req, res) => {
	Inscripciones.findOneAndDelete({ _id: req.body._id }, req.body, (err, result) => {
		if (err)
			return  res.render('viewEstudenByCourse', {
                mensaje: 'Error al eliminar el estudiante' + err
            });

		if (!result) {
			res.render('eliminar', {
				nombre: 'No encontrado',
			})
		}
	    res.render('indexcoordinador', {
            mensaje: 'Estudiante Eliminado Correctamente'
        });
	})
});
/*
* ---Cursos del estudiante
*/
app.get('/viewCoursesOffEstuden', (req, res) => {

    
    Cursos.find({}).exec((err, result) => {
    
        if (err) {       
            return console.log(err);
        }
        let cursos = result;
        Inscripciones.find({}).exec((err, result2) => {
            if (err) {          
                return console.log(err);
            }
            let inscripciones =result2
            Usuarios.findOne({_id:req.session.usuario}).exec((err, result3) => {
                if (err) {          
                    return console.log(err);
                }
               
                res.render('viewCoursesOffEstuden', {
                    mensaje: '',
                    cursos: cursos, 
                    inscripciones: inscripciones, 
                    usuario:result3
                });

            })
         
        })
    })

    
});
app.post('/viewCoursesOffEstuden', (req, res) => {
 
    
    Inscripciones.findOneAndDelete({ cedula: req.body.cedula, id_curso:req.body.id_curso }, req.body, (err, result) => {
		if (err)
			return  res.render('indexaspirante', {
                mensaje: 'Error al eliminar el estudiante' + err
            });

		if (!result) {
			res.render('indexaspirante', {
				nombre: 'No encontrado',
			})
		}
	    res.render('indexaspirante', {
            mensaje: 'Estudiante Eliminado Correctamente'
        });
	})

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
                res.render('indexdocente', {
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