class UsuariosSockets{

    constructor(){
        this.usuarios=[];
    }

    agregarUsuario(id,nombre){
        let usuario= {id,nombre}
        this.usuarios.push(usuario)
        return this.usuarios

    }
    getUsuarios(){
        return this.usuarios
    }
    getUsuario(id){
        let usuario=this.usuarios.filter(user=> user.id===id)
    }
    borrarUsuario(id){
        let usuarioBorrado=this.getUsuario(id)
        this.usuario = this.usuarios.filter(user => user.id != id)
        return usuarioBorrado
    }
}
module.exports={
    UsuariosSockets
}