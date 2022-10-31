var express = require("express");
var router = express.Router();
var models = require("../models");

////////////////////
//  INICIO DE    // 
// VALIDACIONES //
/////////////////
const verifyToken = require("../middleware/auth");

const validaDictaMateria = (id, { onSuccess, onNotFound, onError }) => {
  models.materia.findOne ({
    where: { id_profesor: id }
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


router.post("/", verifyToken, (req, res) => {
  models.profesor
    .create({ nombre: req.body.nombre, apellido: req.body.apellido, email: req.body.email })
    .then(profesor => res.status(201).send({ id: profesor.id }))
    .catch(error => {
      if (error == "SequelizeUniqueConstraintError: Validation error") {
        res.status(400).send('Bad request: existe otra profesor con el mismo nombre')
      }
      else {
        console.log(`Error al intentar insertar en la base de datos: ${error}`)
        res.sendStatus(500)
      }
    });
});

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

router.get("/:id", verifyToken, (req, res) => {
  findProfesor(req.params.id, {
    onSuccess: profesor => res.send(profesor),
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

router.put("/:id", verifyToken, (req, res) => {
  const onSuccess = profesor =>
    profesor
      .update(
        { nombre: req.body.nombre, apellido: req.body.apellido, email: req.body.email } , { fields: ["nombre", "apellido", "email"] }
      )
      .then(() => res.sendStatus(200))
      .catch(error => {
        if (error == "SequelizeUniqueConstraintError: Validation error") {
          res.status(400).send('Bad request: existe otro profesor con el mismo nombre')
        }
        else {
          console.log(`Error al intentar actualizar la base de datos: ${error}`)
          res.sendStatus(500)
        }
      });
    findProfesor(req.params.id, {
    onSuccess,
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

router.delete("/:id", verifyToken, (req, res) => {
  if(validaDictaMateria(req.params.id, {
    onSuccess: () => res.status(400).send('Bad request: profesor tiene materias que dicta'),
    onNotFound: () => {
      const onSuccess = profesor =>
        profesor
          .destroy()
          .then(() => res.sendStatus(200))
          .catch(() => res.sendStatus(500));
      findProfesor(req.params.id, {
        onSuccess,
        onNotFound: () => res.sendStatus(404),
        onError: () => res.sendStatus(500)
      });
    },
    onError: () => res.sendStatus(500)
  }));
});

module.exports = router;
