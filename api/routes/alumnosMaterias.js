var express = require("express");
var router = express.Router();
var models = require("../models");
const verifyToken = require("../middleware/auth");

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
    attributes: ["id", "nombre", "apellido", "email"], 
    //raw: true,
    include: [
      {
        model: models.alumnosinscripciones,
        as: "Inscripciones",
        attributes: ["id", "nota_final"],
        include: [
          {
            model: models.materia,
            as: "Materia-Matriculada",
            attributes: ["id", "nombre"],
            include: [
              {
                model: models.profesor,
                as: "Profesor-QueDicta",
                attributes: ["id", "nombre", "apellido"]
              }
            ]
          }
        ]
      }
    ]
  })
  .then(alumno => res.send(alumno))
  .catch(() => res.sendStatus(500));
}
);

router.post("/", verifyToken, (req, res) => {
  models.alumnosinscripciones
    .create({ id_alumno: req.body.id_alumno, id_materia: req.body.id_materia , nota_final: req.body.nota_final })
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

router.get("/:id", verifyToken, (req, res) => {
  findAlumnosinscripciones(req.params.id, {
    onSuccess: alumnosinscripciones => res.send(alumnosinscripciones),
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

router.put("/:id", verifyToken, (req, res) => {
  const onSuccess = alumnosinscripciones =>
    alumnosinscripciones
      .update(
        { id_alumno: req.body.id_alumno, id_materia: req.body.id_materia, nota_final: req.body.nota_final } , { fields: ["id_alumno", "id_materia", "nota_final"] }
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

router.delete("/:id", verifyToken, (req, res) => {
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
