const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const connection = require('./database/database');
const Question = require('./database/Question');
const Answer = require('./database/Answer');

connection
    .authenticate()
    .then(()=>{
        console.log('Conexao feita com o banco de dados!');
    })
    .catch((msgErr) => {
        console.log(msgErr);
    });

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.get('/', (req,res) => {
    Question.findAll({ raw: true, order: [
        ['id','DESC'] // ASC = Crescente || DESC = Decrescente
    ] }).then(questions=>{
        res.render('index', {
            questions,
        });
    });
});

app.get('/perguntar', (req,res)=>{
    res.render('perguntar');
})

app.post('/savequestion', (req,res)=>{
    let title = req.body.title;
    let desc = req.body.description;
    Question.create({
        title,
        description: desc,
    }).then(()=>{
        res.redirect('/')
    });
});

app.get('/pergunta/:id', (req,res)=>{
    let id = req.params.id;
    Question.findOne({
        where: {id,}
    }).then(question => {
        if(question != undefined) {

            Answer.findAll({
                where: {questionId: question.id},
                order: [
                    ['id', 'DESC']
                        ],
            }).then(answers =>{
                res.render('pergunta', {
                    question,
                    answers,
                });
            });
        } else {
            res.redirect('/')
        }
    });
});

app.post('/answer', (req,res)=>{
    let body = req.body.body;
    let questionId = req.body.question;

    Answer.create({
        body,
        questionId,
    }).then(()=>{
        res.redirect(`/pergunta/${questionId}`);
    });
});

app.listen(8080, (err)=>{
    if(err){
        console.log(`Erro: ${err}`);
    } else {
        console.log('Servidor Rodando!');
    };
});
