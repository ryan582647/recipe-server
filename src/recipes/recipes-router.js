const path = require('path');
const express = require('express');
const xss = require('xss');
const RecipesJson = express.json();
const RecipesRouter = express.Router();
// const logger = require('../logger');
const RecipesService = require('./recipes-service');

const serializeRecipe =  recipe => ({
  id: recipe.id,
  recipe_title: xss(recipe.recipe_title),
  date_modified: recipe.date_modified,
  region: recipe.region,
  instructions: xss(recipe.content),
  ingredients: recipe.ingredients
})

RecipesRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    RecipesService.getAllRecipes(knexInstance)
      .then(recipes => {
        res.json(recipes);
      })
      .catch(next)
  })
  .post(RecipesJson, (req, res, next) => {
    const { recipe_title, instructions, ingredients, id, region } = req.body;
    const newRecipe = { recipe_title, instructions, ingredients, id, region  };

    for (const [key, value] of Object.entries(newRecipe)) {
      if (value == null) {
        // logger.error(`Title and Content are required.`)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        });
      }
    }
    
    NotesService.insertNotes(req.app.get('db'), newRecipe)
      .then(note => {
        res
        .status(201)
        .location(path.posix.join(req.originalUrl, `/${recipe.id}`))
        .json(serializeRecipe(recipe))
      })
      .catch(next)
  })

RecipesRouter
  .route('/:id')
  .all((req, res, next) => {
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
    const { id } = req.params  // was note_id
    RecipesService.deleteNotes(
      req.app.get('db'),
      id
    )
      .then(() => {
        // logger.info(`Note with id ${note_id} deleted.`)
        res.status(204).end()
      })
      .catch(next)
  })
  .patch(RecipesJson, (req, res, next) => {
    const { note_title, content } = req.body;
    const noteToUpdate = { note_title, content } // will check on Patch - not sure if it can be implemented this way
    
    const numberOfValues = Object.values(noteToUpdate).filter(Boolean).length
    if (numberOfValues === 0) {
      return res.status(400).json({
        error: { message: `Request body must contain either 'note_title' or 'content'`}
      })
    }

    NotesService.updateNotes(
      req.app.get('db'),
      req.params.note_id,
      noteToUpdate
    )
      .then(() => {
        res.status(204).end()
      })
      .catch(next)
  })

module.exports = NotesRouter;