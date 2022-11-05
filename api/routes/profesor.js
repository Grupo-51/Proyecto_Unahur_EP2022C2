var express = require("express");
var router = express.Router();
var models = require("../models");

/* VALIDADORES */
const verifyToken = require("../middleware/auth");
const validaProfesorMateria = require("../middleware/validaProfesorMateria");

/****************************************************************/

/* FUNCIONES DE BD */
const crearProfesor = (req, res) => {
  models.profesor
    .create({
      nombre: req.body.nombre,
      apellido: req.body.apellido,
      email: req.body.email
    })
    .then(profesor => res.status(201).send({ id: profesor.id }))
    .catch(error => {
      if (error instanceof Sequelize.UniqueConstraintError) {
        return res.status(409).send({
          codigo: "PROFESOR_YA_EXISTE",
          mensaje: "El profesor ya existe"
        });
      }
      res.sendStatus(500);
    });
};

const modificarProfesor = (req, res) => {
  models.profesor
    .update({
      nombre: req.body.nombre,
      apellido: req.body.apellido,
      email: req.body.email
    },
    { where: { id: req.params.id } })
    .then(([filasModificadas]) =>
              filasModificadas > 0 ? res.sendStatus(200) : res.sendStatus(404)
            )
    .catch(error => {
      if (error instanceof Sequelize.UniqueConstraintError) {
        return res.status(409).send({
          codigo: "PROFESOR_YA_EXISTE",
          mensaje: "El profesor ya existe"
        });
      }
      res.sendStatus(500);
    });
};

const eliminarProfesor = (req, res) => {
  models.profesor
    .destroy({ where: { id: req.params.id } })
    .then(filasEliminadas =>
              filasEliminadas > 0 ? res.sendStatus(200) : res.sendStatus(404)
            )
    .catch(() => {res.sendStatus(500) 
    }) 
      ;
};

const findProfesor = (id, { onSuccess, onNotFound, onError }) => {
  models.profesor
    .findOne({
      attributes: ["id", "nombre", "apellido","email"],
      include:[{as:'Materias-QueDicta', model:models.materia, attributes: ["id","nombre"]}],
      where: { id }
    })
    .then(profesor => (profesor ? onSuccess(profesor) : onNotFound()))
    .catch(() => onError());
};

/****************************************************************/

/* METODOS */

router.get("/cant", verifyToken, (req, res) => {
  models.profesor
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
  models.profesor
    .findAll({
      offset: (paginaActual - 1) * cantidadAVer,
      limit: parseInt(cantidadAVer),
      attributes: ["id", "nombre", "apellido","email"],
      include:[{as:'Materias-QueDicta', model:models.materia, attributes: ["id","nombre"]}]
    })
    .then(profesor => res.send(profesor))
    .catch(() => res.sendStatus(500));
});

router.get("/:id", verifyToken, (req, res) => {
  findProfesor(req.params.id, {
    onSuccess: profesor => res.send(profesor),
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});


router.post("/", verifyToken, crearProfesor);

router.put("/:id", verifyToken, modificarProfesor);

router.delete("/:id", verifyToken, validaProfesorMateria, eliminarProfesor);


module.exports = router;
