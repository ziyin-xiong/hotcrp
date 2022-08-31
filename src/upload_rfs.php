<?php
$servername = "localhost";
$username = "root";  // 和服务器使用的database username统一
$password = "root";  // 和服务器使用的database password统一
$error = $_FILES['file']['error'];

if ($error > 0) {
    echo '<script>alert("Error: '.$error.'")</script>';
    return;
}

$tmp_name = $_FILES['file']['tmp_name'];
$size = $_FILES['file']['size'];
$name = $_FILES['file']['name'];
$type = $_FILES['file']['type'];
$con = mysql_connect($servername, $username, $password);
mysql_select_db("rfs_db");

if ($error == UPLOAD_ERR_OK && $size > 0) {
    $fp = fopen($tmp_name, 'r');
    $content = fread($fp, $size);
    fclose($fp);  
    $content = addslashes($content);
    $sql = "INSERT INTO rfs (name, type, size, content)"
   . " VALUES ('".$name."', '".$type."', '".$size."', '".$content."')";
    mysql_query($sql, $con);
} else {
    echo '<script>alert("Database Save for upload failed.")</script>';
}
mysql_close($con);
?>