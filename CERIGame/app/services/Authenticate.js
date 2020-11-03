function sessionService($log){


     /**
     * Function getUser qui permet de retourner les donnée du joueur a partir du LocalStorage
     * @param
     * @returns {Object}
     */
     this.getUser = function(){
          return JSON.parse(localStorage.getItem('session.user'));
     }

     this._user = this.getUser();
     /**
     * Function setUser qui permet d'insérer dans le localStorage les donnée du joueur
     * @param {id,user,date,nom,prenom,avatar,date_de_naissance}
     * @returns
     */
     this.setUser = function(user,id,nom,prenom,date_de_naissance,dateDerniereConnexion){
          this._user = {
               'id' : id,
               'identifiant' : user,
               'nom' : nom,
               'date_de_naissance' : date_de_naissance,
               'prenom' : prenom,
               'dateDerniereConnexion' :dateDerniereConnexion
          }
          localStorage.setItem('session.user', JSON.stringify(this._user));
          return this;
     }



     /**
     * Function setUser qui permet d'insrer un nom et prenom pour un user dans le localStorage
     * @param {nom,prenom}
     * @returns
     */
     this.setName = function(nom,prenom){
          this._user.nom = nom;
          this._user.prenom = prenom;
          localStorage.setItem('session.user',JSON.stringify(this._user))
     }

     /**
     * Function getID qui permet de recuprer l'ID depuis le localStorage
     * @param {}
     * @returns {id}
     */
     this.getID = function(){
          return this._user.id;
     }

     /**
     * Function removeUser qui permet de vider le localStorage
     * @param
     * @returns
     */
     this.removeUser = function(){
          localStorage.clear();
          return this;
     }
}






function authenticate($http, sessionService)
{
    this.logged = function(){
        return sessionService.getUser() != null;
    };
    this.login = function (username, password)
    {
        return $http
        .get('http://pedago.univ-avignon.fr:3302/login/?username=' +username+'&password='+password)
            .then(function(response)
            {
            if (response.data.error.state === false) {
               sessionService.setUser(username);
            }
            return (response.data);
        });
     };


    this.logout = function ()
    {
        return $http
        .get('http://pedago.univ-avignon.fr:3302/logout/?uid='+sessionService.getID())
        .then(function(response)
        {
            localStorage.removeItem('sessionUser');
            sessionService._user=null;
            return (response);
        });
    };
 }



//======================================================================================================
function gestionQuiz($http){


     /**  Fonction ReqQuest qui fais une requete au serveur pour avoir les question d'un théme donnée par rapport a son ID.
     * @param theme
     * @returns {*|Promise}
     */
     this.reqQuest = function(theme){
          console.log("Passage par reqQuest")

          quiz =  $http.get('http://pedago.univ-avignon.fr:3302/question/?theme='+theme).then(function(response){

        console.log("Reception requete réussis");
        return response.data;

      },function(err){console.log("Erreur, Res quizz service non réussis")});
     return quiz;
     }

     /**  Fonction reqJeu qui fais le traitement nécéssaire au question d'un théme donnée et ainsi créer les 5 question du quiz.
     * @param {theme,niveau}
     * @returns {Object}
     */
     this.reqJeu = function(theme,niveau){
          quiz = this.reqQuest(theme).then(function(response){
               quiz = []
               numQuest = []
               quiz

               for(var i=0; i<5; i++){

                    quiz[i] = {}
                    test = 1
                    while(test != -1 ){
                         tmp = Math.floor(Math.random() * 30)
                         test = numQuest.indexOf(tmp)
                    }
                    numQuest[i] = tmp

                    quiz[i].id = response[0].quizz[tmp].id;
                    quiz[i].question = response[0].quizz[tmp].question;
                    quiz[i].réponse = response[0].quizz[tmp].réponse;
                    if(niveau == 4){
                         quiz[i].propositions = response[0].quizz[tmp].propositions;
                    }
                    else{
                         p=false;
                         //While le tableau propositions n'est pas remplie
                         while(!p){
                              //Tableau pour remplir les position des réponse
                              position_tmp = []
                              //tableau temporaire pour les proposition
                              reponse_tmp = []
                              //Variable pour chercher l'occurence d'une position
                              b=0;
                              while(reponse_tmp.length != niveau){
                                   tmpi = Math.floor(Math.random() * 4)
                                   b = position_tmp.indexOf(tmpi)
                                   if(b == -1)
                                   reponse_tmp.push(response[0].quizz[tmp].propositions[tmpi]);
                                   position_tmp.push(tmpi);
                              }
                              //On vérifie si la réponse fait bien partie des propositions
                              b = reponse_tmp.indexOf(response[0].quizz[tmp].réponse)
                              if(b!=-1){
                                   quiz[i].propositions = reponse_tmp
                                   p = true;
                              }
                         }//Si oui on sors de la boucle sinon on re remplie le tableau
                    }
               }
               return quiz;
          },(err)=>{console.log("Erreur ReqJeu")})
          return quiz;
     }

     /**  Fonction reqTheme qui fait une requete au serveur et lui demande seulement les thémes du quiz.
     * @param
     * @returns {Object}
     */
     this.reqTheme = function(){
          console.log("Request Theme");
          themes = $http.post('http://pedago.univ-avignon.fr:3302/theme',{}).then(function(response){
               return response.data;
          });
          return themes;
     }
}

//=========================


function accessDataService($http,sessionService){

     /**
     * getInfo : la fonction getInfo retourne une promesse provenant du service http
     * @param url
     * @returns {*|Promise}
     */
     this.postinfo = function(url){

       //Appel ajax
       info = $http.get(url,{'username':username,'password':pwd}).then(function(response){return(response.data);},function(reponse){return("WRONG");});
       return info;
     }

     /**
     * Function new_hist envoie une requete au serveur pour insérer une nouvelle ligne dans fredouil.historique
     * @param {nbr_reponse,temps,score}
     * @returns {true}
     */
     this.new_hist = function(nbr_reponse,temps,score){
          var reponse = $http.post('http://pedago02a.univ-avignon.fr:3302/new_hist',{'nbr_reponse': nbr_reponse,'temps': temps, 'score':score}).then(function(reponse){
                    console.log("Historique ajouté");
                    return reponse;
               },function(err){console.log("Erreur insertion historique Function "+err); return null;
          });
          return reponse;
     }

     /**
     * Function get_hist envoie une requete au serveur pour recevoir l'historique de jeu du joueur
     * @param
     * @returns {resultat}
     */
     this.get_hist = function(){
          var reponse = $http.post('http://pedago02a.univ-avignon.fr:3302/get_hist',{}).then(function(resultat){
                    console.log("Historique affiché");
                    return resultat;
               },function(err){console.log("Erreur recuperation historique Function "+err); return null;
          });
          return reponse;
     }

     /**
     * Function edit_name qui modifie le nom et prenom d'utilisateur dans la base de donnée et retourne true si elle a réussi
     * @param {nom,prenom}
     * @returns {true}
     */
     this.edit_name = function(nom,prenom){
          var reponse = $http.post('http://pedago.univ-avignon.fr:3302/edit_nom',{'nom':nom, 'prenom': prenom}).then(function(reponse){
                    console.log("Nom modifié");
                    sessionService.setName(nom,prenom)
                    return reponse
               },function(err){console.log("Erreur logIn Function "+err); return null;
          });
          return reponse;
     }

     this.getUsers = function(){
          var reponse = $http.post('http://pedago.univ-avignon.fr:3302/getUsers',{}).then(function(reponse){
                    console.log("Get Users");
                    return reponse;
               },function(err){console.log("Erreur recuperation historique Function "+err); return null;
          });
          return reponse;
     }

}



sessionService.inject=['$log'];
authenticate.$inject=['$http','sessionService'];
