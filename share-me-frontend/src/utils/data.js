import cars from "../assets/cars.png";
import bikes from "../assets/bikes.png";
import fitness from "../assets/fitness.png";
import wallpaper from "../assets/wallpaper.png";
import music from "../assets/music.png";
import photo from "../assets/photo.png";
import food from "../assets/food.png";
import nature from "../assets/nature.png";
import art from '../assets/art.png';
import travel from '../assets/travel.png';
import quotes from '../assets/quotes.png';
import cats from '../assets/cats.png';
import dogs from '../assets/dogs.png';

export const categories = [
  {
    name: "cars",
    image: cars,
  },
  {
    name: "motorcycles",
    image: bikes,
  },
  {
    name: "fitness",
    image: fitness,
  },
  {
    name: "wallpaper",
    image: wallpaper,
  },
  {
    name: "music",
    image: music,
  },
  {
    name: "photography",
    image: photo,
  },
  {
    name: "food",
    image: food,
  },
  {
    name: "nature",
    image: nature,
  },
  {
    name: "art",
    image: art,
  },
  {
    name: "travel",
    image: travel,
  },
  {
    name: "quotes",
    image: quotes,
  },
  {
    name: "cats",
    image: cats,
  },
  {
    name: "dogs",
    image: dogs,
  },
  {
    name: "other",
    image:
      "https://i.pinimg.com/236x/2e/63/c8/2e63c82dfd49aca8dccf9de3f57e8588.jpg",
  },
];

export const userQuery = (userId) => {
  const query = `*[_type == "user" && _id == "${userId}"]`;
  return query;
};

export const searchQuery = (searchTerm) => {
  const query = `*[_type == 'pin' && title match '${searchTerm}*' || category match '${searchTerm}*' || about match '${searchTerm}*']{
    image {
      asset -> {
        url
      }
    },
    _id,
    destination,
    postedBy -> {
      _id,
      userName,
      image
    },
    save[] {
      _key,
      postedBy -> {
        _id,
        userName,
        image
      },
    },
  }`;

  return query;
};

export const feedQuery = `*[_type == 'pin' ] | order(_createdAt desc) {
  image {
    asset -> {
      url
    }
  },
  _id,
  destination,
  postedBy -> {
    _id,
    userName,
    image
  },
  save[] {
    _key,
    postedBy -> {
      _id,
      userName,
      image
    },
  },
}`;

export const pinDetailsQuery = (pinId) => {
  const query = `*[_type == "pin" && _id == '${pinId}']{
    image{
      asset->{
        url
      }
    },
    _id,
    title, 
    about,
    category,
    destination,
    postedBy->{
      _id,
      userName,
      image
    },
   save[]{
      postedBy->{
        _id,
        userName,
        image
      },
    },
    comments[]{
      comment,
      _key,
      postedBy->{
        _id,
        userName,
        image
      },
    }
  }`;

  return query;
};

export const similarPinsQuery = (pin) => {
  const query = `*[_type == "pin" && category == '${pin.category}' && _id != '${pin._id}' ]{
    image{
      asset->{
        url
      }
    },
    _id,
    destination,
    postedBy->{
      _id,
      userName,
      image
    },
    save[]{
      _key,
      postedBy->{
        _id,
        userName,
        image
      },
    },
  }`;
  return query;
};

export const userCreatedPinsQuery = (userId) => {
  const query = `*[ _type == 'pin' && userId == '${userId}'] | order(_createdAt desc){
    image{
      asset->{
        url
      }
    },
    _id,
    destination,
    postedBy->{
      _id,
      userName,
      image
    },
    save[]{
      postedBy->{
        _id,
        userName,
        image
      },
    },
  }`;
  return query;
};

export const userSavedPinsQuery = (userId) => {
  const query = `*[_type == 'pin' && '${userId}' in save[].userId ] | order(_createdAt desc) {
    image{
      asset->{
        url
      }
    },
    _id,
    destination,
    postedBy->{
      _id,
      userName,
      image
    },
    save[]{
      postedBy->{
        _id,
        userName,
        image
      },
    },
  }`;
  return query;
};
