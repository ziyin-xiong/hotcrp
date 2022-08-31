<?php
$servername = "localhost";
$username = "root";  // 和服务器使用的database username统一
$password = "root";  // 和服务器使用的database password统一
 
// 创建连接
$conn = new mysqli($servername, $username, $password);
// 检测连接
if ($conn->connect_error) {
    die("Connect Error: " . $conn->connect_error);
} 

// 创建用于储存review field setting的数据库，名称 rfs_db
$sql = "CREATE DATABASE IF NOT EXISTS rfs_db";
if ($conn->query($sql) === FALSE) {
    echo '<script>alert("Error creating database: '.$conn->error.'")</script>';
}
$conn->close();

// 创建用于储存用户上传setting的mysql表，名称 rfs
$con = mysql_connect($servername, $username, $password);
mysql_select_db("rfs_db");
$sql = "CREATE TABLE rfs ("
   . " id INTEGER NOT NULL AUTO_INCREMENT"
   . ", name VARCHAR(80) NOT NULL"
   . ", type VARCHAR(80) NOT NULL"
   . ", size INTEGER NOT NULL"
   . ", content BLOB"
   . ", PRIMARY KEY (id)"
   . ")";
mysql_query($sql, $con);
mysql_close($con);
?>