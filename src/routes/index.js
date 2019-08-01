const express = require('express')
const app = express()
const path = require('path')
const hbs = require('hbs')
const Cursos = require('./../models/cursos')
const Usuarios = require('./../models/usuarios')
const Notifications=require('./../models/notifications')
const Inscripciones = require('./../models/inscripciones')
const bcrypt = require('bcrypt')
const session = require('express-session')
const multer  = require('multer')
const sgMail = require('@sendgrid/mail')


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



// send email
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

//hbs
app.set('view engine', 'hbs')
app.set('views', dirViews)
hbs.registerPartials(dirPartials)

app.get('/index', (req, res) => {
    res.render('index', {
        mensaje: ''
        ,indexcoordinador: req.session.usuario
    });
});
app.get('/indexaspirante', (req, res) => {
    res.render('indexaspirante', {
        mensaje: ''
        ,indexcoordinador: req.session.usuario
    });
});
app.get('/indexdocente', (req, res) => {
    res.render('indexdocente', {
        mensaje: ''
        ,indexcoordinador: req.session.usuario
    });
});
app.get('/indexcoordinador', (req, res) => {
    res.render('indexcoordinador', {
        mensaje: ''
        ,indexcoordinador: req.session.usuario
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
            ,indexcoordinador: req.session.usuario
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
        docente: ''
    });
    curso.save((err, result) => {
        if (err) {
            return res.render('addCourse', {
                duplicado: 'Error al guardar el curso ' + err,
                cursos: []
                ,indexcoordinador: req.session.usuario
            });
        }
        res.render('indexcoordinador', {
            mensaje: 'Curso creado correctamente ' + result.nombre
            ,indexcoordinador: req.session.usuario
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
            ,indexcoordinador: req.session.usuario
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
            ,indexcoordinador: req.session.usuario
        });
    });
});
app.post('/inscriptCourse', (req, res) => {
    getDuplicadoInscripcourse(req, res);
    

});

function registerNotification(texto,usuario,tipo){
    console.log("registrar notificacion")
    let notification =new Notifications({
        estado:0,
        texto:texto,
        idUsuario:usuario,
        tipoUsuario:tipo
    });
    notification.save((err, result) => {
       console.log(err+"/"+result);
    })
}

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
            ,indexcoordinador: req.session.usuario
        });
    }
    inscripcion.save((err, result) => {
        console.log(err)
        if (err) {
            return res.render('inscriptCourse', {
                error_inscripcion: 'Error al registrar' + err,
                cursos: cursos
                ,indexcoordinador: req.session.usuario
            });
        }

        Cursos.findOne({_id:inscripcion.id_curso},(err,result)=>{

            if(err){
                return;
            }
            if(result.docente != null || result.docente!=""){
                Usuarios.findOne({cedula:result.docente},(err,result2)=>{

                    if(err){return;}
                    registerNotification("Se ha inscrito un estudiante al curso",result2._id,"2");

                })
                

            }
          

        })
       
        return res.render('inscriptCourse', {
            mensaje: 'registro exitoso',
            cursos: cursos
            ,indexcoordinador: req.session.usuario
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
            ,indexcoordinador: req.session.usuario
        });
    })

});
app.post('/updateCourse', (req, res) => {

    console.log(req);

    if (req.body.estado == "CERRADO" && req.body.docente == "") {
        Cursos.find({}).exec((err, result) => {
            if (err) {
                return console.log(err);
            }
            res.render('updateCourse', {
                error_actualizar: 'Por favor ingrese cedula del docente',
                cursos: result
                ,indexcoordinador: req.session.usuario
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
                    ,indexcoordinador: req.session.usuario
                });
            })

            Usuarios.findOne({cedula: req.body.docente },(err,result)=>{
                if(err){return;}
                registerNotification("Se le ah asignado el curso"+req.body.nombre,result._id,"2");

            });

            Inscripciones.find({id_curso:req.body.id},(err2,result2)=>{
                if(err2){return;}
                result2.forEach(estudiante => {
                    Usuarios.findOne({cedula:estudiante.cedula},(err3,result3)=>{
                        if(err3){return;}
                        registerNotification("El curso "+req.body.nombre+" esta por comenzar",result3._id,"1")
                    })
                });

            })

        }
        res.render('indexcoordinador', {
            mensaje: `Curso ${result.nombre}, Actualizado Correctamente`
            ,indexcoordinador: req.session.usuario
        })
    })
});



/*
* ---Estudiantes por curso docente
*/
app.get('/viewEstudenByCourseDoc', (req, res) => {

    Usuarios.findOne({ _id: req.session.usuario }).exec((err, result) => {


        Cursos.find({ docente: result.cedula }).exec((err, result2) => {
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
                    ,indexcoordinador: req.session.usuario
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
                ,indexcoordinador: req.session.usuario
            });
        })
    })
});
app.post('/viewEstudenByCourse', (req, res) => {
    Inscripciones.findOneAndDelete({ _id: req.body._id }, req.body, (err, result) => {
        if (err)
            return res.render('viewEstudenByCourse', {
                mensaje: 'Error al eliminar el estudiante' + err
                ,indexcoordinador: req.session.usuario
            });

        if (!result) {
            res.render('eliminar', {
                nombre: 'No encontrado'
                ,indexcoordinador: req.session.usuario
            })
        }
        res.render('indexcoordinador', {
            mensaje: 'Estudiante Eliminado Correctamente'
            ,indexcoordinador: req.session.usuario
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
            let inscripciones = result2
            Usuarios.findOne({ _id: req.session.usuario }).exec((err, result3) => {
                if (err) {
                    return console.log(err);
                }

                res.render('viewCoursesOffEstuden', {
                    mensaje: '',
                    cursos: cursos,
                    inscripciones: inscripciones,
                    usuario: result3
                    ,indexcoordinador: req.session.usuario
                });

            })

        })
    })


});
app.post('/viewCoursesOffEstuden', (req, res) => {


    Inscripciones.findOneAndDelete({ cedula: req.body.cedula, id_curso: req.body.id_curso }, req.body, (err, result) => {
        if (err)
            return res.render('indexaspirante', {
                mensaje: 'Error al eliminar el estudiante' + err
                ,indexcoordinador: req.session.usuario
            });

        if (!result) {
            res.render('indexaspirante', {
                nombre: 'No encontrado'
                ,indexcoordinador: req.session.usuario
            })
        }
        res.render('indexaspirante', {
            mensaje: 'Estudiante Eliminado Correctamente'
            ,indexcoordinador: req.session.usuario
        });
    })

});
/*
* ---login
*/
app.get('/', (req, res) => {

    res.render('login', {
        mensaje: ''
        ,indexcoordinador: req.session.usuario
    });
});

app.post('/login', (req, res) => {


    Usuarios.findOne({ email: req.body.usuario }, (err, result) => {
        if (err)
            return console.log(err);

        if (!result) {
            return res.render('login', {
                mensaje: 'Usuario no encontrado'
                ,indexcoordinador: req.session.usuario
            })
        }
        if (!bcrypt.compareSync(req.body.password, result.password)) {
            return res.render('login', {
                mensaje: 'Contraseña no es correcta'
                ,indexcoordinador: req.session.usuario
            }
            )
        }

        switch (result.tipo) {

            case 1:
                res.render('indexaspirante', {
                    mensaje: '',
                    idUser: result._id
                    ,indexcoordinador: req.session.usuario
                });
                break;
            case 2:
                res.render('indexdocente', {
                    mensaje: '',
                    idUser: result._id
                    ,indexcoordinador: req.session.usuario
                });
                break;
            case 3:
                res.render('indexcoordinador', {
                    mensaje: '',
                    idUser: result._id
                    ,indexcoordinador: req.session.usuario
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
        ,indexcoordinador: req.session.usuario
    });
});

// Esto es para subir los archivos al server
// var storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, 'public/uploads')
//     },
//     filename: function (req, file, cb) {
//       cb(null,'img_' + req.body.cedula + path.extname(file.originalname))
//     }
//   })
//   var upload = multer({ storage: storage })

var upload = multer({
    limits: {
        fileSize: 10000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|png|jpeg)$/)) {
            return cb(new Error('No es un archivo valido'))
        }
        cb(null, true)
    }
})
app.post('/register',upload.single('foto'), (req, res) => {
    let usuario = new Usuarios({
        cedula: req.body.cedula,
        nombre: req.body.nombre,
        email: req.body.email,
        telefono: req.body.telefono,
        tipo: 1,
        password: bcrypt.hashSync(req.body.cedula, 10),
        foto:req.file.buffer
    });
    const msg = {
        to: req.body.email,
        from: 'fedelopezm1@gmail.com',
        subject: 'Bienvenido a la Gestión de Cursos TDA.',
        text: ``,
        html: `<strong>Bienvenido estudiante ${req.body.nombre} a la plataforma de Gestión de cursos TDA,
               El TDA le da la calurosa bienvenida a nuestra nueva plataforma para la gestion de Cursos.<br><br>
               Para iniciar tu sesion es utilizar tu correo electronico más tu identificación.<br><br> 
               Cordialmente,</strong><br><br>
                <img src="https://gestioncursos.herokuapp.com/img/banner.png">`,
       };

    usuario.save((err, result) => {
        console.log(err)
        if (err) {
            return res.render('register', {
                error_inscripcion: 'Error al registrar' + err
                ,indexcoordinador: req.session.usuario
            });
            
        }
        //crear notificacion registro usuarios
        Usuarios.find({tipo:3}, (err,result)=>{
            if(err){
                console.log(err);
                return;
            }
            result.forEach(user => {
                registerNotification("Se ha registrado el usuar:"+usuario.email,user._id,user.tipo);
            });

        })

        res.render('login', {
            mensaje: 'Usuario creado con exito ' + result.nombre
            ,indexcoordinador: req.session.usuario
        });

        sgMail.send(msg);
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
                ,indexcoordinador: req.session.usuario
            });
        }
        res.render('gestionUsuarios', {
            mensaje: '',
            usuarios: result
            ,indexcoordinador: req.session.usuario
        });
    })
});
app.post('/gestionUsuarios', (req, res) => {
    Usuarios.findOneAndUpdate({ cedula: req.body.cedula }, req.body, { new: true, runValidators: true, context: 'query' }, (err, result) => {
        if (err) {
            return res.render('gestionUsuarios', {
                mensaje: `<p style="color:red">Error ${err}</p>`,
                usuarios: []
                ,indexcoordinador: req.session.usuario
            })
        }
        else if (result) {
            Usuarios.find({}).exec((err, result) => {
                if (err) {
                    return res.render('gestionUsuarios', {
                        mensaje: `<p style="color:red">Error ${err}</p>`,
                        usuarios: []
                        ,indexcoordinador: req.session.usuario
                    })
                }
                res.render('gestionUsuarios', {
                    mensaje: '<p style="color:green">Cambio exitoso </p>',
                    usuarios: result
                    ,indexcoordinador: req.session.usuario
                });
            })
        } else {
            Usuarios.find({}).exec((err, result) => {
                if (err) {
                    return res.render('gestionUsuarios', {
                        mensaje: `<p style="color:red">Error ${err}</p>`,
                        usuarios: []
                        ,indexcoordinador: req.session.usuario
                    })
                }
                res.render('gestionUsuarios', {
                    mensaje: '<p style="color:red">Usuario no existe, validar cedula </p>',
                    usuarios: result
                    ,indexcoordinador: req.session.usuario
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
        ,indexcoordinador: req.session.usuario

    });
});

module.exports = app