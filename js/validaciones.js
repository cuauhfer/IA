////////////////////////////////////////////////////////////////////////////////
//  Validaciones de los costos
////////////////////////////////////////////////////////////////////////////////
 function valCosto(inp){
   var valor = inp.value.toString();
   var filtro = "";
   var decimal = false;
   var numDecimal = 0;

   for(var a = 0; a < valor.length; a++){
     if(valor.charAt(a) == "-"){
       alert("No se permiten numeros negativos");
       filtro = "";
       break;
     }
     else if (valor.charAt(a) == "e") {
       alert("No se permiten exponenciales");
       filtro = "";
       break;
     }
     else if(valor.charAt(a) == "."){
       if(decimal == false){
         filtro += valor.charAt(a);
         decimal = true;
       }
       else{
         alert("Error: Más de un punto decimal");
         filtro = "";
         break;
       }
     }
     else{
       if(decimal == true){
         numDecimal += 1;
       }
       if(numDecimal <=2){
         filtro += valor.charAt(a);
       }
     }
   }
   inp.value = filtro;
 }

 function costoKey(event){

    if(event.which == 69){
      event.preventDefault();
    }
    if(event.which == 109){
      event.preventDefault();
    }
    if(event.which == 107){
      event.preventDefault();
    }
 }
