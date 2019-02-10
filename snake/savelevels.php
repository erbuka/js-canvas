<?
	$data = stripslashes($_POST["data"]);

	$f = fopen("../levels.json", "w");
	fwrite($f, $data);
	fclose($f);

	header("HTTP/1.0 200 OK");

?>