////////////////////////////////////////////////////////////////////////////////
//  Creación del mapa
////////////////////////////////////////////////////////////////////////////////

//____________________________________________________________________________Cargar .TXT en la matriz
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

//____________________________________________________________________________Operadores de los colores
function colores(){
  var docAjustes = document.getElementById("ajustes");
  docAjustes.style.display = "flex";

  for (var i = 0; i < numeros.length; i++) {
    var selector =  '<div class="unColor"><label class="labelNumero" for="nombreNum">Número '+ numeros[i] +': </label>'+
                      '<input class="nombreNumero" type="text" name="nombreNum" value="" placeholder="Nombre del terreno" id="nomTerreno'+numeros[i]+'">'+
                      '<label class="labelNumero" for="nombreNum" style="font-size: 14px;">Color del terreno:</label>'+
                      '<input class="colorNumero" type="color" name="colorNum" value="#FFFFFF" id="colTerreno'+numeros[i]+'"></div>';
    docAjustes.innerHTML = docAjustes.innerHTML + selector;
  }

  docAjustes.innerHTML = docAjustes.innerHTML + '<div class="div-colores"><button class="sendColors" type="button" name="button" id="sendColors" onClick="saveColors()">Guardar Terreno</button></div>';


  $("#spacer").fadeOut(300, function(){
    var aviso = '<div class="aviso"><h2>Ingrese el nombre y color de cada terreno encontrado</h2></div>';
    $("#spacer").html(aviso);
    $("#spacer").fadeIn(300);
  });
}

//____________________________________________________________________________Guardar los nombre y colores elegidos
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

//____________________________________________________________________________Imprimir el mapa
function verMatriz(){
  var docMatriz = document.getElementById("matriz");
  var alpha = ["Index","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O"];
  for(var j = 0; j <= x; j++){
    if(j == 0){
      docMatriz.innerHTML = docMatriz.innerHTML + "<div class='elemento'> Y/X </div>";
    }
    else{
      docMatriz.innerHTML = docMatriz.innerHTML + "<div class='elemento'>" + alpha[j] +".</div>";
    }
  }
  for(var i = 0; i < matriz.length; i++){
    docMatriz.innerHTML = docMatriz.innerHTML + "<div class='elemento'>" + (i+1) +".</div>";
    for(var j = 0; j < matriz[i].length; j++){
      docMatriz.innerHTML = docMatriz.innerHTML + "<div class='elemento' onClick='verDetalles(this);' id='"+alpha[j+1]+(i+1)+"'>" + matriz[i][j] +"</div>";
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
      if(i != 0 && j != 0){
        elementos[cont].innerHTML = elementos[cont].innerHTML + "<div class='x'>"+j+"</div><div class='visitados'></div><div class='y'>"+i+"</div>";
      }
      cont++;
    }
  }

  //document.getElementById("detalles").style.visibility = "visible";
  document.getElementById("detalles").style.display = 'none';
  convertirMatriz();

  $("#spacer").fadeOut(300, function(){
      var aviso = '<div class="aviso"><h2>Hora de crear algunos personajes</h2></div>';
    $("#spacer").html(aviso);
    $("#spacer").fadeIn(300);
  });
}

//____________________________________________________________________________Matriz de elementos
function convertirMatriz(){
  var alpha = ["Index","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O"];
  var matrizAux = [];
  var filaAux = [];
  var visitados = [];

  for(var i = 0; i < matriz.length; i++){
    for(var j = 0; j < matriz[i].length; j++){
      for (var k = 0; k < numeros.length; k++) {
        if(matriz[i][j] == numeros[k][0]){
          var coorde = alpha[j+1] + (i+1);
          var arregloMatriz = new casilla(matriz[i][j], coorde, numeros[k][1], false, false, false, visitados);
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
