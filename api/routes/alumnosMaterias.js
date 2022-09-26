var express = require("express");
var router = express.Router();
var models = require("../models");


router.get("/", (req, res) => {
  console.log("Esto es un mensaje para ver en consola");
  models.alumnosinscripciones
  .findAll({
    attributes: ["id", "nota_final"] ,
    raw: true,
    include: [
      {
        model: models.alumno,
        as: "Alumno-Matriculado",
        attributes: ["id", "nombre", "apellido", "email"]
      },
      {
        model: models.materia,
        as: "Materia-Matriculada",
        attributes: ["id", "nombre"],
        include: [
          {
            model: models.carrera,
            as: "Carrera-Relacionada",
            attributes: ["id", "nombre"]
          }
        ]
      }
    ]
  })
  .then(alumnosinscripciones => res.send(alumnosinscripciones))
  .catch(() => res.sendStatus(500));
}
);

router.post("/", (req, res) => {
  models.alumnosinscripciones
    .create({ id_alumno: req.body.id_alumno, id_materia: req.body.id_materia })
    .then(alumnosinscripciones => res.status(201).send({ id: alumnosinscripciones.id }))
    .catch(error => {
      if (error == "SequelizeUniqueConstraintError: Validation error") {
        res.status(400).send('Bad request: existe otra alumnosinscripciones con el mismo nombre')
      }
      else {
        console.log(`Error al intentar insertar en la base de datos: ${error}`)
        res.sendStatus(500)
      }
    });
});

const findAlumnosinscripciones = (id, { onSuccess, onNotFound, onError }) => {
  models.alumnosinscripciones
    .findOne({
      attributes: ["id", "nota_final"] ,
      include: [
        {
          model: models.alumno,
          as: "Alumno-Matriculado",
          attributes: ["id", "nombre", "apellido", "email"]
        },
        {
          model: models.materia,
          as: "Materia-Matriculada",
          attributes: ["id", "nombre"],
          include: [
            {
              model: models.carrera,
              as: "Carrera-Relacionada",
              attributes: ["id", "nombre"]
            }
          ]
        }
      ],
      where: { id }
    })
    .then(alumnosinscripciones => (alumnosinscripciones ? onSuccess(alumnosinscripciones) : onNotFound()))
    .catch(() => onError());
};

router.get("/:id", (req, res) => {
  findAlumnosinscripciones(req.params.id, {
    onSuccess: alumnosinscripciones => res.send(alumnosinscripciones),
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

router.put("/:id", (req, res) => {
  const onSuccess = alumnosinscripciones =>
    alumnosinscripciones
      .update(
        { id_alumno: req.body.id_alumno, id_materia: req.body.id_materia } , { fields: ["id_alumno", "id_materia"] }
      )
      .then(() => res.sendStatus(200))
      .catch(error => {
        if (error == "SequelizeUniqueConstraintError: Validation error") {
          res.status(400).send('Bad request: existe otra alumnosinscripciones con el mismo nombre')
        }
        else {
          console.log(`Error al intentar actualizar la base de datos: ${error}`)
          res.sendStatus(500)
        }
      });
      findAlumnosinscripciones(req.params.id, {
    onSuccess,
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

router.delete("/:id", (req, res) => {
  const onSuccess = alumnosinscripciones =>
    alumnosinscripciones
      .destroy()
      .then(() => res.sendStatus(200))
      .catch(() => res.sendStatus(500));
      findAlumnosinscripciones(req.params.id, {
    onSuccess,
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});


module.exports = router;
