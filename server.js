var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var moongose = require('mongoose');
var Produto = require('./app/models/product');

moongose.connect('mongodb://localhost/bdCrud');

//configuração para a aplição usar o body-parser 
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

//Definir porta onde o servidor vai responder
var port = process.env.port || 8000;

//Definindo as rotas
var router = express.Router();//interceptação de todas as rotas(requisições)

//Middleware
router.use(function(req,res,next){
    console.log("interceptação pelo Middleware");
    next(); //continuação da api
});

router.get('/', function(req,res){
    res.json({'message':'OK, rota de teste funcionando'});
});

router.route('/produtos/:productId')
    .get(function(req,res){
        const id = req.params.productId;

        Produto.findById(id, function(err, produto){
            if(err){
                res.status(500).json({
                    message:"Erro ao tentar encontrar produto; Id não informado"
                });
            }else if(produto == null){
                res.status(400).json({
                    message:"Produto não encontrado"
                });
            }else{
                res.status(200).json({
                    message:"retorno de produto",
                    produto:produto
                });
            }
        });
    })

    .put(function(req,res){
        const id = req.params.productId;

        Produto.findById(id, function(err, produto){
            if(err){
                res.status(500).json({
                    message:"Erro ao tentar encontrar produto; Id não informado"
                });
            }else if(produto == null){
                res.status(400).json({
                    message:"Produto não encontrado"
                });
            }else{
                produto.nome = req.body.nome;
                produto.preco = req.body.preco;
                produto.descricao = req.body.descricao;

                produto.save(function(erro){
                    if(erro){
                    res.send("Erro ao tentar atualizar produto: "+erro);
                    };
                    res.status(200).json({message:"produto atualizado com sucesso"});
                })
            }
        });
    })

    .delete(function(req,res){
        Produto.findByIdAndRemove(req.params.productId, (err,produto)=>{
            if(err){
                return res.status(500).send(err);
            }

            const response = {
                message:"Produto removido com sucesso",
                id:produto.id
            };

            return res.status(200).send(response);
        });
    })


router.route('/produtos')
    .post(function(req,res){
        var produto = new Produto();
        produto.nome = req.body.nome;
        produto.preco = req.body.preco;
        produto.descricao = req.body.descricao;
console.log(JSON.stringify(req.body));
        produto.save(function(error){
            if (error) {
                res.send("Erro ao salvar produto");
            }
            res.status(201).json({message: 'produto '+produto.nome+' inserido com sucesso'});
        });
    })

    .get(function(req,res){
        //Produto.find
        Produto.find(function(err, prods){
            if(err){
                res.send(err);
            }
            res.status(200).json({
                message: "Produtos buscados com sucesso",
                todosProdutos:prods
            });
        });
    });

//vinculo da aplicação (app) com o motor de rotas
app.use('/api',router);

app.listen(port);
console.log("API Server is up running on port "+ port);