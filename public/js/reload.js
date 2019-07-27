setTimeout(e =>{
    var content=$('#usuarioDiv2').attr("usuario") ? $('#usuarioDiv2').attr("usuario") :"no hay nada" ;
  
    
    if (content=="no hay nada" ||content=="" ) {
        location.reload();
    }
},1000)
