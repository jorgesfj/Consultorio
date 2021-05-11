const express = require('express');
const {Subject, from} = require('rxjs');
const {filter, take, distinct, skipWhile, merge} = require('rxjs/operators');
const app = express();
const bodyParser = require('body-parser');
const connection = require('./database/database');
const Pacientedb = require('./database/Paciente');
const Paciente = require('./models/Paciente');

connection.authenticate().then(()=>{
    console.log("Conexão feita com o banco de dados");
}).catch((error) => {
    console.log("Erro ao conectar com o banco de dados: " + error);
});

app.set('view engine','ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.get('/',(req,res)=>{
    Pacientedb.findAll({raw:true, order:[
        ['id','DESC']
    ]}).then(pacientes => {
        res.render('index',{
            pacientes:pacientes
        });
    });
});

app.post('/addPaciente',(req,res) => {
    var nome = req.body.paciente;
    var tipo = req.body.tipo;
    var sintoma = req.body.sintoma;
    Pacientedb.create({
        nome:nome,
        tipo:tipo,
        sintoma:sintoma
    }).then(()=>{
        res.redirect('/');
    });
});

app.get('/consulta', (req,res) => {
    const listaPacientes = [];
    Pacientedb.findAll({raw:true, order:[
        ['id','DESC']
    ]}).then(pacientes => {
        const ginecologista = new Subject();
        const pediatra = new Subject();
        const geral = new Subject();
        const cardiologista = new Subject();

        //Aceita Mulher, sintomas ginecologicos, so 1 por dia
        const pacientesGinecologista = new Array();
        //Aceita Crianca, qualquer sintoma
        const pacientesPediatra = new Array();
        //Aceita qualquer um adulto, qualquer sintoma
        const pacientesGeral = new Array();
        //Aceita qualquer um adulto, sintomas cardiologicos
        const pacientesCardiologista = new Array();

        cardiologista.pipe(
            filter(paciente => paciente.sintoma === 'cardiologico')
        ).subscribe(
            paciente => pacientesCardiologista.push(paciente)
        );
        
        pediatra.pipe(
            filter(paciente => paciente.tipo === 'crianca')
        ).subscribe(
            paciente => pacientesPediatra.push(paciente)
        );
        
        geral.pipe(
            skipWhile(paciente => paciente.tipo === 'crianca'),
            filter(paciente => paciente.sintoma === 'geral')
        ).subscribe(
            paciente => pacientesGeral.push(paciente)
        );
        
        ginecologista.pipe(
            filter(paciente => paciente.tipo === 'mulher'),
            filter(paciente => paciente.sintoma === 'ginecologico'),
            take(1)
        ).subscribe(
            paciente => pacientesGinecologista.push(paciente)
        );
        
        setPaciente = (paciente) => {
            cardiologista.next(paciente);
            pediatra.next(paciente);
            geral.next(paciente);
            ginecologista.next(paciente);
        }
          
        pacientes.forEach(paciente => setPaciente(paciente));
        
        res.render('consulta', {
            cardiologista:pacientesCardiologista,
            pediatra:pacientesPediatra,
            geral:pacientesGeral,
            ginecologista:pacientesGinecologista 
        });
    });
})

app.listen(8080,()=>{
    console.log('Servidor Inicializado corretamente!');
})