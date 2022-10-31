var express = require("express");
var router = express.Router();
var models = require("../models");

////////////////////
//  INICIO DE    // 
// VALIDACIONES //
/////////////////
const verifyToken = require("../middleware/auth");

const validaInscripcion = (id, { onSuccess, onNotFound, onError }) => {
  models.alumnosinscripciones.findOne ({
    where: { id_alumno: id }
  }).then(inscripcion => {
    if (inscripcion) {
      onSuccess(inscripcion);
    } else {
      onNotFound();
    }
  }).catch(error => {
    onError(error);
  });
};

////////////////////
//    FIN DE     // 
// VALIDACIONES //
/////////////////

router.get("/cant", verifyToken, (req, res) => {
  models.alumno
    .count()
    .then(cantidad => {
      res.json({ cantidad: cantidad });
    })
    .catch(error => {
      res.status(500).json({ error: error });
    });
});

router.get("/", verifyToken, (req, res) => {
  const paginaActualNumero = Number.parseInt(req.query.paginaActual);
  const cantidadAVerNumero = Number.parseInt(req.query.cantidadAVer);

  let paginaActual = 1;
  if(!Number.isNaN(paginaActualNumero) && paginaActualNumero > 0){
    paginaActual = paginaActualNumero;
  }

  let cantidadAVer = 5;
  if(!Number.isNaN(cantidadAVerNumero) && cantidadAVerNumero > 0 && cantidadAVerNumero <= 10){    
    cantidadAVer = cantidadAVerNumero;
  }
  console.log("Esto es un mensaje para ver en consola");
  models.alumno
    .findAll({
      offset: (paginaActual - 1) * cantidadAVer,
      limit: parseInt(cantidadAVer),
      attributes: ["id", "nombre", "apellido", "email"]
    })
    .then(alumno => res.send(alumno))
    .catch(() => res.sendStatus(500));
});


router.post("/", verifyToken, (req, res) => {
  models.alumno
    .create({ nombre: req.body.nombre, apellido: req.body.apellido, email: req.body.email })
    .then(alumno => res.status(201).send({ id: alumno.id }))
    .catch(error => {
      if (error == "SequelizeUniqueConstraintError: Validation error") {
        res.status(400).send('Bad request: existe otro alumno con el mismo nombre')
      }
      else {
        console.log(`Error al intentar insertar en la base de datos: ${error}`)
        res.sendStatus(500)
      }
    });
});

const findAlumno = (id, { onSuccess, onNotFound, onError }) => {
  models.alumno
    .findOne({
      attributes: ["id", "nombre","apellido","email"],
      where: { id }
    })
    .then(alumno => (alumno ? onSuccess(alumno) : onNotFound()))
    .catch(() => onError());
};

router.get("/:id", verifyToken, (req, res) => {
  findAlumno(req.params.id, {
    onSuccess: alumno => res.send(alumno),
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

router.put("/:id", verifyToken, (req, res) => {
  const onSuccess = alumno =>
    alumno
      .update(
        { nombre: req.body.nombre, 
          apellido: req.body.apellido , 
          email: req.body.email } , 
          { fields: ["nombre", "apellido", "email"] }
      )
      .then(() => res.sendStatus(200))
      .catch(error => {
        if (error == "SequelizeUniqueConstraintError: Validation error") {
          res.status(400).send('Bad request: existe alumno con el mismo nombre')
        }
        else {
          console.log(`Error al intentar actualizar la base de datos: ${error}`)
          res.sendStatus(500)
        }
      });
    findAlumno(req.params.id, {
    onSuccess,
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

router.delete("/:id", verifyToken, (req, res) => {
  if(validaInscripcion(req.params.id, {
    onSuccess: () => res.status(400).send('Bad request: alumno tiene inscripciones'),
    onNotFound: () => {
      const onSuccess = alumno =>
        alumno
          .destroy()
          .then(() => res.sendStatus(200))
          .catch(() => res.sendStatus(500));
      findAlumno(req.params.id, {
        onSuccess,
        onNotFound: () => res.sendStatus(404),
        onError: () => res.sendStatus(500)
      });
    },
    onError: () => res.sendStatus(500)
  }));
});



module.exports = router;
