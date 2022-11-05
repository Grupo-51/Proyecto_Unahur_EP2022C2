var {alumno} = require("../models");
const validaAlumno = (req, res, next) => {
  alumno
    .findOne({
      where: { id: req.body.id_alumno }
    })
    .then(alumno => {
      if (alumno) {
        next();
      } else {
        res.status(400).send("Bad request: alumno no existe");
      }
    })
    .catch(error => {
      res.status(500).json({ error: error });
    });
}

module.exports = validaAlumno