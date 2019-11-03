// _____________________________________________________________________________Variables Globales
// Matriz es la matriz de los elementos que conforman el mapa
var matriz = [];                // matriz[x][y][Objeto casilla(id, nomTerreno, inicial, final, actual, visita)]
var x = 0;                      // Tamaño de la matriz en X
var y = 0;                      // Tamaño de la matriz en Y
var numeros = [];               // Almacena los indices y valores del terreno
var personajes = [];            // Personajes del juego
var personajesCant = 0;
var personajesIndices = 0;
var jugando = null;             // Personaje en juego
var visitados = [];             // Arreglo para contruir el arbol
var numVisita = 0;              // Cantidad de movimientos
var progreso = false;           // Indica si un juego esta en progreso
var origen = null;              // Rama de origne del arbol
var ramaAct = null;             // Rama donde se encuentra el personaje

var up = 1;
var right = 2;
var down = 3;
var left = 4;

//////////////////////////////////////////////////////////////////////////////// Objeto casilla de la matriz

  function casilla(id, coor, nomTerreno, inicial, final, actual, visitados){
    this.id = id;
    this.coordenada = coor;
    this.nomTerreno = nomTerreno;
    this.inicial = inicial;         // Booleano
    this.final = final;             // Booleano
    this.actual = actual;           // Booleano
  }

  function personaje(id, nombre, terrenos){
    this.id = id;
    this.nombre = nombre;
    this.terrenos = terrenos;
    this.inicial = null;            // Casilla
    this.final = null;              // Casilla
    this.actual = null;             // Casilla
  }

  function rama(){
    this.padre = null;
    this.hijos = [];
    this.casilla = null;
    this.costo = 0;
    this.lado = 0;             // Lado del nodo padre, Up, Down, Right, Left, Origin
  }
////////////////////////////////////////////////////////////////////////////////
//  Reinicio de juego
////////////////////////////////////////////////////////////////////////////////
  function reset(files){
    // Limpiar la matriz y su contenedor para cargar un nuevo mapa
    matriz = [];
    x = 0;
    y = 0;
    numeros = [];
    personajes = [];            // Personajes del juego
    personajesCant = 0;
    personajesIndices = 0;
    jugando = null;             // Personaje en juego
    visitados = [];             // Arreglo para contruir el arbol
    numVisita = 0;              // Cantidad de movimientos
    progreso = false;           // Indica si un juego esta en progreso


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

////////////////////////////////////////////////////////////////////////////////
//  Detalles de un elemento
////////////////////////////////////////////////////////////////////////////////
  function verDetalles(obj){
    var detalle = $("#detalles");
    var alpha = ["Index","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O"];
    var objUso = $("#"+obj.id);
    var coorX = +($("#"+obj.id+" .x").text());
    var coorY = +($("#"+obj.id+" .y").text());
    var coorVisita = $("#"+obj.id+" .visitados").text();
    var coor = matriz[coorY-1][coorX-1];

    var content =   '<button type="button" name="button" onclick="hideDetalles()">X</button>'+
                    '<p>'+
                      'Coordenada: <span id="labCoordenada" style="color: blue;">'+ alpha[coorX] + coorY +'  </span><br>'+
                      'Terreno: <span id="labTerreno" style="color: blue;">'+ coor.nomTerreno +'</span><br>';
                      if(coor.inicial == true){
                        content += 'Inicial: <span id="labInicial" style="color: green;">Si</span><br>';
                      }
                      else{
                        content += 'Inicial: <span id="labInicial" style="color: red;">No</span><br>';
                      }
                      if(coor.final == true){
                        content += 'Final: <span id="labFinal" style="color: green;">Si</span><br>';
                      }
                      else{
                        content += 'Final: <span id="labFinal" style="color: red;">No</span><br>';
                      }
                      if(coor.actual == true){
                        content += 'Actual: <span id="labActual" style="color: green;">Si</span><br>';
                      }
                      else{
                        content += 'Actual: <span id="labActual" style="color: red;">No</span><br>';
                      }
                      content += 'Visitas: <span id="labVisitas" style="color: blue;">['+ coorVisita +']</span><br></p>';

    if(jugando != null){
      for (a in jugando.terrenos){
        if(coor.id == jugando.terrenos[a][0] && jugando.terrenos[a][1] != ""){
          if(coor.inicial == false && coor.final == false && progreso == false){
            content += '<button class="point" type="button" name="button" onclick="setInicial('+(coorY-1)+','+(coorX-1)+')">Inicial</button>';
          }
          if(coor.inicial == false && coor.final == false && progreso == false){
            content += '<button class="point" type="button" name="button" onclick="setFinal('+(coorY-1)+','+(coorX-1)+')">Final</button>';
          }
        }
      }
    }

    detalle.css("display", "block");
    detalle.css("visibility", "visible");
    detalle.html(content);
  }

  function hideDetalles(){
    document.getElementById("detalles").style.display = "none";
  }
////////////////////////////////////////////////////////////////////////////////
//  Colocación de un personaje
////////////////////////////////////////////////////////////////////////////////
  function setInicial(y, x){

    for(var i = 0; i < matriz.length; i++){
      for(var j = 0; j < matriz[i].length; j++){
        if(matriz[i][j].inicial == true){
          matriz[i][j].inicial = false;
          matriz[i][j].actual = false;

          var antobjUso = $("#"+matriz[i][j].coordenada);
          var antcoorX = +($("#"+matriz[i][j].coordenada+" .x").text());
          var antcoorY = +($("#"+matriz[i][j].coordenada+" .y").text());

          var antcont = "<div class='x'>"+antcoorX+"</div>"+
                        "<div class='y'>"+antcoorY+"</div>"+
                        "<div class='visitados'></div>";

          antobjUso.html(antcont);
        }
      }
    }

    matriz[y][x].actual = true;
    matriz[y][x].inicial = true;

    jugando.inicial = matriz[y][x];
    jugando.actual = matriz[y][x];

    var objUso = $("#"+matriz[y][x].coordenada);
    var coorX = +($("#"+matriz[y][x].coordenada+" .x").text());
    var coorY = +($("#"+matriz[y][x].coordenada+" .y").text());

    var cont = "<div class='x'>"+coorX+"</div>"+
               '<div class="start"><img src="img/start.png" alt=""></div>'+
               '<div class="end"><img src="" alt=""></div>'+
               '<img id="character" src="img/'+jugando.nombre.toLowerCase()+'.png" alt="">'+
               '<div class="visitados">1, </div>'+
               "<div class='y'>"+coorY+"</div>";

    objUso.html(cont);
    var detalle = $("#detalles");
    detalle.css("display", "none");

    if(jugando.inicial != null && jugando.final != null){
      document.getElementById("inicio").innerHTML = '<button type="button" name="button" id="iniciar" onclick="move()"><i class="fas fa-gamepad"></i> Jugar</button>';
    }
  }

  function setFinal(y, x){

    for(var i = 0; i < matriz.length; i++){
      for(var j = 0; j < matriz[i].length; j++){
        if(matriz[i][j].final == true){
          matriz[i][j].final = false;

          var antobjUso = $("#"+matriz[i][j].coordenada);
          var antcoorX = +($("#"+matriz[i][j].coordenada+" .x").text());
          var antcoorY = +($("#"+matriz[i][j].coordenada+" .y").text());

          var antcont = "<div class='x'>"+antcoorX+"</div>"+
                        "<div class='y'>"+antcoorY+"</div>"+
                        "<div class='visitados'></div>";

          antobjUso.html(antcont);
        }
      }
    }

    matriz[y][x].final = true;

    jugando.final = matriz[y][x];

    var objUso = $("#"+matriz[y][x].coordenada);
    var coorX = +($("#"+matriz[y][x].coordenada+" .x").text());
    var coorY = +($("#"+matriz[y][x].coordenada+" .y").text());

    var cont = "<div class='x'>"+coorX+"</div>"+
               '<div class="start"><img src="" alt=""></div>'+
               '<div class="end"><img src="img/finish.png" alt=""></div>'+
               '<img src="" alt="">'+
               '<div class="visitados"></div>'+
               "<div class='y'>"+coorY+"</div>";

    objUso.html(cont);
    var detalle = $("#detalles");
    detalle.css("display", "none");

    if(jugando.inicial != null && jugando.final != null){
      document.getElementById("inicio").innerHTML = '<button type="button" name="button" id="iniciar" onclick="move()"><i class="fas fa-gamepad"></i> Jugar</button>';
    }
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
      var jugadores = $("#player");

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
        newPlayer += "            <input type='number' id='"+ numeros[a][1] + personajesIndices + "' name='' value='' placeholder='N/A' onchange='valCosto(this)' onkeydown='costoKey(event)' min='0'>";
      }

      newPlayer += "          </div>";
      newPlayer += "          <div class='btns'>";
      newPlayer += "            <button class='btn select' type='button' id='select-char" + personajesIndices + "' name='select-char' onClick='confirmCharacter("+ personajesIndices +")'>Seleccionar</button>";
      newPlayer += "            <button class='btn delete' type='button' id='delete-char" + personajesIndices + "' name='select-char' onClick='deleteCharacter("+personajesIndices+")'>Borrar</button>";
      newPlayer += "          </div>";
      newPlayer += "        </div>";


      jugadores.append(newPlayer);
      personajesIndices = personajesIndices + 1;
      personajesCant = personajesCant + 1;

      $("#spacer").fadeOut(300, function(){
        var aviso = '<div class="aviso"><h2>Configura tu personaje favorito y seleccionalo</h2></div>';
        $("#spacer").html(aviso);
        $("#spacer").fadeIn(300);
      });
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

    // Limpiar botones del personaje
    $("#select-char"+id).remove();
    $("#delete-char"+id).remove();

    // Agregar los terrenos al personaje
    var terrenos = [];
    var nombre = document.getElementById("picture"+id).value;
    document.getElementById("picture"+id).disabled = "true";
    for(var a = 0; a < numeros.length; a++){
      var terr = []
      terr.push(numeros[a][0]);
      terr.push(document.getElementById(numeros[a][1] + id).value);
      document.getElementById(numeros[a][1] + id).disabled = "true";
      terrenos.push(terr);
    }

    // Restablecer el juego logicamente
    jugando = null;
    numVisita = 0;
    var person = new personaje(id, nombre, terrenos);
    personajes.push(person);
    jugando = person;
    progreso = false;

    // Buscar valores anteriores de inicial o final
    for(var i = 0; i < matriz.length; i++){
      for(var j = 0; j < matriz[i].length; j++){
        // Restablecer visitados
        $("#"+matriz[i][j].coordenada+" .visitados").html("");
        $("#"+matriz[i][j].coordenada).removeClass("desconocido");
        // Reestablecer inicial
        if(matriz[i][j].inicial == true){
          matriz[i][j].inicial = false;

          var antobjUso = $("#"+matriz[i][j].coordenada);
          var antcoorX = $("#"+matriz[i][j].coordenada+" .x").text();
          var antcoorY = $("#"+matriz[i][j].coordenada+" .y").text();

          var antcont = "<div class='x'>"+antcoorX+"</div>"+
                        "<div class='y'>"+antcoorY+"</div>"+
                        "<div class='visitados'></div>";
          antobjUso.html(antcont);
        }
        // Restablecer actual
        if(matriz[i][j].actual == true){

          matriz[i][j].actual = false;

          var antobjUso = $("#"+matriz[i][j].coordenada);;
          var antcoorX = $("#"+matriz[i][j].coordenada+" .x").text();
          var antcoorY = $("#"+matriz[i][j].coordenada+" .y").text();

          var antcont = "<div class='x'>"+antcoorX+"</div>"+
                        "<div class='y'>"+antcoorY+"</div>"+
                        "<div class='visitados'></div>";
          antobjUso.html(antcont);
        }
        // Reestablecer final
        if(matriz[i][j].final == true){
          matriz[i][j].final = false;

          var antobjUso = $("#"+matriz[i][j].coordenada);;
          var antcoorX = $("#"+matriz[i][j].coordenada+" .x").text();
          var antcoorY = $("#"+matriz[i][j].coordenada+" .y").text();

          var antcont = "<div class='x'>"+antcoorX+"</div>"+
                        "<div class='y'>"+antcoorY+"</div>"+
                        "<div class='visitados'></div>";
          antobjUso.html(antcont);
        }
      }
    }
    $(document).off("keydown");

    $("#spacer").fadeOut(300, function(){
      var aviso = '<div class="aviso"><h2>Ingresa la posición inicial y final</h2></div>';
      $("#spacer").html(aviso);
      $("#spacer").fadeIn(300);
    });
  }

////////////////////////////////////////////////////////////////////////////////
//  Juego
////////////////////////////////////////////////////////////////////////////////
  function move(){
    progreso = true;
    $("#iniciar").fadeOut();
    $("#iniciar").mouseenter(function(e) {
        e.preventDefault();
    });
    numVisita = 1;
    visitados.push([numVisita, jugando.actual.coordenada]);
    enmascarar();

  	$(document).on("keydown",(function(event){
  		// 37 < left
      // 38 ^ Up
      // 39 > right
      // 40 v down
      if(event.which == 37 || event.which == 38 || event.which == 39 || event.which == 40){
        //alert("El código de la tecla " + String.fromCharCode(event.which) + " es: " + event.which);
        event.preventDefault();

        if(event.which == 37){
          moveLeft();
        }
        else if(event.which == 38){
          moveUp();
        }
        else if(event.which == 39){
          moveRight();
        }
        else if(event.which == 40){
          moveDown();
        }
      }
  	}));

    $("#spacer").fadeOut(300, function(){
      var aviso = '<div class="aviso"><h2><i class="fas fa-gamepad"></i> Jugando</h2></div>';
      $("#spacer").html(aviso);
      $("#spacer").fadeIn(300);
    });
  }

  function moveUp(){
    var act = jugando.actual.coordenada;
    var actX = +($("#"+act+" .x").text());
    var actY = +($("#"+act+" .y").text());
    if(actY-1 > 0){
      var nuevaCas = matriz[actY-2][actX-1];
    }

    if(actY > 1  && pisarTerreno(nuevaCas) == true){
      numVisita += 1;
      var nuevaCasVista = $("#"+nuevaCas.coordenada);
      var picture = $("#"+act+" #character");
      var visit = $("#"+nuevaCas.coordenada+" .visitados");

      // Desenmascarar casillas cercanas
      vecino(actY-2, actX-1);

      for(a in ramaAct.hijos){
        if(ramaAct.hijos[a].lado == up){
          ramaAct = ramaAct.hijos[a];
          break;
        }
      }
      ramasHijas(actY-2, actX-1);
      // Agregar visita a casilla
      refresh(visit, picture, nuevaCasVista);

      // Mover Eevee de la matriz
      matriz[actY-1][actX-1].actual = false;
      matriz[actY-2][actX-1].actual = true;

      // Mover Eevee en sus datos
      jugando.actual = matriz[actY-2][actX-1];
      visitados.push([numVisita, jugando.actual.coordenada]);
    }
  }

  function moveRight(){
    var act = jugando.actual.coordenada;
    var actX = +($("#"+act+" .x").text());
    var actY = +($("#"+act+" .y").text());
    var nuevaCas = matriz[actY-1][actX];

    if(actX < x  && pisarTerreno(nuevaCas) == true){
      numVisita += 1;
      var nuevaCasVista = $("#"+nuevaCas.coordenada);
      var picture = $("#"+act+" #character");
      var visit = $("#"+nuevaCas.coordenada+" .visitados");

      // Desenmascarar casillas cercanas
      vecino(actY-1, actX);

      for(a in ramaAct.hijos){
        if(ramaAct.hijos[a].lado == right){
          ramaAct = ramaAct.hijos[a];
          break;
        }
      }
      ramasHijas(actY-1, actX);

      // Agregar visita a casilla
      refresh(visit, picture, nuevaCasVista);

      // Mover Eevee de la matriz
      matriz[actY-1][actX-1].actual = false;
      matriz[actY-1][actX].actual = true;

      // Mover Eevee en sus datos
      jugando.actual = matriz[actY-1][actX];
      visitados.push([numVisita, jugando.actual.coordenada]);
    }
  }

  function moveDown(){
    var act = jugando.actual.coordenada;
    var actX = +($("#"+act+" .x").text());
    var actY = +($("#"+act+" .y").text());
    if(actY < y){
      var nuevaCas = matriz[actY][actX-1];
    }
    else{
      return;
    }

    if(actY < x && pisarTerreno(nuevaCas) == true){
      numVisita += 1;
      var nuevaCasVista = $("#"+nuevaCas.coordenada);
      var picture = $("#"+act+" #character");
      var visit = $("#"+nuevaCas.coordenada+" .visitados");

      // Desenmascarar casillas cercanas
      vecino(actY, actX-1);

      for(a in ramaAct.hijos){
        if(ramaAct.hijos[a].lado == down){
          ramaAct = ramaAct.hijos[a];
          break;
        }
      }
      ramasHijas(actY, actX-1);
      // Agregar visita a casilla
      refresh(visit, picture, nuevaCasVista);

      // Mover Eevee de la matriz
      matriz[actY-1][actX-1].actual = false;
      matriz[actY][actX-1].actual = true;

      // Mover Eevee en sus datos
      jugando.actual = matriz[actY][actX-1];
      visitados.push([numVisita, jugando.actual.coordenada]);
    }
  }

  function moveLeft(){
    var act = jugando.actual.coordenada;
    var actX = +($("#"+act+" .x").text());
    var actY = +($("#"+act+" .y").text());
    var nuevaCas = matriz[actY-1][actX-2];

    if(actX > 1 && pisarTerreno(nuevaCas) == true){
      numVisita += 1;
      var nuevaCasVista = $("#"+nuevaCas.coordenada);
      var picture = $("#"+act+" #character");
      var visit = $("#"+nuevaCas.coordenada+" .visitados");

      // Desenmascarar casillas cercanas
      vecino(actY-1, actX-2);

      for(a in ramaAct.hijos){
        if(ramaAct.hijos[a].lado == left){
          ramaAct = ramaAct.hijos[a];
          break;
        }
      }
      ramasHijas(actY-1, actX-2);
      // Agregar visita a casilla
      refresh(visit, picture, nuevaCasVista);

      // Mover Eevee de la matriz
      matriz[actY-1][actX-1].actual = false;
      matriz[actY-1][actX-2].actual = true;

      // Mover Eevee en sus datos
      jugando.actual = matriz[actY-1][actX-2];
      visitados.push([numVisita, jugando.actual.coordenada]);
    }
  }

  function refresh(visit, picture, nuevaCasVista){
    visit.fadeOut(50, function(){
      visit.html(visit.html() + numVisita + ", ");
      visit.fadeIn(50);
    });

    // Mover Eevee en la vista
    picture.fadeOut(50, function(){
      picture.detach().appendTo(nuevaCasVista);
      picture.fadeIn(50, function(){
        mision();
      });
    });

  }

  function mision(){
    // Validar si se ha cumplido la misión
    if(jugando.actual.coordenada == jugando.final.coordenada){
      alert(jugando.nombre + " ha finalizado su camino!!");
      $(document).off("keydown");

      $("#spacer").fadeOut(300, function(){
        var aviso = '<div class="aviso"><h2>Juego terminado: ';
        for(var a = 0; a < visitados.length; a++){
          aviso += visitados[a][1] + " > ";
        }
        aviso += '</h2></div>';
        $("#spacer").html(aviso);
        $("#spacer").fadeIn(300);
      });
      $("#spacer").css("height", "auto");
    }
  }
////////////////////////////////////////////////////////////////////////////////
//  Enmascaramiento
////////////////////////////////////////////////////////////////////////////////

  function enmascarar(){
    for(var i = 0; i < matriz.length; i++){
      for(var j = 0; j < matriz[i].length; j++){
        if(matriz[i][j].inicial == false && matriz[i][j].final == false){
          $("#"+matriz[i][j].coordenada).addClass("desconocido");
        }
      }
    }

    for(var i = 0; i < matriz.length; i++){
      for(var j = 0; j < matriz[i].length; j++){
        if(matriz[i][j].inicial == true){
          var initRama = new rama();
          initRama.casilla = matriz[i][j];
          initRama.costo = 0;
          initRama.lado = 0;
          origen = initRama;
          ramaAct = origen;

          var nodoHTML =  '<div class="nodo" id=rama'+origen.casilla.coordenada+' width="100%">'+
                            '<div class="nodoData">'+
                              origen.casilla.coordenada+'<br>Visita: ' +$("#"+origen.casilla.coordenada+" .visitados").text()+ '<br>costo: '+ origen.costo +' <br>'+
                            '</div>'+
                            '<div class="nodosRamas"></div>'+
                          '</div>';

          $("#arbol").html(nodoHTML);

          ramasHijas(i, j);

          if(i > 0){                                                            // Casilla superior
            $("#"+matriz[i-1][j].coordenada).removeClass("desconocido");
          }
          if(j < y-1){                                                          // Casilla derecha
            $("#"+matriz[i][j+1].coordenada).removeClass("desconocido");
          }
          if(i < x-1){                                                          // Casilla inferior
            $("#"+matriz[i+1][j].coordenada).removeClass("desconocido");
          }
          if(j > 0){                                                            // Casilla izquierda
            $("#"+matriz[i][j-1].coordenada).removeClass("desconocido");
          }
        }
      }
    }
  }

  function vecino(i, j){

    if(i > 0){                                                                  // Arriba
        $("#"+matriz[i-1][j].coordenada).removeClass("desconocido");
    }
    if(j < x-1){                                                                // Derecha
        $("#"+matriz[i][j+1].coordenada).removeClass("desconocido");
    }
    if(i < y-1){                                                                // Abajo
        $("#"+matriz[i+1][j].coordenada).removeClass("desconocido");
    }
    if(j > 0){                                                                  // Izquierda
        $("#"+matriz[i][j-1].coordenada).removeClass("desconocido");
    }

  }

  function ramasHijas(i, j){
    if(i > 0 && pisarTerreno(matriz[i-1][j])){                                  // Arriba
      if($("#"+matriz[i-1][j].coordenada+" .visitados").text() == ""){
        var aux = new rama();
        aux.casilla = matriz[i-1][j];
        aux.costo = ramaAct.costo + costoTerreno(matriz[i-1][j]);
        aux.lado = up;
        aux.padre = ramaAct;

        ramaAct.hijos.push(aux);
      }

    }
    if(j < x-1  && pisarTerreno(matriz[i][j+1])){                               // Derecha
      if($("#"+matriz[i][j+1].coordenada+" .visitados").text() == ""){
        var aux = new rama();
        aux.casilla = matriz[i][j+1];
        aux.costo = ramaAct.costo + costoTerreno(matriz[i][j+1]);
        aux.lado = right;
        aux.padre = ramaAct;

        ramaAct.hijos.push(aux);
      }
    }
    if(i < y-1 && pisarTerreno(matriz[i+1][j])){                                // Abajo
      if($("#"+matriz[i+1][j].coordenada+" .visitados").text() == ""){
        var aux = new rama();
        aux.casilla = matriz[i+1][j];
        aux.costo = ramaAct.costo + costoTerreno(matriz[i+1][j]);
        aux.lado = down;
        aux.padre = ramaAct;

        ramaAct.hijos.push(aux);
      }
    }
    if(j > 0 && pisarTerreno(matriz[i][j-1])){                                  // Izquierda
      if($("#"+matriz[i][j-1].coordenada+" .visitados").text() == ""){          
        var aux = new rama();
        aux.casilla = matriz[i][j-1];
        aux.costo = ramaAct.costo + costoTerreno(matriz[i][j-1]);
        aux.lado = left;
        aux.padre = ramaAct;

        ramaAct.hijos.push(aux);
      }
    }

    ramaAct.hijos.sort(function (a, b) {
      if (a.lado > b.lado) {
        return 1;
      }
      if (a.lado < b.lado) {
        return -1;
      }
      return 0;
    });

    printArbol(ramaAct);
  }

  function printArbol(ramita){
    var cont = $("#rama"+ramita.casilla.coordenada);
    var hijoWidth = (100/ramaAct.hijos.length);

    var nodoHTML =  '<div class="nodoData">'+
                        ramaAct.casilla.coordenada+'<br>Visita: ' +$("#"+ramaAct.casilla.coordenada+" .visitados").text()+ '<br>costo: '+ ramaAct.costo +' <br>'+
                      '</div>'+
                      '<div class="nodosRamas">';
                      for(a in ramaAct.hijos){
                        nodoHTML += '<div class="nodo" id="rama'+ramaAct.hijos[a].casilla.coordenada+'" style="width: '+hijoWidth+'%;">'+
                                          '<div class="nodoData">'+
                                            ramaAct.hijos[a].casilla.coordenada+'<br>Visita: ' +$("#"+ramaAct.hijos[a].casilla.coordenada+" .visitados").text()+ '<br>costo: '+ ramaAct.hijos[a].costo +' <br>'+
                                          '</div><div class="nodosRamas"></div></div>';
                      }
                    nodoHTML += '</div>';
    cont.html(nodoHTML);
  }
