

async function fetchLogin(data){
  try {
    const response = await fetch("/login", {
      method: "PUT", 
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    console.log("Success:", result)
    
    
      if (result.success == false) {
        swal({
          title: "Datos incorrectos",
          icon: "warning",
          button: "Ok!",
        });
      } 
      else if (result.success == true) {
        localStorage.setItem("user", data.user); //Guardo el usuario en el localStorage
        if(result.admin == true){
          location.href ='/admin';
        }
        else {
          location.href ='/salas';
      }}

  } catch (error) {
    console.error("Error:", error);
  }
}

function login() {
  let user = document.getElementById("userId").value
  let pass = document.getElementById("passwordId").value

  let object = {
      user: user,
      pass: pass
  }

  if(object.user != "" && object.pass != ""){
    fetchLogin(object)
    
  }
  else{
    swal({
      title: "No ingreso ningun dato",
      button: "Ok!",
    });
  }
}

function goToRooms() {
  location.href='/salas'
}
function goToHome() {
  location.href ='/home';
}

function botonVolver() {
  location.href = '/inicio'
}

async function fetchBannearJson(data){
  try {
    const response = await fetch("/bannear", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    console.log("Success:", result)
    
      if (result.bannear == false) {
        swal({
          title: "No existe el usuario",
          icon: "warning",
          button: "Ok!",
        });
      } 
      else if (result.bannear == true) {
        swal({
          title: "Usuario banneado correctamente",
          icon: "success",
          button: "Ok!",
        });

  }}
  catch (error) {
    console.error("Error:", error);
  }
}


function bannearUser() {
  let mail = document.getElementById("mail_ban").value

  let data = {
     mail:mail
  }

  if(data.mail != ""){
    fetchBannearJson(data) 
  }
  else{
    swal({
      title: "No ingreso ningun mail",
      button: "Ok!",
    });
  }
}






async function eliminarSalaJson(data){
  try {
    const response = await fetch("/eliminar_sala", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    console.log("Success:", result)
    
      if (result.bannear == false) {
        swal({
          title: "No existe la sala",
          icon: "warning",
          button: "Ok!",
        });
      } 
      else if (result.bannear == true) {
        swal({
          title: "Sala eliminada correctamente",
          icon: "success",
          button: "Ok!",
        });

  }}
  catch (error) {
    console.error("Error:", error);
  }
}


function eliminarSala() {
  let sala = document.getElementById("idsala").value

  let data = {
     sala:sala
  }

  if(data.sala != ""){
    eliminarSalaJson(data) 
  }
  else{
    swal({
      title: "No ingreso ninguna sala",
      button: "Ok!",
    });
  }
}

async function fetchCrearSala(data){
  try {
    const response = await fetch("/crear_sala", {
      method: "POST", 
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if(result.sala.length>0){
      document.getElementById("salas").innerHTML += `
      <div onclick="goToRoom('${data.sala}')" class="menu" id="sala">
        <div class="lateralizquierdo">
      </div>
      <div>
          <h2 class="yellowtext">Sala de "${data.sala}"</h2>
      </div>
  </div>
      `
    }
    console.log("Success:", result)
  } catch (error) {
    console.error("Error:", error);
  }
}

function crearSala(){
  let sala = document.getElementById("nombre_sala").value
  let data = {
    sala:sala
  }
  if (data.sala != "") {
    fetchCrearSala(data)
  }
}

function goToRoom(sala){
  console.log(sala)
  guardarSalaSeleccionada(sala)

}

async function guardarSalaSeleccionada(sala) {
  try {
    const response = await fetch("/sala_seleccionada", {
      method: "POST", 
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({sala: sala}),
    });
    const result = await response.json();
    location.href = '/truco_online';
  } catch (error) {
    console.error("Error:", error);
  }
}

function iralogin(){
  location.href ='/login';
}

function iraregistro(){
  location.href ='/register';
}

function iraAnotador(){
  location.href ='/anotador';
}

function iraReglas() {
  location.href ='/reglas';
}

function iraReglas2() {
  location.href ='/reglas2';
}

function iraReglas3() {
  location.href ='/reglas3';
}

function recargarSala(){
  location.href ='/salas';
}

async function clima() {
  temp = "Temperatura: "+ await fetchClima()
  console.log(temp)
  divClima=document.getElementById("clima")
  if (divClima){
    divClima.innerHTML = temp
  }
}

async function fetchClima(){
  try {
    const response = await fetch("http://ws.smn.gob.ar/map_items/weather", {
      method: "get",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const result = await response.json();
    let capi = result.find((ciudad)=> ciudad.name == "Capital Federal");
    console.log(capi.weather.tempDesc);
    return capi.weather.tempDesc
  } catch (error) {
    console.error("Error:", error);
  }
}




/*const idbotontexto = document.getElementById("botontexto");
const input = document.querySelector("input");

input.addEventListener("keypress", logKey);

function logKey(e) {
  idbotontexto.textContent += ` ${e.code}`;
}
*/



  