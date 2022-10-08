var express = require("express");
var router = express.Router();
var models = require("../models");

/*
// rutas protegidas
const rutasProtegidas = express.Router(); 
rutasProtegidas.use((req, res, next) => {
    const token = req.headers['access-token'];
 
    if (token) {
      jwt.verify(token, app.get('key'), (err, decoded) => {      
        if (err) {
          return res.json({ mensaje: 'Token inválida' });    
        } else {
          req.decoded = decoded;    
          next();
        }
      });
    } else {
        res.send({ 
          mensaje: 'Token no proveída.' 
        });
    }
});
*/
const verification = (req, res, next) => {
let token = req.headers['access-token'];
if (!token) {
return res.status(403).send({ auth: false, message: 'No token provided.' });
}
jwt.verify(token, app.get('key'), function(err, decoded) {
if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
// if everything good, save to request for use in other routes
req.userId = decoded.id;
next();
});
};


router.get("/", verification, (req, res) => {
  
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


router.post("/", (req, res) => {
  models.materia
    .create({ nombre: req.body.nombre, id_carrera: req.body.id_carrera, id_profesor: req.body.id_profesor })
    .then(materia => res.status(201).send({ id: materia.id }))
    .catch(error => {
      if (error == "SequelizeUniqueConstraintError: Validation error") {
        res.status(400).send('Bad request: existe otra materia con el mismo nombre')
      }
      else {
        console.log(`Error al intentar insertar en la base de datos: ${error}`)
        res.sendStatus(500)
      }
    });
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

router.get("/:id", (req, res) => {
  findMateria(req.params.id, {
    onSuccess: materia => res.send(materia),
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

router.put("/:id", (req, res) => {
  const onSuccess = materia =>
    materia
      .update(
        { nombre: req.body.nombre, id_carrera: req.body.id_carrera, id_profesor: req.body.id_profesor } , { fields: ["nombre", "id_carrera", "id_profesor"] }
      )
      .then(() => res.sendStatus(200))
      .catch(error => {
        if (error == "SequelizeUniqueConstraintError: Validation error") {
          res.status(400).send('Bad request: existe otra materia con el mismo nombre')
        }
        else {
          console.log(`Error al intentar actualizar la base de datos: ${error}`)
          res.sendStatus(500)
        }
      });
    findMateria(req.params.id, {
    onSuccess,
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

router.delete("/:id", (req, res) => {
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
});

module.exports = router;
