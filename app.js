const express = require('express');
let Movie = require('./modulesfiles/Movie');
let Favorites = require('./modulesfiles/Favorites');
const uuidv1 = require('uuid/v1');
const bodyParser = require('body-parser')

var admin = require("firebase-admin");

var serviceAccount = require("./modulesfiles/mini-netflix-db-firebase-admin-sdk.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://mini-netflix-db.firebaseio.com"
});


//initialize admin database
const db = admin.firestore();

//initialize express
const app = express();

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json());





const movieRouter = express.Router();
const port = process.env.PORT | 3000;

// get all favorites



//add favorites
movieRouter.route('/movies/favorites')
.post((req,res)=>{
    let favorite = new Favorites(req.body.movie_id,req.body.user_id)
    // Add a new document in collection "cities"
    db.collection("favorites").add({
        movie_id: favorite.movie_id,
        user_id: favorite.user_id

    })
    .then(function() {
        res.status(200).json({
            message:"success"
        })
    })
    .catch(function(error) {
        console.error("Error writing document: ", error);
        res.status(500).json({
            message: error
        })
    });

})

//my favorites
movieRouter.route('/movies/favorites/mine').post((req,res) => {
   
   var getFav = db.collection('favorites');
   //get getFav
   getFav.where('user_id','==',req.body.user_id).get().then(snapshot => {
        let allFav = [];
       // is snapshot empty
       if(snapshot.empty){
            res.status(500).json({
                message:'does not exist',
                data:[]
            })
        }

       snapshot.forEach(doc => {
         let item =  doc.data();
         allFav.push(item)
         console.log(doc.id,'=>',doc.data())
         
        
       });

       // collect all movies based on
 allFav.forEach(mv => {
    var movies = db.collection('movies');
    movies.where('id', '==', mv.movie_id).get().then(snapshot => {
        let favoritesMovies = [];
        if(snapshot.empty){
           res.status(500).json({
               message:'does not exist',
               data:[]
           })
       }
        snapshot.forEach(doc => {
           let item =  doc.data();
           favoritesMovies.push(item)
           console.log(doc.id,'=>',doc.data())

        });

        res.status(200).json({
            message:'success',
            data: favoritesMovies
        
           
        });
    }).then(error => console.log(error))
})

   }).catch(error => console.log(error));

 
});

// post books
movieRouter.route('/movies')
.post((req , res) => {
    
    let movie = new Movie(req.body.imageUrl,req.body.createdAt,req.body.releaseDate,req.body.title,req.body.genre,req.body.rating,req.body.description)
    movie.id = uuidv1();

    // Add a new document in collection "cities"
    db.collection("movies").add({
        imageUrl:movie.imageUrl,
        createdAt:movie.createdAt,
        releaseDate: movie.releaseDate,
        title: movie.title,
        genre:movie.genre,
        id:movie.id,
        rating:movie.rating,
        description: movie.description


    })
    .then(function() {
        res.status(200).json({
            message:"success"
        })
    })
    .catch(function(error) {
        console.error("Error writing document: ", error);
        res.status(500).json({
            message: error
        })
    });

});

movieRouter.route('/movies/:movieId').get((req,res) => {
    db.collection('movies')
    .where('id','==',req.params.movieId).get()
    .then(snapshot =>{
        if(snapshot.empty){
            res.status(500).json({
                message:'invalid movie id',
                data:''
            })
        }


        //iterate through
        snapshot.forEach(doc => {
            res.status(200).json({
                message:'success',
                data:doc.data()
            })
          });
    }) .catch(err => {
        console.log('Error getting documents', err);
      });
})

movieRouter.route('/movies')
                            .get((req, res) => {
                                
                                db.collection('movies').get().then((snapshot) => {
                                    
                                    let movies=[];
                                    snapshot.docs.forEach(doc =>{
                                        let item = doc.data();
                                        movies.push(item)
                                       
                                    })

                                    res.status(200).json({
                                        message:"200",
                                        data:movies
                                    })
                                   
                                } ).catch(error => {
                                  
                                        res.status(500).json({
                                            message:error.message,
                                            data:movies
                                        })
                                 
                                });
                               
                            });

app.use('/api',movieRouter);



app.listen(port, () => {
    console.log("listening to port " + port);
});