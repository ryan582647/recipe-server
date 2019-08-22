const path = require('path');
const express = require('express');
const xss = require('xss');
const RecipesJson = express.json();
const RecipesRouter = express.Router();
// const logger = require('../logger');
const RecipesService = require('./recipes-service');
const UserService = require('../users/users-service');
const AuthService = require('../auth/auth-service')

const serializeRecipe =  recipe => ({
  id: recipe.id,
  recipe_title: xss(recipe.recipe_title),
  picture: recipe.picture,
  date_modified: recipe.date_modified,
  region: recipe.region,
  instructions: xss(recipe.content),
  video: recipe.video,
  ingredients: recipe.ingredients
})

RecipesRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    const bearerToken = AuthService.extractToken(req)
    if (bearerToken === null ){
      return res.status(400).json({
        error: {message: "Authentication token not received"}
      })
    }
    const tokenData = AuthService.parseJWTToken(bearerToken)

    

    UserService.getUserWithUserName(req.app.get('db'), tokenData.sub)
    .then(user =>{
      if(!user) {
        return res.status(400).json({
          error: { message : "User does not exist."}
        })
      }
      else {
        console.log(user)
        console.log(tokenData.user_id, typeof(tokenData.user_id))
        if (user.id !== tokenData.user_id){
          return res.status(400).json({
            error: { message : "User does not exist by id."}
          })
        }
    RecipesService.getAllRecipes(knexInstance, tokenData.user_id, user.id)
      .then(recipes => {
        res.json(recipes);
      })
      .catch(next)
  }
})
    })

  .post(RecipesJson, (req, res, next) => {
    const { recipe_title, picture, instructions, video, ingredients, id, region } = req.body;
    const newRecipe = { recipe_title, instructions, ingredients, id, region, picture, video };


    for (const [key, value] of Object.entries(newRecipe)) {
      if (value == null) {
        // logger.error(`Title and Content are required.`)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        });
      }
    } 
    const bearerToken = AuthService.extractToken(req)
    const tokenData = AuthService.parseJWTToken(bearerToken)

    UserService.getUserWithUserName(req.app.get('db'), tokenData.sub)
    .then(user =>{
      if(!user) {
        return res.status(400).json({
          error: { message : "User does not exist."}
        })
      }
      else {
        console.log(user)
        console.log(tokenData.user_id, typeof(tokenData.user_id))
        if (user.id !== tokenData.user_id){
          return res.status(400).json({
            error: { message : "User does not exist by id."}
          })
        }
        const newRecipe = { user_id: tokenData.user_id, recipe_title, instructions, ingredients, id, region, picture, video };

        RecipesService.insertRecipes(req.app.get('db'), newRecipe)
        .then(recipe => {
          res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${recipe.id}`))
          .json(serializeRecipe(recipe))
        })
        .catch(next)
    }})
    })

   
RecipesRouter
  .route('/:id')
  .all((req, res, next) => {
    const bearerToken = AuthService.extractToken(req)
    const tokenData = AuthService.parseJWTToken(bearerToken)

    UserService.getUserWithUserName(req.app.get('db'), tokenData.sub)
    .then(user =>{
      if(!user) {
        return res.status(400).json({
          error: { message : "User does not exist."}
        })
      }
      else {
        console.log(user)
        console.log(tokenData.user_id, typeof(tokenData.user_id))
        if (user.id !== tokenData.user_id){
          return res.status(400).json({
            error: { message : "User does not exist by id."}
          })
        }
      }})
    const { id } = req.params
    RecipesService.getById(
      req.app.get('db'),
      id
    )
      .then(recipe => {
        if (!recipe) {
          // logger.error(`Note with id ${note_id} not found.`)
          return res.status(404).json({
            error: { message: `This recipe does not exist`}
          })
        }
        res.recipe = recipe
        next()
      })
      .catch(next)
  })
  .get((req, res) => {
    res.json(serializeRecipe(res.recipe))
  })
  .delete((req, res, next) => {
    const bearerToken = AuthService.extractToken(req)
    const tokenData = AuthService.parseJWTToken(bearerToken)
    const { id } = req.params  // was note_id
    RecipesService.deleteRecipes(
      req.app.get('db'),
      id,
      tokenData.user_id
    )
      .then(() => {
        // logger.info(`Note with id ${note_id} deleted.`)
        res.status(204).end()
      })
      .catch(next)
  })

module.exports = RecipesRouter;