const socket=io()

socket.on("mensaje", (information)=>{
console.log(information);

});
function emitNotification(){

    socket.emit("notifications");
}