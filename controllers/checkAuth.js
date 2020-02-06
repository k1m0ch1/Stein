const Storage = require("../models/storage"),
  User = require("../models/user"),
  auth = require("basic-auth");

const apiNotFoundError = { code: 404, message: "API does not exist" };

module.exports = (req, res, next) => {
  getStorage(req, res)
    .then(result => {
      // If sheet doesn't exist, send 404
      if (!result) {
        return next(apiNotFoundError);
      }

      // First check if Basic HTTP Auth is enabled on sheet
      if (typeof result.basicHttpAuth !== "string") {
        res.locals.sheetIdDbResult = result;
        return next();
      }
      // Store correct credentials as variables
      const correctRaw = result.basicHttpAuth.split(":"),
        correctName = correctRaw[0],
        correctPassword = correctRaw[1];

      // Look for simple http credentials in req
      const received = auth(req);

      // Test the credentials
      if (
        received &&
        received.name === correctName &&
        received.pass === correctPassword
      ) {
        res.locals.sheetIdDbResult = result;
        return next();
      } else {
        res.status(401).json({ error: "Unauthorized" });
      }

      // Now do other auth, like IP and all
    })
    .catch(err => {
      next(apiNotFoundError);
      console.error(err);
    });
};

function getStorage(req, res) {
  // If the storage had been already fetched and set by some other middleware, no need to do that again
  if (res.locals.sheetIdDbResult) {
    return Promise.resolve(res.locals.sheetIdDbResult);
  }

  if (req.params.googleId) {
    return User.findOne({ email: process.env.STEIN_DEFAULT_EMAIL })
      .then(result => {
        return {
          googleId: req.params.googleId,
          userGoogleId: result.googleId,
        };
      });
  }

  return Storage.findById(req.params.id);
}
