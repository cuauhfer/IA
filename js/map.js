// _____________________________________________________________________________Variables Globales
// Matriz es la matriz de los elementos que conforman el mapa
var matriz = [];        // matriz[x][y][Objeto casilla(id, nomTerreno, inicial, final, actual, visita)]
var x = 0;              // Tamaño de la matriz en X
var y = 0;              // Tamaño de la matriz en Y
var numeros = [];       // Almacena los indices y valores del terreno
var personajes = [];    // Personajes del juego
var personajesCant = 0;
var personajesIndices = 0;

//////////////////////////////////////////////////////////////////////////////// Objeto casilla de la matriz
function casilla(id, nomTerreno, inicial, final, actual, visitados){
  this.id = id;
  this.nomTerreno = nomTerreno;
  this.inicial = inicial;
  this.final = final;
  this.actual = actual;
  this.visitados = visitados;
}

function personaje(id, nombre, terrenos){
  this.id = id;
  this.nombre = nombre;
  this.terrenos = terrenos;
}

////////////////////////////////////////////////////////////////////////////////
//  Creación del mapa
////////////////////////////////////////////////////////////////////////////////
//______________________________________________________________________________Función para reiniciar el mapa
function reset(files){
  // Limpiar la matriz y su contenedor para cargar un nuevo mapa
  matriz = [];
  x = 0;
  y = 0;
  numeros = [];

  document.getElementById("matriz").innerHTML = "";
  document.getElementById("ajustes").innerHTML = "";
  document.getElementById("detalles").innerHTML = '<p>'+
                                                    'Coordenada: <span id="labCoordenada"></span><br>'+
                                                    'Terreno: <span id="labTerreno"></span><br>'+
                                                    'Inicial: <span id="labInicial"></span><br>'+
                                                    'Final: <span id="labFinal"></span><br>'+
                                                    'Actual: <span id="labActual"></span><br>'+
                                                    'Visitas: <span id="labVisitas"></span><br>'+
                                                  '</p>';
  document.getElementById("detalles").style.visibility = "hidden";
  loadFile(files);
  document.getElementById("player").innerHTML = "";
  document.getElementById("header").innerHTML = '<label for="fileInput"><i class="fas fa-plus-circle"></i> Nuevo Mapa</label><input id="fileInput" name="fileInput" type="file" size="50" onchange="reset(this.files)">';

  personajes = [];    // Personajes del juego
  personajesCant = 0;
  personajesIndices = 0;
}

//______________________________________________________________________________Cargar .TXT en la matriz
function loadFile(files) {

  var file = files[0];                // variable del archivo
  var reader = new FileReader();      // FileReader es una clase de lectura de archivos

  // Subfuncion para lectura del archivo
  reader.onload = function (e) {
    var texto = e.target.result;  // El resultado de texto se almacena en la variable texto
    var elemento = "";            // Variables auxiliares, elemento representa un elemento (entero) de posicion [x][y]
    var fila = [];                // Fila representa una fila de la matriz [todos los x][y]

    // Recorrer cada elemento del .TXT
    for(var i = 0; i < texto.length; i++){
      // Si el elemento es un número se concatena y guarda
      if(texto[i] == "0" || texto[i] == "1" || texto[i] == "2" || texto[i] == "3" || texto[i] == "4" || texto[i] == "5" || texto[i] == "6" || texto[i] == "7" || texto[i] == "8" ||texto[i] == "9"){
        elemento += texto[i];
      }
      // Si el elemento es una coma, se guarda el número en la fila, y se busca otro número
      else if(texto[i] == ","){
        // Buscar elementos ya existentes
        if(elemento == ""){
          alert("Error: El mapa contiene un elemento vacio");
          return;
        }
        if(numeros.indexOf(elemento) == -1){
          numeros.push(elemento);
        }
        fila.push(elemento);
        elemento = "";
      }
      // Si el elemento es un salto de linea, se guarda el número en la fila, se guarda la fila y se limpian los auxiliares
      else if(texto[i] == "\n"){
        if(elemento == ""){
          alert("Error: El mapa contiene un elemento vacio");
          return;
        }
        if(numeros.indexOf(elemento) == -1){
          numeros.push(elemento);
        }
        fila.push(elemento);
        elemento = "";
        if(x == 0){
          if(fila.length == 0){
            alert("Error: El mapa contiene una fila vacia");
            return;
          }
          else if(fila.length > 15){
            alert("Error: Una fila excede el tamaño máximo");
            return;
          }
          x = fila.length;
          matriz.push(fila);
          fila = [];
        }
        else if(fila.length == x){
          matriz.push(fila);
          fila = [];
        }
        else {
          alert("Error: Filas irregulares, fila:" + (matriz.length + 1));
          return;
        }
      }
      // Si el elemento es un retorno de carro, se ignora
      else if(texto[i] == "\r"){

      }
      // Cualquier otro es un elemento extraño
      else{
        alert("Error: Caracter raro: " + texto[i]);
        return;
      }
    }
    y = matriz.length;

    colores();            // Función para imprimir la matriz en pantalla
  };

  //Leer el archivo como archivo de Texto
  reader.readAsText(file);
  document.getElementById("fileInput").value = "";
}

//______________________________________________________________________________Operadores de los colores
function colores(){
  var docAjustes = document.getElementById("ajustes");
  docAjustes.style.display = "flex";

  for (var i = 0; i < numeros.length; i++) {
    var selector =  '<div class="unColor"><label class="labelNumero" for="nombreNum">Número '+ numeros[i] +': </label>'+
                      '<input class="nombreNumero" type="text" name="nombreNum" value="" placeholder="Terreno" id="nomTerreno'+numeros[i]+'">'+
                      '<label class="labelNumero" for="nombreNum">Color '+ numeros[i] +': </label>'+
                      '<input class="colorNumero" type="color" name="colorNum" value="#FFFFFF" id="colTerreno'+numeros[i]+'"></div>';
    docAjustes.innerHTML = docAjustes.innerHTML + selector;
  }

  docAjustes.innerHTML = docAjustes.innerHTML + '<div class="div-colores"><button class="sendColors" type="button" name="button" id="sendColors" onClick="saveColors()">Guardar Terreno</button></div>';
}

//______________________________________________________________________________Guardar los nombre y colores elegidos
function saveColors(){
  var error = false;

  var auxNumeros = numeros;
  numeros = []
  var valores = []

  for (var i = 0; i < auxNumeros.length; i++) {
    idnombre = "nomTerreno"+auxNumeros[i];
    idcolor = "colTerreno"+auxNumeros[i];
    valores = [];
    valores.push(auxNumeros[i]);
    if(document.getElementById(idnombre).value == "" || document.getElementById(idnombre).value == null){
      alert("El nombre del terreno no puede estar vacio");
      numeros = auxNumeros;
      error = true;
      return;
    }
    else{
      var nomTerreno = document.getElementById(idnombre).value;
      valores.push(nomTerreno);
    }

    if(document.getElementById(idcolor).value == "" || document.getElementById(idcolor).value == null){
      alert("El color no puede estar vacio");
      numeros = auxNumeros;
      error = true;
      return;
    }
    else{
      var colTerreno = document.getElementById(idcolor).value;
      valores.push(colTerreno);
    }
    if(error == false){
      numeros.push(valores);
    }
  }
  if(error == false){
    document.getElementById("ajustes").style.display = "none";
    verMatriz();
  }
}

//______________________________________________________________________________Imprimir el mapa
function verMatriz(){
  var docMatriz = document.getElementById("matriz");

  for(var j = 0; j <= x; j++){
    if(j == 0){
      docMatriz.innerHTML = docMatriz.innerHTML + "<div class='elemento'> Y/X </div>";
    }
    else{
      docMatriz.innerHTML = docMatriz.innerHTML + "<div class='elemento'>" + j +".</div>";
    }
  }
  for(var i = 0; i < matriz.length; i++){
    docMatriz.innerHTML = docMatriz.innerHTML + "<div class='elemento'>" + (i+1) +".</div>";
    for(var j = 0; j < matriz[i].length; j++){
      docMatriz.innerHTML = docMatriz.innerHTML + "<div class='elemento' onClick='verDetalles(this);' id='"+(i+1)+"x"+(j+1)+"'>" + matriz[i][j] +"</div>";
    }
  }

  var widthElemento = "0";
  var margin = "0";

  if(x == 15){
    widthElemento = "5%";
    margin = "0.5%";
  }
  else if(x == 14){
    widthElemento = "6%";
    margin = "0.25%";
  }
  else if(x == 13){
    widthElemento = "6%";
    margin = "0.5%";
  }
  else if(x == 12){
    widthElemento = "7%";
    margin = "0.25%";
  }
  else if(x == 11){
    widthElemento = "7%";
    margin = "0.5%";
  }
  else if(x == 10){
    widthElemento = "8%";
    margin = "0.5%";
  }
  else if(x == 9){
    widthElemento = "9%";
    margin = "0.45%";
  }
  else if(x == 8){
    widthElemento = "10%";
    margin = "0.5%";
  }
  else if(x == 7){
    widthElemento = "11%";
    margin = "0.7%";
  }
  else if(x == 6){
    widthElemento = "13%";
    margin = "0.5%";
  }
  else if(x == 5){
    widthElemento = "14%";
    margin = "1.2%";
  }
  else if(x == 4){
    widthElemento = "18%";
    margin = "0.95%";
  }
  else if(x == 3){
    widthElemento = "22%";
    margin = "1.4%";
  }
  else if(x == 2){
    widthElemento = "30%";
    margin = "1.5%";
  }
  else if(x == 1){
    widthElemento = "45%";
    margin = "2.4%";
  }

  docMatriz.style.width = "90%";

  var elementos = document.getElementsByClassName("elemento");
  for(var i = 0; i < elementos.length; i++){
      for (var j = 0; j < numeros.length; j++) {
        if(elementos[i].textContent == numeros[j][0]){
          elementos[i].style.background = numeros[j][2];
          elementos[i].innerHTML = "";
        }
      }
      elementos[i].style.width = widthElemento;
      elementos[i].style.margin = margin;
  }

  var cont = 0;
  for(var i = 0; i <= y; i++){
    for(var j = 0; j <= x; j++){
      elementos[cont].innerHTML = elementos[cont].innerHTML + "<div class='x'>"+j+"</div><div class='y'>"+i+"</div>"
      cont++;
    }
  }

  //document.getElementById("detalles").style.visibility = "visible";
  document.getElementById("detalles").style.display = 'none';
  convertirMatriz();
}

//______________________________________________________________________________Matriz de elementos
function convertirMatriz(){
  var matrizAux = [];
  var filaAux = [];
  var visitados = [];

  for(var i = 0; i < matriz.length; i++){
    for(var j = 0; j < matriz[i].length; j++){
      for (var k = 0; k < numeros.length; k++) {
        if(matriz[i][j] == numeros[k][0]){
          var arregloMatriz = new casilla(matriz[i][j], numeros[k][1], false, false, false, visitados);
        }
      }
      filaAux.push(arregloMatriz);
    }
    matrizAux.push(filaAux);
    filaAux = [];
  }
  matriz = matrizAux;

  var header = document.getElementById("header");
  header.innerHTML = header.innerHTML + '<button type="button" name="button" id="addPersonaje" onclick="newCharacter()"><i class="fas fa-user-plus"></i> Nuevo Personaje</button>';
}

//______________________________________________________________________________Ver detalles de un elemento
function verDetalles(obj){
  var detalle = document.getElementById("detalles");

  var objUso = document.getElementById(obj.id);
  var coorX = objUso.firstChild.textContent;
  var coorY = objUso.lastChild.textContent;
  var coor = matriz[coorY-1][coorX-1];

  var content =   '<button type="button" name="button" onclick="hideDetalles()">X</button>'+
                  '<p>'+
                    'Coordenada: <span id="labCoordenada">X: '+ coorX +' Y: '+ coorY +'  </span><br>'+
                    'Terreno: <span id="labTerreno">'+ coor.nomTerreno +'</span><br>'+
                    'Inicial: <span id="labInicial">'+ coor.inicial +'</span><br>'+
                    'Final: <span id="labFinal">'+ coor.final +'</span><br>'+
                    'Actual: <span id="labActual">'+ coor.actual +'</span><br>'+
                    'Visitas: <span id="labVisitas"></span>'+ coor.visitados +'<br>'+
                  '</p>';

  var alertContent ='Coordenada: X: '+ coorX +' Y: '+ coorY +' \n'+
                    'Terreno: '+ coor.nomTerreno +'\n'+
                    'Inicial: '+ coor.inicial +'\n'+
                    'Final: '+ coor.final +'\n'+
                    'Actual: '+ coor.actual +'\n'+
                    'Visitas: '+ coor.visitados +'\n';

  detalle.style.display = "block";
  detalle.style.visibility = "visible";
  detalle.innerHTML = content;

  //alert(alertContent);
}

function hideDetalles(){
  document.getElementById("detalles").style.display = "none";
}
////////////////////////////////////////////////////////////////////////////////
//  Creación de los personajes
////////////////////////////////////////////////////////////////////////////////
function chancePicture(valor, id){

  var pic = document.getElementById("label"+id);
  pic.innerHTML = "<span>"+valor+"</span><img src='img/gif"+ valor +".gif' alt='Personaje'>";
}

function newCharacter(){
  if(personajesCant < 5){
    var jugadores = document.getElementById("player");

    var newPlayer="";
    newPlayer += "<div class='character' id='character" + personajesIndices + "'>";
    newPlayer += "          <div class='character-part'>";
    newPlayer += "            <label id='label"+ personajesIndices +"' for='picture" + personajesIndices + "'><span>Eevee</span><img src='img/gifEevee.gif' alt='Personaje'></label>";
    newPlayer += "            <select id='picture" + personajesIndices + "' onchange='chancePicture(this.value, "+personajesIndices+")'>";
    newPlayer += "              <option value='Eevee'>Eevee</option>";
    newPlayer += "              <option value='Vaporeon'>Vaporeon</option>";
    newPlayer += "              <option value='Flareon'>Flareon</option>";
    newPlayer += "              <option value='Jolteon'>Jolteon</option>";
    newPlayer += "              <option value='Umbreon'>Umbreon</option>";
    newPlayer += "              <option value='Espeon'>Espeon</option>";
    newPlayer += "              <option value='Leafeon'>Leafeon</option>";
    newPlayer += "              <option value='Glaceon'>Glaceon</option>";
    newPlayer += "              <option value='Silveon'>Silveon</option>";
    newPlayer += "            </select>";
    newPlayer += "          </div>";
    newPlayer += "          <div class='character-part'>";
    for(var a = 0; a < numeros.length; a++){
      newPlayer += "            <label for='"+ numeros[a][1] + personajesIndices + "'>"+ numeros[a][1] + "</label>";
      newPlayer += "            <input type='number' id='"+ numeros[a][1] + personajesIndices + "' name='' value='' placeholder='N/A' min='0'>";
    }

    newPlayer += "          </div>";
    newPlayer += "          <div class='btns'>";
    newPlayer += "            <button class='btn select' type='button' id='select-char" + personajesIndices + "' name='select-char' onClick='confirmCharacter("+ personajesIndices +")'>Confirmar</button>";
    newPlayer += "            <button class='btn delete' type='button' id='delete-char" + personajesIndices + "' name='select-char' onClick='deleteCharacter("+personajesIndices+")'>Borrar</button>";
    newPlayer += "          </div>";
    newPlayer += "        </div>";


    jugadores.innerHTML = jugadores.innerHTML + newPlayer;
    personajesIndices = personajesIndices + 1;
    personajesCant = personajesCant + 1;
  }
  else{
    alert("Máxima cantidad de personajes alcanzada");
  }
}

function deleteCharacter(id){
  document.getElementById("character"+id).outerHTML = "";
  personajesCant = personajesCant - 1;
}

function confirmCharacter(id){

  document.getElementById("select-char"+id).outerHTML = "";
  document.getElementById("delete-char"+id).outerHTML = "";
  var terrenos = [];
  var id = personajes.length;
  var nombre = document.getElementById("picture"+id).value;
  document.getElementById("picture"+id).disabled = "true";
  for(var a = 0; a < numeros.length; a++){
    var terr = []
    terr.push(numeros[a][0]);
    terr.push(document.getElementById(numeros[a][1] + id).value);
    document.getElementById(numeros[a][1] + id).disabled = "true";
    terrenos.push(terr);
  }
  var person = new personaje(id, nombre, terrenos);
  personajes.push(person);
}


////////////////////////////////////////////////////////////////////////////////
//  Modal
////////////////////////////////////////////////////////////////////////////////