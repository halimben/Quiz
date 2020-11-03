const express = require('express');
const moment = require('moment');
const sha1 = require('sha1');
const pgClient = require('pg');
const app = express();
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const ObjectId = require('mongodb').ObjectID;
const dsnMongoDB = "mongodb://127.0.0.1:27017/db";
let responseData =  {
    "error" : {
      "state" : false,
      "message" : ""
    },
    "data":{}
  };
const MongoClient = require('mongodb').MongoClient;
// instance de connexion avec toutes les informations de la BD
var pool = new pgClient.Pool({user: 'uapv1701744', host: '127.0.0.1', database: 'etd',password: 'jkvwRb', port: 5432 });
  app.use(session({
    secret: 'ma phrase secrete',
    saveUninitialized: false,
    resave: false,
    store : new MongoDBStore({
        uri: "mongodb://127.0.0.1:27017/db",
        collection: "mysession3302",
        touchAfter: 24 * 3600
    }),
    cookie : {maxAge : 24 * 3600 * 1000}
}));
  app.use(express.static(__dirname + '/CERIGame'));
   app.use(express.static(__dirname + '/CERIGame/app'));

var server=app.listen(3302, function() { 
console.log('listening on 3302'); 
});

app.get('/', function (req, res) { 
	res.sendFile(__dirname + '/CERIGame/index.html')
});

app.get('/deleteSession', function(req, res){
    req.session.destroy();
    res.redirect('/');
});

app.get('/login', function(req, res)
{
	console.log('login');
		console.log(req.query.username);
		console.log(req.query.password);


	// vérification des informations de login auprès de la base postgresql
	sql = "select * from fredouil.users where identifiant='"+req.query.username+"' and motpasse ='" + sha1(req.query.password) + "';";
	// Connexion à la base => objet de connexion : client
	// fonctionne également en promesse avec then et catch !
	pool.connect(function(err, client, done) 
	{

		if(err) {console.log('Ereur de connexion au serveur pg' + err.stack);}
		else{
					console.log('Connection establ a pg db server');
			// Exécution de la requête SQL et traitement du résultat
					
			// Exécution de la requête SQL et resultats stocké dans le param result
				client.query(sql, (err, resq) =>
				{
					if(err){console.log('Erreur d’exécution de la requete' + err.stack);}
				// et traitement du résultat
					else if(resq.rows[0] != null)
					{
						req.session.isConnected=true;
						req.session.nom = resq.rows[0].nom;
						req.session.prenom = resq.rows[0].prenom;
						req.session.lastConnexion = moment().format();
						req.session.uid= resq.rows[0].id;

						responseData.date_de_naissance=resq.rows[0].date_de_naissance;
						responseData.error.state = false;
						responseData.prenom=resq.rows[0].prenom;
						responseData.nom=resq.rows[0].nom;
						responseData.uid=resq.rows[0].id;
						responseData.identifiant=resq.rows[0].identifiant;

						responseData.statusMsg=' Connexion reussie, Hi '+resq.rows[0].nom+' '+resq.rows[0].prenom;

						res.send(responseData);
					}
					else
					{
						console.log('coordonnee incorecret');
						responseData.statusMsg='Coordonnées incorrectes';
						console.log(responseData);
						res.send(responseData);
					}

				});


			sql = "Update fredouil.users set statut = 1 where id = "+req.session.uid+";";
			client.query(sql, (err, result) => {
				if(err){
					console.log("Erreur lors de l'éxécution de la requete");
				}
				console.log("mise statut a 1")
			});


				client.release(); // connexion libérée
			}
	})
});


/*****************************		Ménage logout		*****************************/
app.get('/logout',function(request,response){

	sql = "Update fredouil.users set statut = 0 where id = "+request.query.uid+";";

	//Connexion a la base de donnée PSQL

		pool.connect(function(err,client,done){
			if(err){console.log("Error connecting to pg server "+err.stack);}
			else{
				console.log("Connection established with pg db server");
				//Execution de la requete

				client.query(sql, (err, result) => {
					if(err){
						console.log("Erreur lors de l'éxécution de la requete");
					}
					else{
						console.log("mise statut a 0")
						response.send(true);
					}
				});
				client.release();
			}
		});
		request.session = null;
});


//============================== theme =================================================
/*****************************	Récuperation de tout les théme	*****************************/
app.post('/theme',function(request,response){

	MongoClient.connect(dsnMongoDB,{useNewUrlParser:true},function(err,mongoClient){
		if(err){return console.log('ERREUR, Connexion base de données requete quizz')}
		if(mongoClient){

			var reqDB ={};

			mongoClient.db().collection('quizz').find(reqDB,{projection:{thème : 1}}).toArray(function(err,data){

				if(err){return console.log("Erreur, Execution requete mongodb quizz")}
				if(data){
					response.send(data);
					mongoClient.close();
				}
			});
		}
	});
});

/*****************************		Recuperation du quizz		*****************************/
app.post('/quizz',function(request,response){
	theme = request.body.theme;


	MongoClient.connect(dsnMongoDB,{ useNewUrlParser:true },function(err,mongoClient){
		if(err){return console.log('ERREUR, Connexion base de données requete quizz')}
		if(mongoClient){

			var reqDB = {}

			mongoClient.db().collection('quizz').find(reqDB).toArray(function(err,data){
				if(err){return console.log("Erreur, Execution requete mongodb quizz")}
				if(data){
					response.send(data);
					mongoClient.close();
				}
			});
		}
	});
});


app.get('/question',function(request,response){

	theme = request.query.theme;

	MongoClient.connect(dsnMongoDB,{ useNewUrlParser:true },function(err,mongoClient){
		if(err){return console.log('ERREUR, Connexion base de données requete quizz')}
		if(mongoClient){

			theme_id = new ObjectId(theme)
			var reqDB = {_id:ObjectId(theme_id)}

			mongoClient.db().collection('quizz').find(reqDB).toArray(function(err,data){
				if(err){return console.log("Erreur, Execution requete mongodb quizz")}
				if(data){
					response.send(data);
					mongoClient.close();
				}
			});
		}
	});
});

app.post('/get_hist',function(request,response){

	sql = " select * from fredouil.historique where id_users = "+request.session.uid+" order by score desc;";

	pool.connect(function(err,client,done){
		if(err){console.log("Error connecting to pg server "+err.stack);}
		else{
			client.query(sql,(err,result) =>{
				if(err)console.log("Erreur execution requete "+err)
				else{
					console.log("affichage historique")
					response.send(result);
				}
			});
			client.release();
		}
	});
});