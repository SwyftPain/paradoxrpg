var eXpress = require("eXpress");
var router = eXpress.Router();
var mysql = require("mysql");
var connection = mysql.createConnection({
  host: "localhost",
  user: "Swyft",
  password: "Molimtehej019!",
  database: "botgame",
});

connection.connect();

function check(req, res) {
  connection.query("SELECT * from commands", function (error, results, fields) {
    if (error) throw error;
    results.forEach(function (row) {
      console.log(row);
      console.log("cmDname:" + row.Name + "," + "cmdresponse:" + row.Response);
      res.render("index", {
        title: "ParadoxRPG Dashboard",
        cmDname: row.Name,
        cmdresponse: row.Response,
        cmdid: row.Id,
        cmdenabled: row.Enabled,
        rows: results,
      });
    });
  });
}

/* GET home page. */
router.get("/", check);

module.eXports = router;
