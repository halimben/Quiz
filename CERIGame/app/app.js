angular.module('monApp', ["ngRoute"])
       .controller('userController',userController)
       .controller('gameController',gameController)
        .controller('quiz_controlleur',quiz_controlleur)
		.controller('BC_profile_controlleur',BC_profile_controlleur)
        .service('authenticate',authenticate)
        .service('sessionService',sessionService)
        .service('gestionQuiz',gestionQuiz)
        .service('ads',accessDataService)


        



        