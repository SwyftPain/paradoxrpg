<?php
$servername = "localhost";
$username = "Swyft";
$password = "Molimtehej019!";
$dbname = "botgame";
$command = $_POST['namecmd'];
$text = $_POST['responsecmd'];
$id = $_POST['id'];
$disable = $_POST['enabledcmd'];
$count = count($id);
for ($x = 0; $x <= $count; $x++) {
  // Create connection
  $conn = new mysqli($servername, $username, $password, $dbname);
  // Check connection
  if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
  }

  $sql = "UPDATE commands SET Name='$command[$x]', Response='$text[$x]', Enabled='$disable[$x]' WHERE Id='$id[$x]'";

  if ($conn->query($sql) === TRUE) {
    echo "Record updated successfully";
  } else {
    echo "Error updating record: " . $conn->error;
  }

  $conn->close();
}
header("Location: http://localhost:3000");
?>