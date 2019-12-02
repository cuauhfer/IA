////////////////////////////////////////////////////////////////////////////////
//  Funciones relacionadas con los terrenos
////////////////////////////////////////////////////////////////////////////////

function pisarTerreno(nuevo){
  // Recorrer cada terreno del jugador
  for(var a = 0; a < jugando.terrenos.length; a++){
    // Si el ID coincide con el nuevo terreno
    if(nuevo.id == jugando.terrenos[a][0]){
      // Si tiene un peso, entonces aplica
      if(jugando.terrenos[a][1] != ""){
        return true;
      }
      else{
        return false;
      }
    }
  }
}

function costoTerreno(nuevo){
  // Recorrer cada terreno del jugador
  for(var a = 0; a < jugando.terrenos.length; a++){
    // Si el ID coincide con el nuevo terreno
    if(nuevo.id == jugando.terrenos[a][0]){
      // Si tiene un peso, entonces aplica
      return parseFloat(jugando.terrenos[a][1]);
    }
  }
}


////////////////////////////////////////////////////////////////////////////////
//  Distancias (Manhattan y Euclidiana)
////////////////////////////////////////////////////////////////////////////////

  function disManhattan(){
    var posY = 0;
    var posX = 0;
    for(var i = 0; i < matriz.length; i++){
      for(var j = 0; j < matriz[i].length; j++){
        if(matriz[i][j].final == true){
          posY = i;
          posX = j;
        }
      }
    }

    for(var i = 0; i < matriz.length; i++){
      for(var j = 0; j < matriz[i].length; j++){
        matriz[i][j].manhattan[0] = Math.abs(posY - i);
        matriz[i][j].manhattan[1] = Math.abs(posX - j);
        matriz[i][j].manhattan[2] = matriz[i][j].manhattan[0] + matriz[i][j].manhattan[1];
        suma = Math.pow(matriz[i][j].manhattan[0], 2) + Math.pow(matriz[i][j].manhattan[1], 2);
        matriz[i][j].euclidiana = Math.sqrt(suma).toFixed(2);
      }
    }


  }
