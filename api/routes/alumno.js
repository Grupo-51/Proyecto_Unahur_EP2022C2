var express = require("express");
var router = express.Router();
var models = require("../models");

/* VALIDADORES */
const verifyToken = require("../middleware/auth");
const validaInscripcionAlumno = require("../middleware/validaInscripcionAlumno");

/****************************************************************/

/* FUNCIONES DE BD */
const crearAlumno = (req, res) => {
  models.alumno
    .create({
      DNI: req.body.DNI,
      nombre: req.body.nombre,
      apellido: req.body.apellido,
      email: req.body.email
    })
    .then(alumno => res.status(201).send({ id: alumno.id }))
    .catch(error => {
      if (error instanceof Sequelize.UniqueConstraintError) {
        return res.status(409).send({
          codigo: "ALUMNO_YA_EXISTE",
          mensaje: "El alumno ya existe"
        });
      }
      res.sendStatus(500);
    });
};

const modificarAlumno = (req, res) => {
  models.alumno
    .update({
      DNI: req.body.DNI,
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
          codigo: "ALUMNO_YA_EXISTE",
          mensaje: "El alumno ya existe"
        });
      }
      res.sendStatus(500);
    });
};

const eliminarAlumno = (req, res) => {
  models.alumno
    .destroy({ where: { id: req.params.id } })
    .then(filasEliminadas =>
              filasEliminadas > 0 ? res.sendStatus(200) : res.sendStatus(404)
            )
    .catch(() => {res.sendStatus(500) 
    }) 
      ;
};

const findAlumno = (id, { onSuccess, onNotFound, onError }) => {
  models.alumno
    .findOne({
      attributes: ["id", "DNI", "nombre","apellido","email"],
      where: { id }
    })
    .then(alumno => (alumno ? onSuccess(alumno) : onNotFound()))
    .catch(() => onError());
};

const findAlumnoPorDni = (dni, { onSuccess, onNotFound, onError }) => {
  models.alumno
    .findOne({
      attributes: ["id", "DNI", "nombre","apellido","email"],
      where: { dni }
    })
    .then(alumno => (alumno ? onSuccess(alumno) : onNotFound()))
    .catch(() => onError());
};


/****************************************************************/

/* METODOS */
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

router.get("/porDNI/:dni", verifyToken, (req, res) => {
  findAlumnoPorDni(req.params.dni, {
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
      attributes: ["id", "DNI", "nombre", "apellido", "email"]
    })
    .then(alumno => res.send(alumno))
    .catch(() => res.sendStatus(500));
});


router.get("/:id", verifyToken, (req, res) => {
  findAlumno(req.params.id, {
    onSuccess: alumno => res.send(alumno),
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});


router.post("/", verifyToken, crearAlumno);

router.put("/:id", verifyToken, modificarAlumno);

router.delete("/:id", verifyToken, validaInscripcionAlumno, eliminarAlumno);


module.exports = router;
