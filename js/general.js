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
var nodoPeso = [];              // Arreglo de coordenadas y costo, sirve para el arbol

var up = 1;
var right = 2;
var down = 3;
var left = 4;

var algoritmo = 1;              // Algoritmo de busqueda    (1. Costo uniforme, 2. Busqueda voraz, 3. A*)
var distancia = 1;              // Distancia para algortimo (1. Manhattan, 2. Euclidiana)
var mejorSol = null;

var interHeu;

//////////////////////////////////////////////////////////////////////////////// Objeto casilla de la matriz

  function casilla(id, coor, nomTerreno, inicial, final, actual, visitados){
    this.id = id;
    this.coordenada = coor;
    this.nomTerreno = nomTerreno;
    this.inicial = inicial;         // Booleano
    this.final = final;             // Booleano
    this.actual = actual;           // Booleano
    this.manhattan = [0, 0, 0];
    this.euclidiana = 0;
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
    this.costoAcumulado = 0;
    this.manhattan = [0, 0, 0];
    this.euclidiana = 0;
    this.lado = 0;             // Lado del nodo padre, Up, Down, Right, Left, Origin
    this.visita = [];
    this.nivel = 0;
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

    // Reestablecer arbol
    origen = null;
    ramaAct = null;
    var nodoPeso = [];
    $("#arbol").html("");
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

    $('#inicialtxt').val(jugando.inicial.coordenada);
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
    $('#finaltxt').val(jugando.final.coordenada);
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
      $('#jugadores').css('display', 'block');
      $('#modo').css('display', 'flex');
    }
    else{
      alert("Máxima cantidad de personajes alcanzada");
    }
  }

  function deleteCharacter(id){
    document.getElementById("character"+id).outerHTML = "";
    personajesCant = personajesCant - 1;
    if(personajesCant == 0){
      $('#modo').css('display', 'none');
      $('#jugadores').css('display', 'none');
    }
  }

  function confirmCharacter(id){

    // Limpiar botones del personaje
    $("#select-char"+id).remove();
    //$("#delete-char"+id).remove();

    $("#arriba").prop('disabled', false);
    $("#abajo").prop('disabled', false);
    $("#izquierda").prop('disabled', false);
    $("#derecha").prop('disabled', false);
    $("#algoritmo").prop('disabled', false);
    $("#hden").prop('disabled', false);

    $("#inicialtxt").val("-");
    $("#finaltxt").val("-");

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
        $("#"+matriz[i][j].coordenada).removeClass("camino");
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
    // Reestablecer arbol
    origen = null;
    ramaAct = null;
    nodoPeso = [];
    $("#arbol").html("");
    // Eliminar teclas anteriores
    $(document).off("keydown");

    // Mensaje en spacer
    $("#spacer").fadeOut(300, function(){
      var aviso = '<div class="aviso"><h2>Ingresa la posición inicial y final</h2></div>';
      $("#spacer").html(aviso);
      $("#spacer").fadeIn(300);
    });
  }

  function prioridad(){
    if(parseInt($('#arriba').val()) != up){
      if($('#arriba').val() == $('#abajo').val()){
        $('#abajo').val(up);
        down = up;
        up = parseInt($('#arriba').val());
      }
      if($('#arriba').val() == $('#izquierda').val()){
        $('#izquierda').val(up);
        left = up;
        up = parseInt($('#arriba').val());
      }
      if($('#arriba').val() == $('#derecha').val()){
        $('#derecha').val(up);
        right = up;
        up = parseInt($('#arriba').val());
      }
    }

    if(parseInt($('#abajo').val()) != down){
      if($('#abajo').val() == $('#arriba').val()){
        $('#arriba').val(down);
        up = down;
        down = parseInt($('#abajo').val());
      }
      if($('#abajo').val() == $('#izquierda').val()){
        $('#izquierda').val(down);
        left = down;
        down = parseInt($('#abajo').val());
      }
      if($('#abajo').val() == $('#derecha').val()){
        $('#derecha').val(down);
        right = down;
        down = parseInt($('#abajo').val());
      }
    }

    if(parseInt($('#izquierda').val()) != left){
      if($('#izquierda').val() == $('#abajo').val()){
        $('#abajo').val(left);
        down = left;
        left = parseInt($('#izquierda').val());
      }
      if($('#izquierda').val() == $('#arriba').val()){
        $('#arriba').val(left);
        up = left;
        left = parseInt($('#izquierda').val());
      }
      if($('#izquierda').val() == $('#derecha').val()){
        $('#derecha').val(left);
        right = left;
        left = parseInt($('#izquierda').val());
      }
    }

    if(parseInt($('#derecha').val()) != right){
      if($('#derecha').val() == $('#abajo').val()){
        $('#abajo').val(right);
        down = right;
        right = parseInt($('#derecha').val());
      }
      if($('#derecha').val() == $('#izquierda').val()){
        $('#izquierda').val(right);
        left = right;
        right = parseInt($('#derecha').val());
      }
      if($('#derecha').val() == $('#arriba').val()){
        $('#arriba').val(right);
        up = right;
        right = parseInt($('#derecha').val());
      }
    }

    if(parseInt($('#algoritmo').val()) != 1 && parseInt($('#algoritmo').val()) != 4){
      $('.distancias').css('display', 'flex');
    }
    if(parseInt($('#algoritmo').val()) == 1 || parseInt($('#algoritmo').val()) == 4){
      $('.distancias').css('display', 'none');
    }

    algoritmo = parseInt($('#algoritmo').val());
    distancia = parseInt($('#hden').val());
  }

////////////////////////////////////////////////////////////////////////////////
//  Juego manual
////////////////////////////////////////////////////////////////////////////////
  function move(){
    disManhattan();
    progreso = true;
    $("#iniciar").fadeOut();
    $("#iniciar").mouseenter(function(e) {
        e.preventDefault();
    });
    numVisita = 1;
    visitados.push([numVisita, jugando.actual.coordenada]);
    enmascarar();

    $("#arriba").prop('disabled', true);
    $("#abajo").prop('disabled', true);
    $("#izquierda").prop('disabled', true);
    $("#derecha").prop('disabled', true);
    $("#algoritmo").prop('disabled', true);
    $("#hden").prop('disabled', true);

    if(algoritmo != 4){
      mejorSol = origen;
      // setInterval(function(){ alert("Hello"); }, 3000);
      interHeu = setInterval(function(){ heuristico(); }, 1500);
    }
    // Jugar con modo manual
    if(algoritmo == 4){
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
    }

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
      // Agregar visita a casilla
      refresh(visit, picture, nuevaCasVista);
      var movIt = false;
      for(a in ramaAct.hijos){
        if(ramaAct.hijos[a].lado == up){
          ramaAct = ramaAct.hijos[a];
          ramaAct.visita.push(numVisita);
          movIt = true;
          break;
        }
      }
      if(movIt == false){
        buscaRama(origen, nuevaCas);
        ramaAct.visita.push(numVisita);
        ramasHijas(actY-2, actX-1);
      }
      else{
        ramasHijas(actY-2, actX-1);
      }

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
      // Agregar visita a casilla
      refresh(visit, picture, nuevaCasVista);
      var movIt = false;
      for(a in ramaAct.hijos){
        if(ramaAct.hijos[a].lado == right){
          ramaAct = ramaAct.hijos[a];
          ramaAct.visita.push(numVisita);
          movIt = true;
          break;
        }
      }
      if(movIt == false){
        buscaRama(origen, nuevaCas);
        ramaAct.visita.push(numVisita);
        ramasHijas(actY-1, actX);
      }
      else{
        ramasHijas(actY-1, actX);
      }

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
      // Agregar visita a casilla
      refresh(visit, picture, nuevaCasVista);
      var movIt = false;
      for(a in ramaAct.hijos){
        if(ramaAct.hijos[a].lado == down){
          ramaAct = ramaAct.hijos[a];
          ramaAct.visita.push(numVisita);
          movIt = true;
          break;
        }
      }
      if(movIt == false){
        buscaRama(origen, nuevaCas);
        ramaAct.visita.push(numVisita);
        ramasHijas(actY, actX-1);
      }
      else{
        ramasHijas(actY, actX-1);
      }

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
      // Agregar visita a casilla
      refresh(visit, picture, nuevaCasVista);
      var movIt = false;
      for(a in ramaAct.hijos){
        if(ramaAct.hijos[a].lado == left){
          ramaAct = ramaAct.hijos[a];
          ramaAct.visita.push(numVisita);
          movIt = true;
          break;
        }
      }
      if(movIt == false){
        buscaRama(origen, nuevaCas);
        ramaAct.visita.push(numVisita);
        ramasHijas(actY-1, actX-2);
      }
      else{
        ramasHijas(actY-1, actX-2);
      }


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

      clearInterval(interHeu);

      var ramaCam = new rama();

      ramaCam = ramaAct;

      while(ramaCam.casilla.coordenada != origen.casilla.coordenada){
        $("#"+ramaCam.casilla.coordenada).addClass("camino");
        ramaCam = ramaCam.padre;
      }
      $("#"+origen.casilla.coordenada).addClass("camino");
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
          if(algoritmo == 1 || algoritmo == 4){
            initRama.costo = 0;
          }
          if(algoritmo == 2 || algoritmo == 3){
            if(distancia == 1){
              initRama.costo = matriz[i][j].manhattan[2];
            }
            if(distancia == 2){
              initRama.costo = matriz[i][j].euclidiana;
            }
          }
          initRama.manhattan = matriz[i][j].manhattan;
          initRama.euclidiana = matriz[i][j].euclidiana;
          initRama.lado = 0;
          initRama.visita.push(numVisita);

          origen = initRama;
          ramaAct = origen;

          var coorPeso = [ramaAct.casilla.coordenada , ramaAct.costo];
          nodoPeso.push(coorPeso);

          var nodoHTML =  '<div class="nodo" id=rama'+origen.casilla.coordenada+' width="100%">'+
                            '<div class="nodoData">'+
                              origen.casilla.coordenada+'<br><p class="visitas">'+origen.visita+'</p><br><p class="costo">'+ origen.costo +'</p><br>'+
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
    if(i > 0 && pisarTerreno(matriz[i-1][j])){                                  // Si no excede el mapa
      if($("#"+matriz[i-1][j].coordenada+" .visitados").text() == ""){          // Si la casilla no ha sido visitada
        var entrada = true;
        var aux = new rama();
        aux.casilla = matriz[i-1][j];
        if(algoritmo == 1 || algoritmo == 4){
          aux.costo = ramaAct.costo + costoTerreno(matriz[i-1][j]);
        }
        if(algoritmo == 2){
          if(distancia == 1){
            aux.costo = matriz[i-1][j].manhattan[2];
          }
          if(distancia == 2){
            aux.costo = matriz[i-1][j].euclidiana;
          }
        }
        if(algoritmo == 3){
          if(distancia == 1){
            aux.costoAcumulado = ramaAct.costoAcumulado + costoTerreno(matriz[i-1][j]);
            aux.costo = parseFloat(aux.costoAcumulado) + parseFloat(matriz[i-1][j].manhattan[2]);
          }
          if(distancia == 2){
            aux.costoAcumulado = ramaAct.costoAcumulado + costoTerreno(matriz[i-1][j]);
            aux.costo = parseFloat(aux.costoAcumulado) + parseFloat(matriz[i-1][j].euclidiana);
          }
        }
        aux.manhattan = matriz[i-1][j].manhattan;
        aux.euclidiana = matriz[i-1][j].euclidiana;
        aux.lado = up;
        aux.padre = ramaAct;

        for(a in nodoPeso){
          if(nodoPeso[a][0] == aux.casilla.coordenada){
            if(nodoPeso[a][1] <= aux.costo){
              entrada = false;
            }
            else{
              if(nodoPeso[a][1] != aux.costo){
                eliminaRama(origen, nodoPeso[a][0]);
              }
            }
          }
        }
        if(entrada == true){
          var coorPeso = [aux.casilla.coordenada , aux.costo];
          nodoPeso.push(coorPeso);
          ramaAct.hijos.push(aux);
        }
      }
    }
    if(j < x-1  && pisarTerreno(matriz[i][j+1])){                               // Derecha
      if($("#"+matriz[i][j+1].coordenada+" .visitados").text() == ""){
        var entrada = true;
        var aux = new rama();
        aux.casilla = matriz[i][j+1];
        if(algoritmo == 1 || algoritmo == 4){
          aux.costo = ramaAct.costo + costoTerreno(matriz[i][j+1]);
        }
        if(algoritmo == 2){
          if(distancia == 1){
            aux.costo = matriz[i][j+1].manhattan[2];
          }
          if(distancia == 2){
            aux.costo = matriz[i][j+1].euclidiana;
          }
        }
        if(algoritmo == 3){
          if(distancia == 1){
            aux.costoAcumulado = ramaAct.costoAcumulado + costoTerreno(matriz[i][j+1]);
            aux.costo = parseFloat(aux.costoAcumulado) + parseFloat(matriz[i][j+1].manhattan[2]);
          }
          if(distancia == 2){
            aux.costoAcumulado = ramaAct.costoAcumulado + costoTerreno(matriz[i][j+1]);
            aux.costo = parseFloat(aux.costoAcumulado) + parseFloat(matriz[i][j+1].euclidiana);
          }
        }
        aux.manhattan = matriz[i][j+1].manhattan;
        aux.euclidiana = matriz[i][j+1].euclidiana;
        aux.lado = right;
        aux.padre = ramaAct;

        for(a in nodoPeso){
          if(nodoPeso[a][0] == aux.casilla.coordenada){
            if(nodoPeso[a][1] <= aux.costo){
              entrada = false;
            }
            else{
              if(nodoPeso[a][1] != aux.costo){
                eliminaRama(origen, nodoPeso[a][0]);
              }
            }
          }
        }
        if(entrada == true){
          var coorPeso = [aux.casilla.coordenada , aux.costo];
          nodoPeso.push(coorPeso);
          ramaAct.hijos.push(aux);
        }
      }
    }
    if(i < y-1 && pisarTerreno(matriz[i+1][j])){                                // Abajo
      if($("#"+matriz[i+1][j].coordenada+" .visitados").text() == ""){
        var entrada = true;
        var aux = new rama();
        aux.casilla = matriz[i+1][j];
        if(algoritmo == 1 || algoritmo == 4){
          aux.costo = ramaAct.costo + costoTerreno(matriz[i+1][j]);
        }
        if(algoritmo == 2){
          if(distancia == 1){
            aux.costo = matriz[i+1][j].manhattan[2];
          }
          if(distancia == 2){
            aux.costo = matriz[i+1][j].euclidiana;
          }
        }
        if(algoritmo == 3){
          if(distancia == 1){
            aux.costoAcumulado = ramaAct.costoAcumulado + costoTerreno(matriz[i+1][j]);
            aux.costo = parseFloat(aux.costoAcumulado) + parseFloat(matriz[i+1][j].manhattan[2]);
          }
          if(distancia == 2){
            aux.costoAcumulado = ramaAct.costoAcumulado + costoTerreno(matriz[i+1][j]);
            aux.costo = parseFloat(aux.costoAcumulado) + parseFloat(matriz[i+1][j].euclidiana);
          }
        }
        aux.manhattan = matriz[i+1][j].manhattan;
        aux.euclidiana = matriz[i+1][j].euclidiana;
        aux.lado = down;
        aux.padre = ramaAct;

        for(a in nodoPeso){
          if(nodoPeso[a][0] == aux.casilla.coordenada){
            if(nodoPeso[a][1] <= aux.costo){
              entrada = false;
            }
            else{
              if(nodoPeso[a][1] != aux.costo){
                eliminaRama(origen, nodoPeso[a][0]);
              }
            }
          }
        }
        if(entrada == true){
          var coorPeso = [aux.casilla.coordenada , aux.costo];
          nodoPeso.push(coorPeso);
          ramaAct.hijos.push(aux);
        }
      }
    }
    if(j > 0 && pisarTerreno(matriz[i][j-1])){                                  // Izquierda
      if($("#"+matriz[i][j-1].coordenada+" .visitados").text() == ""){
        var entrada = true;
        var aux = new rama();
        aux.casilla = matriz[i][j-1];
        if(algoritmo == 1 || algoritmo == 4){
          aux.costo = ramaAct.costo + costoTerreno(matriz[i][j-1]);
        }
        if(algoritmo == 2){
          if(distancia == 1){
            aux.costo = matriz[i][j-1].manhattan[2];
          }
          if(distancia == 2){
            aux.costo = matriz[i][j-1].euclidiana;
          }
        }
        if(algoritmo == 3){
          if(distancia == 1){
            aux.costoAcumulado = ramaAct.costoAcumulado + costoTerreno(matriz[i][j-1]);
            aux.costo = parseFloat(aux.costoAcumulado) + parseFloat(matriz[i][j-1].manhattan[2]);
          }
          if(distancia == 2){
            aux.costoAcumulado = ramaAct.costoAcumulado + costoTerreno(matriz[i][j-1]);
            aux.costo = parseFloat(aux.costoAcumulado) + parseFloat(matriz[i][j-1].euclidiana);
          }
        }
        aux.manhattan = matriz[i][j-1].manhattan;
        aux.euclidiana = matriz[i][j-1].euclidiana;
        aux.lado = left;
        aux.padre = ramaAct;

        for(a in nodoPeso){
          if(nodoPeso[a][0] == aux.casilla.coordenada){
            if(nodoPeso[a][1] <= aux.costo){
              entrada = false;
            }
            else{
              if(nodoPeso[a][1] != aux.costo){
                eliminaRama(origen, nodoPeso[a][0]);
              }
            }
          }
        }
        if(entrada == true){
          var coorPeso = [aux.casilla.coordenada , aux.costo];
          nodoPeso.push(coorPeso);
          ramaAct.hijos.push(aux);
        }
      }
    }

    ramaAct.hijos.sort(function (a, b) {                                        // Ordenar los nodos segun la configuracion
      if (a.lado > b.lado) {
        return 1;
      }
      if (a.lado < b.lado) {
        return -1;
      }
      return 0;
    });
    arbol(origen, 5);
  }

  function arbol(){
    $("#arbol").html("");
    hoja(origen, 0);
  }

  function hoja(ramas, esp){
    var espacios = "<div id='rama"+ramas.casilla.coordenada+"' onclick='$(\"#hijos"+ramas.casilla.coordenada+"\").slideToggle(); $(\"#row"+ramas.casilla.coordenada+" i\").slideToggle();'>";
    for (var i = 0; i < esp; i++){
      espacios += "&nbsp;";
    }
    espacios += "<span id='row"+ramas.casilla.coordenada+"' class='row'><i class='fas fa-chevron-down'></i></span><span class='rama'><span class='cascoor' style='background: "+$("#"+ramas.casilla.coordenada).css("background-color")+";'> <span class='buble'>"+ ramas.casilla.coordenada + "</span> </span><span class='costo'> Costo: ";
    if(algoritmo == 1 || algoritmo == 2 || algoritmo == 4){
      espacios += ramas.costo;
    }
    if(algoritmo == 3){
      if(distancia == 1){
        espacios += ramas.costoAcumulado;
        espacios += " + " + ramas.manhattan[2] + " = ";
        espacios += ramas.costo;
      }
      if(distancia == 2){
        espacios += ramas.costoAcumulado;
        espacios += " + " + ramas.euclidiana + " = ";
        espacios += ramas.costo;
      }
    }
    espacios += "</span><span class='visita'>";
    if(ramas.visita.length != 0){
      espacios +=  "Visita: ";
      for(a in ramas.visita){
        espacios += ramas.visita[a] + ", ";
      }
    }
    espacios += "</span></span>";
    if(ramas.casilla.coordenada == jugando.final.coordenada){
      espacios += "<span class='final'>Final</span>";
    }
    if(ramas.casilla.coordenada == jugando.inicial.coordenada){
      espacios += "<span class='inicial'>Inicial</span>";
    }
    if(ramas.visita[ramas.visita.length-1] == numVisita){
      espacios += "<span class='actual'>Actual</span>";
    }
    espacios += "<br></div><div id='hijos"+ramas.casilla.coordenada+"'></div>";

    if($("#arbol").html() == ""){
      $("#arbol").append(espacios);
    }
    else{
      var coorPadre = ramas.padre.casilla.coordenada;
      $("#hijos"+coorPadre).append(espacios);
    }

    ramas.nivel = (esp/11);

    for (a in ramas.hijos){
      hoja(ramas.hijos[a], esp+11);
    }
  }

  function buscaRama(ramas, nodo){

    if(nodo.coordenada == ramas.casilla.coordenada){
      ramaAct = ramas;
    }
    for (a in ramas.hijos){
      buscaRama(ramas.hijos[a], nodo);
    }
  }

////////////////////////////////////////////////////////////////////////////////
//  Algoritmos heuristicos
////////////////////////////////////////////////////////////////////////////////

  function heuristico(){
    mejorRama(origen);
    deP1aP2(mejorSol.casilla.coordenada);
  }

  function deP1aP2(np){
    var act = jugando.actual.coordenada;
    numVisita += 1;

    var nuevaCasVista = $("#"+np);
    var picture = $("#"+act+" #character");
    var visit = $("#"+np+" .visitados");

    var posOrigen;
    var posDestino;
    for(var i = 0; i < matriz.length; i++){
      for(var j = 0; j < matriz[i].length; j++){
        if(matriz[i][j].coordenada == jugando.actual.coordenada){
          matriz[i][j].actual = false;
        }
      }
    }
    for(var i = 0; i < matriz.length; i++){
      for(var j = 0; j < matriz[i].length; j++){
        if(matriz[i][j].coordenada == np){
          matriz[i][j].actual = true;
          jugando.actual = matriz[i][j];
        }
      }
    }
    var act = jugando.actual.coordenada;
    var actX = +($("#"+act+" .x").text());
    var actY = +($("#"+act+" .y").text());
    // Desenmascarar casillas cercanas
    vecino(actY-1, actX-1);
    // Agregar visita a casilla
    refresh(visit, picture, nuevaCasVista);
    // arbol
    var nuevaCas = matriz[actY-1][actX-1];
    buscaRama(origen, nuevaCas);
    ramaAct.visita.push(numVisita);
    ramasHijas(actY-1, actX-1);

  }

  function mejorRama(ramas){

    if(ramas.visita.length == 0){
      if(mejorSol.visita.length  != 0){
        mejorSol = ramas;
      }
      if(ramas.costo <= mejorSol.costo){
        if(ramas.costo < mejorSol.costo){
          mejorSol = ramas;
        }
        else if(ramas.costo == mejorSol.costo && ramas.nivel < mejorSol.nivel){
          mejorSol = ramas;
        }
      }
    }

    for (a in ramas.hijos){
      mejorRama(ramas.hijos[a]);
    }
  }

////////////////////////////////////////////////////////////////////////////////
//  Eliminar nodos
////////////////////////////////////////////////////////////////////////////////

  function eliminaRama(ramas, nodo){
    console.log(nodo);
    if(nodo == ramas.casilla.coordenada){
      for(a in nodoPeso){
        if(nodoPeso[a][0] == nodo){
          nodoPeso.splice(a, 1);
        }
      }
      ramas = ramas.padre;
      for(a in ramas.hijos){
        if(ramas.hijos[a].casilla.coordenada == nodo){
          ramas.hijos.splice(a, 1);
        }
      }
    }
    for (a in ramas.hijos){
      eliminaRama(ramas.hijos[a], nodo);
    }
  }
