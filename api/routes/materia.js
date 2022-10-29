var express = require("express");
var router = express.Router();
var models = require("../models");

////////////////////
//  INICIO DE    // 
// VALIDACIONES //
/////////////////
const verifyToken = require("../middleware/auth");

const validaProfesor  = (id, { onSuccess, onNotFound, onError }) => {
  models.profesor.findOne ({
    where: { id: id }
  }).then(profesor => {
    if (profesor) {
      onSuccess(profesor);
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

const validaCarrera = (id, { onSuccess, onNotFound, onError }) => {
  models.carrera.findOne ({
    where: { id: id }
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

const validaInscripcion = (id, { onSuccess, onNotFound, onError }) => {
  models.alumnosinscripciones.findOne ({
    where: { id_materia: id }
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

/////////////////

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


router.post("/", verifyToken, (req, res) => {
  if(validaProfesor(req.body.id_profesor, {
    onSuccess: () => {
      if(validaCarrera(req.body.id_carrera, {
        onSuccess: () => {
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
        }, 
        onNotFound: () => res.status(404).send({
          codigo: "CARRERA_NO_ENCONTRADA",
          mensaje: "La carrera no existe"
        }),
        onError: () => res.sendStatus(500)
      }));
    }, 
    onNotFound: () => res.status(404).send({
      codigo: "PROFESOR_NO_ENCONTRADO",
      mensaje: "El profesor no existe"
    }),
    onError: () => res.sendStatus(500)
  }));
});



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

router.get("/:id", verifyToken, (req, res) => {
  findMateria(req.params.id, {
    onSuccess: materia => res.send(materia),
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

router.put("/:id", verifyToken, (req, res) => {
  if(validaProfesor(req.body.id_profesor, {
    onSuccess: () => {
      if(validaCarrera(req.body.id_carrera, {
        onSuccess: () => {
          models.materia
            .update(
              {
                nombre: req.body.nombre,
                id_carrera: req.body.id_carrera,
                id_profesor: req.body.id_profesor
              },
              { where: { id: req.params.id } }
            )
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
        },
        onNotFound: () => res.status(404).send({
          codigo: "CARRERA_NO_ENCONTRADA",
          mensaje: "La carrera no existe"
        }),
        onError: () => res.sendStatus(500)
      }));
    } ,
    onNotFound: () => res.status(404).send({
      codigo: "PROFESOR_NO_ENCONTRADO",
      mensaje: "El profesor no existe"
    }),
    onError: () => res.sendStatus(500)
  }));
});


router.delete("/:id", verifyToken, (req, res) => {
  if(validaInscripcion(req.params.id, {
    onSuccess: () => res.status(400).send('Bad request: materia tiene inscripciones'),
    onNotFound: () => {
      const onSuccess = materia =>
        materia
          .destroy()
          .then(() => res.sendStatus(200))
          .catch(() => res.sendStatus(500));
      findMateria(req.params.id, {
        onSuccess,
        onNotFound: () => res.sendStatus(404),
        onError: () => res.sendStatus(500)
      });
    },
    onError: () => res.sendStatus(500)
  }));
});


module.exports = router;
