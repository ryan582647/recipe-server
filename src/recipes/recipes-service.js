
const RecipeService = {
  getAllRecipes(knex) {
    return knex.select('*').from('recipes')
  },
  insertRecipe(knex, newRecipe) {
    return knex
      .insert(newRecipe)
      .into('recipes')
      .returning('*')
      .then(rows => {
        return rows[0]
      })
  },
  getById(knex, id) {
    return knex
    .select('*')
    .from('recipes')
    .where('id', id)
    .first()
  },
  deleteNotes(knex, id) {
    return knex('recipes')
      .where({ id })
      .delete()
  },
  updateRecipes(knex, id, newRecipeFields) {
    return knex('recipes') //probably don't need any of this for my app, but will ask to make sure
      .where({ id })
      .update(newRecipeFields)
  },
 }
 
 module.exports = NotesService;