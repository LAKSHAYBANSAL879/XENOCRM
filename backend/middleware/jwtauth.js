const JWT = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  try {
    const token = req.headers["authorization"];
    if (!token) {
      return res.status(401).send({
        success: false,
        message: "No token provided",
      });
    }

    JWT.verify(token, process.env.SECRET, (err, decode) => {
      if (err) {
        return res.status(401).send({
          success: false,
          message: "Invalid token",
        });
      }
      req.userId = decode.userId;
      next();
    });
  } catch (error) {
    console.log(error);
    return res.status(401).send({
      success: false,
      error,
      message: "Auth Failed",
    });
  }
};
