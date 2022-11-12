var express = require("express");
var router = express.Router();
var models = require("../models");

/* VALIDADORES */
const verifyToken = require("../middleware/auth");
const validaAlumno = require("../middleware/validaAlumno");
const validaMateria = require("../middleware/validaMateria");

/****************************************************************/

/* FUNCIONES DE BD */
const crearInscripcion = (req, res) => {
  models.alumnosinscripciones
    .create({
      id_alumno: req.body.id_alumno,
      id_materia: req.body.id_materia,
      nota_final: req.body.nota_final
    })
    .then(alumnosinscripciones => res.status(201).send({ id: alumnosinscripciones.id }))
    .catch(error => {
      if (error instanceof Sequelize.UniqueConstraintError) {
        return res.status(409).send({
          codigo: "INSCRIPCION_YA_EXISTE",
          mensaje: "La inscripcion ya existe"
        });
      }
      res.sendStatus(500);
    });
};

const modificarInscripcion = (req, res) => {
  models.alumnosinscripciones
    .update({
      id_alumno: req.body.id_alumno,
      id_materia: req.body.id_materia,
      nota_final: req.body.nota_final
    },
    { where: { id: req.params.id } })
    .then(([filasModificadas]) =>
              filasModificadas > 0 ? res.sendStatus(200) : res.sendStatus(404)
            )
    .catch(error => {
      if (error instanceof Sequelize.UniqueConstraintError) {
        return res.status(409).send({
          codigo: "INSCRIPCION_YA_EXISTE",
          mensaje: "La inscripcion ya existe"
        });
      }
      res.sendStatus(500);
    });
};

const eliminarInscripcion = (req, res) => {
  models.alumnosinscripciones
    .destroy({ where: { id: req.params.id } })
    .then(filasEliminadas =>
              filasEliminadas > 0 ? res.sendStatus(200) : res.sendStatus(404)
            )
    .catch(() => {res.sendStatus(500) 
    }) 
      ;
};

const findAlumnosinscripciones = (id, { onSuccess, onNotFound, onError }) => {
  models.alumnosinscripciones
    .findOne({
      attributes: ["id", "nota_final"] ,
      include: [
        {
          model: models.alumno,
          as: "Alumno-Matriculado",
          attributes: ["id", "DNI", "nombre", "apellido", "email"]
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

const findAlumnoInscripPorDNI = (DNI, { onSuccess, onNotFound, onError }) => {
  models.alumno
    .findOne({
      attributes: ["id", "DNI", "nombre", "apellido", "email"],
      raw: true,
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
                  model: models.carrera,
                  as: "Carrera-Relacionada",
                  attributes: ["id", "nombre"]
                }
              ]
            }
          ]
        }
      ],
      where: { DNI }
    })
    .then(alumno => (alumno ? onSuccess(alumno) : onNotFound()))
    .catch(() => onError());
};


/****************************************************************/

/* METODOS */
router.get("/cant", verifyToken, (req, res) => {
  models.alumnosinscripciones
    .count()
    .then(cantidad => {
      res.json({ cantidad: cantidad });
    })
    .catch(error => {
      res.status(500).json({ error: error });
    });
});

router.get("/porDNI/:dni", verifyToken, (req, res) => {
  findAlumnoInscripPorDNI(req.params.dni, {
    onSuccess: alumno => res.send(alumno),
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
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
    attributes: ["id", "DNI", "nombre", "apellido", "email"], 
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

router.get("/:id", verifyToken, (req, res) => {
  findAlumnosinscripciones(req.params.id, {
    onSuccess: alumnosinscripciones => res.send(alumnosinscripciones),
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});


router.post("/", verifyToken, validaAlumno, validaMateria, crearInscripcion);

router.put("/:id", verifyToken, validaAlumno, validaMateria, modificarInscripcion);

router.delete("/:id", verifyToken, eliminarInscripcion);


module.exports = router;
