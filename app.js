const inicioDebug = require('debug')('app:inicio');
const dbDebug = require('debug')('app:db');
const express = require('express'); // importa express
const config = require('config');
const { func } = require('joi');
const logger = require('./logger');
const morgan = require('morgan');
const Joi = require('joi'); //Importa Joi

const app = express(); // Crea una instancia de express


//Middleware
//El middleware es un bloque de codig que se ejecuta
//entre las peticiones del usuario (cliente) y el 
//request que llega al servidor. Es un enlace entre la peticion
//del usuario y el servidor, antes de que este pueda dar una respuesta .

//Las funciones de middleware son funciones que tienen acceso
//al objeto de peticion (request,req), al objeto de respuesta (response, res)
//y a la siguiente funcion de middleware se denota
//normalmente con una variable denominada next.

//La funcion de middleware puede realizar las siguientes tareas:
//      -Ejecutar cualquier codigo
//      -Realizar cambios en la peticion y los objetos de respuesta.
//      -Finalizar el ciclo  de peticion y respuesta
//      -Invocar la siguiente funcion del middleware en la pila.

// Express es un framework de direccionamiento y de uso de middleware
// que permite que la aplicacion tenga minima funcionalidad propia.

//Ya usamos algunos middleware como express.json()
//Transforma el body del req a format JSON

//           -----------------------
// request -|-> json() --> route() -|-> response 
//           -----------------------

// route() --> Funciones GET, POST, PUT, DELETE

// JSON hace un parsing de la entrada a formato JSON
// De tal forma que lo que recibamos en el req de una
// petición

app.use(express.json()); // Se le dice a express que use este middleware
app.use(express.urlencoded({extended:true}));
app.use(express.static('public'));  // public es la carpeta que tendra los recursos necesarios

 
console.log(`Aplicacion: ${config.get('nombre')}`);
console.log(`DB Server: ${config.get('configDB.host')}`);


//Uso del middleware morgan
if(app.get('env') == 'development'){
    app.use(morgan('tiny'));
    inicioDebug('Morgan esta habilitado...');    
}

//Operaciones con bases de datos:
dbDebug('Conectado a la base de datos...');

  

// app.use(logger);//ya hace referencia a la funcion log en el otro archivo.

// app.use(function(req, res, next){
//     console.log('Autenticando...');
//     next();
// });


//Query String
//url/?var1=valor1&&var2=valor2&&var3=valor3...


//Hay cuatro tipos de peticiones

// app.get(); // Consulta datos
// app.post(); // Envia datos al servidor (insertar datos)
// app.put();  // Actualiza datos
// app.delete();   // Elimina datos



const usuarios = [

    {id: 1, nombre: 'Juan'},

    {id: 2, nombre: 'Ana'},

    {id: 3, nombre: 'Karen'},

    {id: 4, nombre: 'Luis'}

];

// Consulta en la ruta raíz de nuestro servidor

// con una función callback

app.get('/', (req, res) => {

    res.send("Hola mundo desde Express");

});



app.get('/api/usuarios', (req, res) => {

    res.send(usuarios);

});



// Cómo pasar parámetros dentro de las rutas

// p. ej. solo quiero un usuario específico en vez de todos

// Con los : delante del id Express sabe que es

// un parámetro a recibir

// http://localhost:5000/api/usuarios/1990/2/sex='m'

app.get('/api/usuarios/:id', (req, res) => {

    // .find() devuelve el primer elemento del arreglo que cumpla con un predicado

    // parseInt() hace el casteo a entero directamente

    let usuario = existeUsuario(req.params.id);

    if (!usuario)

        res.status(404).send("El usuario no se encuentra."); // Devuelve el estado HTTP

    res.send(usuario);

});


// ========= PETICIÓN POST ==========

// Tiene le mismo nombre que la petición GET

// Express hace la diferencia dependiendo del

// tipo de petciión

app.post('/api/usuarios', (req, res) => {

    //El objetivo req tiene la propiedad body.
    // let body = req.body;
    // console.log(body.nombre);
    // res.json({
    //     body
    // })
    const {value,error} = validarUsuario(req.body.nombre);
    if(!error){
        const usuario = {

            id: usuarios.length + 1,
    
            nombre: req.body.nombre
    
        };
    
        usuarios.push(usuario);
    
        res.send(usuario);
    }
    else{
        const mensaje = error.details[0].message;
        res.status(400).send(mensaje);
    }

});

//Peticion PUT
//Metodo para actualizar la informacion
app.put('/api/usuarios/:id', (req, res) => {

    let usuario = existeUsuario(req.params.id);

    if (!usuario)
    {
        res.status(404).send("El usuario no se encuentra."); // Devuelve el estado HTTP
        return;
    }
        

    const {value,error} = validarUsuario(req.body.nombre);

    if(error){
        const mensaje = error.details[0].message;
        res.status(400).send(mensaje);
        return;
    }
    
    usuario.nombre = value.nombre;
    res.send(usuario);

});



//Peticion para DELETE
//Metodo para eliminar informacion
//Recibe  el id del usuario que se quiere para eliminar 
//Utilizando un parametro en la ruta (id)
app.delete('/api/usuarios/:id', (req,res) => {
    const usuario = existeUsuario(req.params.id);
    if(!usuario){
        res.status(404).send('El usuario no se encuentra');
        return;
    }
    //Encontrar el indice del usuario
     const index = usuarios.indexOf(usuario);
     usuarios.splice(index, 1); //Elimina el elemento en el indice indicado
     res.send(usuario);
})

// Usando el módulo process, se lee una variable

// de entorno

// Si la variable no existe, va a tomar un valor

// por default (3000)

const port = process.env.PORT || 3000;



app.listen(port, () => {

    console.log(`Escuchando en el puerto ${port}.`);

});

function existeUsuario(id){
    return (usuarios.find(u=>u.id === parseInt(id)));
}

function validarUsuario(nom){
    const schema = Joi.object({
        nombre:Joi.string()
        .min(3)
        .required()
    });
    return(schema.validate({nombre:nom}));
}

// Se creó una variable de entorno con SETX PORT 5000, desde la terminal

