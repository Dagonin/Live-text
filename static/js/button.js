function register() {
	var x = document.getElementById("loginform");
	var z = document.getElementById("panel");
	var y = document.getElementById("registerform");
	var n = document.getElementById("link1");
	var m = document.getElementById("link2");
	if ( x.style.display === "block" ) {
		x.style.display = "none";
		y.style.display = "block";

		n.style.color = "#3578E5";
		m.style.color = "#333";


		z.style.MarginTop = "57px";
	}
}

function login() {
	var x = document.getElementById("loginform");
	var y = document.getElementById("registerform");
	var n = document.getElementById("link1");
	var m = document.getElementById("link2");
	if ( y.style.display === "block" ) {
		x.style.display = "block";
		y.style.display = "none";
		
		m.style.color = "#3578E5";
		n.style.color = "#333";
	}
}