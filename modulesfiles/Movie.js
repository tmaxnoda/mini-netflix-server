module.exports = class Movie {

  constructor(imageUrl,createdAt,releaseDate,title,genre,rating,description){
   
    this.imageUrl = imageUrl;
    this.createdAt = createdAt;
    this.releaseDate = releaseDate;
    this.title = title;
    this.genre = genre;
    this.rating = rating;
    this.description = description
  }


}


