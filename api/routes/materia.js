var express = require("express");
var router = express.Router();
var models = require("../models");


/* VALIDADORES */
const verifyToken = require("../middleware/auth");
const validaProfesor = require("../middleware/validaProfesor");
const validaCarrera = require("../middleware/validaCarrera");
const validaInscripcionMateria = require("../middleware/validaInscripcionMateria");

/****************************************************************/

/* FUNCIONES DE BD */
const crearMateria = (req, res) => {
  models.materia
    .create({
      nombre: req.body.nombre,
      id_carrera: req.body.id_carrera,
      id_profesor: req.body.id_profesor
    })
    .then(materia => res.status(201).send({ id: materia.id }))
    .catch(error => {
      if (error instanceof Sequelize.UniqueConstraintError) {
        return res.status(409).send({
          codigo: "MATERIA_YA_EXISTE",
          mensaje: "La materia ya existe"
        });
      }
      res.sendStatus(500);
    });
};

const modificarMateria = (req, res) => {
  models.materia
    .update({
      nombre: req.body.nombre,
      id_carrera: req.body.id_carrera,
      id_profesor: req.body.id_profesor
    },
    { where: { id: req.params.id } })
    .then(([filasModificadas]) =>
              filasModificadas > 0 ? res.sendStatus(200) : res.sendStatus(404)
            )
    .catch(error => {
      if (error instanceof Sequelize.UniqueConstraintError) {
        return res.status(409).send({
          codigo: "MATERIA_YA_EXISTE",
          mensaje: "La materia ya existe"
        });
      }
      res.sendStatus(500);
    });
};

const eliminarMateria = (req, res) => {
  models.materia
    .destroy({ where: { id: req.params.id } })
    .then(filasEliminadas =>
              filasEliminadas > 0 ? res.sendStatus(200) : res.sendStatus(404)
            )
    .catch(() => {res.sendStatus(500) 
    }) 
      ;
};


const findMateria = (id, { onSuccess, onNotFound, onError }) => {
  models.materia
    .findOne({
      attributes: ["id", "nombre","id_carrera","id_profesor"],
      include:[{as:'Carrera-Relacionada', model:models.carrera, attributes: ["nombre"]}],
      include:[{as:'Profesor-QueDicta', model:models.profesor, attributes: ["nombre","apellido","email"]}],
      where: { id }
    })
    .then(materia => (materia ? onSuccess(materia) : onNotFound()))
    .catch(() => onError());
};
/****************************************************************/

/* METODOS */
router.get("/cant", verifyToken, (req, res) => {
  models.materia
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
  models.materia
    .findAll({
      offset: (paginaActual - 1) * cantidadAVer,
      limit: parseInt(cantidadAVer),
      attributes: ["id", "nombre", "id_carrera", "id_profesor"],
      include:[{as:'Carrera-Relacionada', model:models.carrera, attributes: ["nombre"]}],
      include:[{as:'Profesor-QueDicta', model:models.profesor, attributes: ["nombre","apellido","email"]}]

    })
    .then(materia => res.send(materia))
    .catch(() => res.sendStatus(500));
});

router.get("/:id", verifyToken, (req, res) => {
  findMateria(req.params.id, {
    onSuccess: materia => res.send(materia),
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

router.post("/", verifyToken, validaProfesor, validaCarrera, crearMateria);

router.put("/:id", verifyToken, validaProfesor, validaCarrera, modificarMateria);

router.delete("/:id", verifyToken, validaInscripcionMateria, eliminarMateria);

module.exports = router;
