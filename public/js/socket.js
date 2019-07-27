



const socket=io()

socket.on("mensaje", (information)=>{
console.log(information);
socket.emit()
});

socket.on('connect',()=>{
    var content=$('#usuarioDiv2').attr("usuario") ? $('#usuarioDiv2').attr("usuario") : "no hay nada";
    if (content=="no hay nada" ||content=="" ) {
    socket.emit('usuarioNuevo',content);}
})

 
function emitNotification(){

    socket.emit("notifications");
    
    
}