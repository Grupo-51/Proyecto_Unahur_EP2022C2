var express = require("express");
var router = express.Router();
var models = require("../models");

/* VALIDADORES */
const verifyToken = require("../middleware/auth");
const validaCarreraMateria = require("../middleware/validaCarreraMateria");

/****************************************************************/

/* FUNCIONES DE BD */
const crearCarrera = (req, res) => {
  models.carrera
    .create({
      nombre: req.body.nombre
    })
    .then(carrera => res.status(201).send({ id: carrera.id }))
    .catch(error => {
      if (error instanceof Sequelize.UniqueConstraintError) {
        return res.status(409).send({
          codigo: "CARRERA_YA_EXISTE",
          mensaje: "La carrera ya existe"
        });
      }
      res.sendStatus(500);
    });
};

const modificarCarrera = (req, res) => {
  models.carrera
    .update({
      nombre: req.body.nombre
    },
    { where: { id: req.params.id } })
    .then(([filasModificadas]) =>
              filasModificadas > 0 ? res.sendStatus(200) : res.sendStatus(404)
            )
    .catch(error => {
      if (error instanceof Sequelize.UniqueConstraintError) {
        return res.status(409).send({
          codigo: "CARRERA_YA_EXISTE",
          mensaje: "La carrera ya existe"
        });
      }
      res.sendStatus(500);
    });
};

const eliminarCarrera = (req, res) => {
  models.carrera
    .destroy({ where: { id: req.params.id } })
    .then(filasEliminadas =>
              filasEliminadas > 0 ? res.sendStatus(200) : res.sendStatus(404)
            )
    .catch(() => {res.sendStatus(500) 
    }) 
      ;
};

const findCarrera = (id, { onSuccess, onNotFound, onError }) => {
  models.carrera
    .findOne({
      attributes: ["id", "nombre"],
      where: { id }
    })
    .then(carrera => (carrera ? onSuccess(carrera) : onNotFound()))
    .catch(() => onError());
};

/****************************************************************/

/* METODOS */

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


router.get("/:id", verifyToken, (req, res) => {
  findCarrera(req.params.id, {
    onSuccess: carrera => res.send(carrera),
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
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


router.post("/", verifyToken, crearCarrera);

router.put("/:id", verifyToken, modificarCarrera);

router.delete("/:id", verifyToken, validaCarreraMateria, eliminarCarrera);


module.exports = router;
