<?php
$file=$_FILES['file'];
$fileName=$file['name'];
$src=$file['tmp_name'];
$des="../rfields_setting.txt";  // 暂时保存在src文件夹下
move_uploaded_file($src, $des);
?>