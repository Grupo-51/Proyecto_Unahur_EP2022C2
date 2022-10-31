var express = require("express");
var router = express.Router();
var models = require("../models");

////////////////////
//  INICIO DE    // 
// VALIDACIONES //
/////////////////
const verifyToken = require("../middleware/auth");

const validaHayMateriaDeCarrera = (id, { onSuccess, onNotFound, onError }) => {
  models.materia.findOne ({
    where: { id_carrera: id }
  }).then(carrera => {
    if (carrera) {
      onSuccess(carrera);
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
  models.carrera
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
  models.carrera
    .findAll({
      offset: (paginaActual - 1) * cantidadAVer,
      limit: parseInt(cantidadAVer),
      attributes: ["id", "nombre"]
    })
    .then(carreras => res.send(carreras))
    .catch(() => res.sendStatus(500));
});

router.get("/mat", verifyToken, (req, res) => {
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
  models.carrera
    .findAll({
      offset: (paginaActual - 1) * cantidadAVer,
      limit: parseInt(cantidadAVer),
      attributes: ["id", "nombre"],
      include:[{as:'Plan-DeEstudios', model:models.materia, attributes: ["id","nombre"]}],
    })
    .then(carreras => res.send(carreras))
    .catch(() => res.sendStatus(500));
});

/***********************
 * ESTRUCTURA COMPLETA
 **********************/

 router.get("/completo", verifyToken, (req, res) => {
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
  models.carrera
    .findAll({
      offset: (paginaActual - 1) * cantidadAVer,
      limit: parseInt(cantidadAVer),
      attributes: ["id", "nombre"],
      include:[{as:'Plan-DeEstudios', model:models.materia, attributes: ["id","nombre"],
      include:[{as:'Profesor-QueDicta', model:models.profesor, attributes: ["id","nombre"]}],
      include:[{as:'Alumnos-Inscriptos', model:models.alumnosinscripciones, attributes: ["id","id_alumno"],
      include:[{as:'Alumno-Matriculado', model:models.alumno, attributes: ["id","nombre"]}],}], }],
    }) 
    .then(carreras => res.send(carreras))
    .catch(() => res.sendStatus(500));
});

/*************/


router.post("/", verifyToken, (req, res) => {
  models.carrera
    .create({ nombre: req.body.nombre })
    .then(carrera => res.status(201).send({ id: carrera.id }))
    .catch(error => {
      if (error == "SequelizeUniqueConstraintError: Validation error") {
        res.status(400).send('Bad request: existe otra carrera con el mismo nombre')
      }
      else {
        console.log(`Error al intentar insertar en la base de datos: ${error}`)
        res.sendStatus(500)
      }
    });
});

const findCarrera = (id, { onSuccess, onNotFound, onError }) => {
  models.carrera
    .findOne({
      attributes: ["id", "nombre"],
      where: { id }
    })
    .then(carrera => (carrera ? onSuccess(carrera) : onNotFound()))
    .catch(() => onError());
};

router.get("/:id", verifyToken, (req, res) => {
  findCarrera(req.params.id, {
    onSuccess: carrera => res.send(carrera),
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

router.put("/:id", verifyToken, (req, res) => {
  const onSuccess = carrera =>
    carrera
      .update({ nombre: req.body.nombre }, { fields: ["nombre"] })
      .then(() => res.sendStatus(200))
      .catch(error => {
        if (error == "SequelizeUniqueConstraintError: Validation error") {
          res.status(400).send('Bad request: existe otra carrera con el mismo nombre')
        }
        else {
          console.log(`Error al intentar actualizar la base de datos: ${error}`)
          res.sendStatus(500)
        }
      });
    findCarrera(req.params.id, {
    onSuccess,
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

router.delete("/:id", verifyToken, (req, res) => {
  if(validaHayMateriaDeCarrera(req.params.id, {
    onSuccess: () => res.status(400).send('Bad request: hay materias que pertenecen a la carrera'),
    onNotFound: () => {
      const onSuccess = carrera =>
        carrera
          .destroy()
          .then(() => res.sendStatus(200))
          .catch(() => res.sendStatus(500));
      findCarrera(req.params.id, {
        onSuccess,
        onNotFound: () => res.sendStatus(404),
        onError: () => res.sendStatus(500)
      });
    },
    onError: () => res.sendStatus(500)
  }));
});

module.exports = router;
