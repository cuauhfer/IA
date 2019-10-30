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
      return parseInt(jugando.terrenos[a][1]);
    }
  }
}
