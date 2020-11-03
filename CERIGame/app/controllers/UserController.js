function userController($rootScope, $scope, authenticate, sessionService)
{
    $scope.Connecte= $scope.echoue =authenticate.logged(); // initalisation

    $scope.$on('logout',()=>{
    	$scope.Connecte=false;
    })

    $scope.login = function ()
    {

        let auth = authenticate.login($scope.username, $scope.password) // verification des coordonnées
        .then(function (response) {
               if (response.statusMsg!=='Coordonnées incorrectes'){ // si ok on affiche le bandeau success
                  $scope.echoue = false;
                  dateDerniereConnexion = response.statusMsg+". Votre derniere connexion le: " + localStorage.getItem('lastConnexion');
                  localStorage.setItem('lastConnexion', new Date().toLocaleString());
                  console.log(dateDerniereConnexion);
                  
                  sessionService.setUser(response.identifiant,response.uid,response.nom,response.prenom,response.date_de_naissance,dateDerniereConnexion);
                  //reponse.data._id,reponse.data.data,dateCourante,reponse.data.nom,reponse.data.prenom,reponse.data.avatar,reponse.data.date_de_naissance
				  console.log(sessionService.getUser().identifiant);
                  $scope.Connecte = true;


                  $rootScope.$broadcast('login',{'dateDerniereConnexion':dateDerniereConnexion})
                  console.log("broadcast");
                  }else{
                  $scope.bandeau = response.statusMsg;  // si ko on affiche coordonnées incorrct dans le bandeau
                  $scope.echoue = true;
            }
        });
    };

}


function gameController($rootScope,$scope,authenticate,sessionService){

	$scope.Connect=authenticate.logged();
	$scope.$on('login',(event,args)=>{
		$scope.dateDerniereConnexion=args.dateDerniereConnexion;
		$scope.Connect= true;
		$scope.afficher=true;
	})

	$scope.Close = function (){
		$scope.afficher =false;
	}

    $scope.logout = function ()
    {
        let auth = authenticate.logout()
        .then(function (response)
        {

        	sessionStorage.clear();
        	$scope.Connect = false;
        });
        $rootScope.$broadcast('logout')
    };

    $scope.button_quiz = function()
    {
		$scope.quizCon = true;
		$scope.afficher_profile = false;
		$scope.afficher_classement = false;
	};


	$scope.button_profil = function()
	{
		console.log("salut prof");
		$scope.quizCon = false;
		$scope.afficher_profile = true;
		$scope.afficher_classement = false;
		$scope.$broadcast('actualiser_profile');
	};

	$scope.button_classement = function()
	{
		$scope.quizCon = false;
		$scope.afficher_profile = false;
		$scope.afficher_classement = true;
	};

}

//=========================

//===================
function quiz_controlleur($rootScope,$scope,gestionQuiz,sessionService,$interval){

	$scope.themes = [];
	$scope.afficher_form_quiz=true;
		themes_id = gestionQuiz.reqTheme().then(function(response){
		for (var i=0;i<response.length;i++){
			$scope.themes[i] = response[i].thème;
		}
		return response;
	},(err)=>{console.log("Erreur chargement des themes")});


		chrono = function(){
		if($scope.seconde == 59){
			$scope.seconde = 0
			$scope.minute += 1
		}
		else
			$scope.seconde +=1
	}

	// Fonction du boutton jouer pour lancer le quiz
	$scope.jouer = function(){

		if(themes_id.$$state != null)
			themes_id = themes_id.$$state.value;

		// On récupere le thème choisi,son id et le niveau
		theme = $scope.theme_choisi
		niveau = $scope.niveau_choisi;

		// On change le théme par son ID pour faire la requete mongo
		for(var i=0 ;i<themes_id.length;i++){
			if(themes_id[i].thème == theme){
				theme = themes_id[i]._id;
				break;
			}
		}

		// On récupere le quiz par rapport a l'ID du théme
		gestionQuiz.reqJeu(theme,niveau).then(function(quiz){

			// On Affiche le quiz
			$scope.afficher_form_quiz = false;
			$scope.afficher_question = true
			$scope.afficher_resultat = false
			gestionJeu(quiz,false)

		},(err)=>(console.log("Erreur, requete non arrivé au controleur "+err)));
		$scope.afficher_button_defi = true;

	}


		var gestionJeu = function(quiz,defi){
		i = 1 //Variable qui va controler le numero de la question affiché
		// On met le chrono a ZERO
		$scope.seconde = 0
		$scope.minute = 0
		$scope.score_total = 0;
		$scope.score = 0;
		$scope.afficher_users_connected = false;
		$scope.afficher_defi_lancee = false;

		// On lance le chorno
		stop_chrono = $interval(chrono, 1000);
			
			//Fonction qui gére l'affichage des question par rapport a i le numero de la question
			compteur = function(i){
				$scope.question = quiz[i].question;
				$scope.reponses = quiz[i].propositions;
				$scope.reponse_correct = quiz[i].réponse;
			}

			//On définie la fonction qui gére le clique de la réponse
			$scope.onClick = function(choix,reponse){
				if(choix==reponse){
					$scope.score++;
				}
				if(i<5){
					compteur(i)
					i += 1;
				}
				else{
					//Fin du quiz on calcule et affiche le résultat
					$interval.cancel(stop_chrono);
					var tmps_jeu = ($scope.minute * 60) + $scope.seconde;
					var score_total = Math.round(($scope.score * 1398.2)/tmps_jeu);
					$scope.score_total = score_total
					ads.new_hist($scope.score,tmps_jeu,$scope.score_total);
					$scope.afficher_question = false
					$scope.afficher_resultat = true
					$scope.users_defi = false;
					$scope.afficher_users_connected = true;
					$scope.afficher_defi_lancee = true;
				
				}
			}
		var dateA = new Date();
		compteur(0);
		return true;
	}


	
}

function BC_profile_controlleur($scope,authenticate,sessionService,ads){

	function actualisation_Page(){
		data = sessionService.getUser();
		if (data != null){
			$scope.nom = data.nom;
			$scope.prenom=data.prenom;
			$scope.identifiant = sessionService.getUser().identifiant;
			date_modifie =  new Date(data.date_de_naissance).toLocaleDateString();
			$scope.date_de_naissance=date_modifie;
			$scope.dereniere_connex = data.dateDerniereConnexion;

			ads.get_hist().then((reponse)=>{
				$scope.result = reponse.data.rows
				$scope.nbr_jeu = reponse.data.rowCount
				$scope.meilleure_score = reponse.data.rows[0].score
			})
		}
	}

	$scope.$on('actualiser_profile',(event,args)=>{
		actualisation_Page();
	})

}



userController.$inject = ['$rootScope','$scope', 'authenticate', 'sessionService','gestionQuiz'];
gameController.$inject = ['$rootScope','$scope', 'authenticate', 'sessionService','gestionQuiz'];