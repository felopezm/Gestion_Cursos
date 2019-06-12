const express = require('express');
const app = express();
const path = require('path');
const hbs = require('hbs');
const bodyParser = require('body-parser');
require('./helpers');
const funciones = require('./funciones');

const directorio_publico = path.join(__dirname, '../public');
const directorio_partials = path.join(__dirname, '../partials');

app.use(express.static(directorio_publico));
hbs.registerPartials(directorio_partials);
app.use(bodyParser.urlencoded({ extended: false }));

app.set('view engine', 'hbs');

app.get('/index', (req, res) => {
  res.render('index', {
    mensaje: ''
  });
});

/*
* ---Agregar un nuevo curso
*/
app.get('/addCourse', (req, res) => {
  res.render('addCourse', {
    duplicado: ''
  });
});
app.post('/addCourse', (req, res) => {
  let save = funciones.crear_curso(req.body);
  if (save) {
    res.render('index', {
      mensaje: 'Curso creado correctamente'
    });
  } else {
    res.render('addCourse', {
      duplicado: 'El id del curso ya existe, insertar otro Id para el curso'
    });
  }
});

/*
* ---Ver cursos disponibles
*/
app.get('/viewCourse', (req, res) => {
  res.render('viewCourse');
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
      res.render('index', {
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
  res.render('updateCourse', {
    error_actualizar: ''
  });
});
app.post('/updateCourse', (req, res) => {
  let save = funciones.actualizar_curso(req.body);
  if (save) {
    res.render('index', {
      mensaje: 'Curso Actualizado Correctamente'
    });
  } else {
    res.render('updateCourse', {
      error_actualizar: 'Error al actualizar el estado del curso'
    });
  }
});

/*
* ---Estudiantes por curso
*/
app.get('/viewEstudenByCourse', (req, res) => {
  res.render('viewEstudenByCourse',{
    mensaje:''
  });
});
app.post('/viewEstudenByCourse', (req, res) => {
  let delete_ = funciones.eliminar_estudiante(req.body);
  if (delete_) {
    res.render('index', {
      mensaje: 'Estudiante Eliminado Correctamente'
    });
  } else {
    res.render('viewEstudenByCourse',{
      mensaje:'Error al eliminar el estudiante'
    });
  }
});
/*
* ---login
*/
app.get('/', (req, res) => {
  res.render('login',{
    mensaje:''
  });
});
app.post('/login', (req, res) => {
  //codigo login
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
* ---Si ahi algun error en la url
*/

app.get('*', (req, res) => {
  res.render('error', {
    estudiante: 'error'
  });
});

app.listen(3000, () => {
  console.log('Escuchando por el puerto 3000');
});