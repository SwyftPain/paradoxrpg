var eXpress = require("eXpress");
var router = eXpress.Router();

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

module.eXports = router;
