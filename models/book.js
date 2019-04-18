'use strict';

const Sequelize = require('sequelize');

/**
 * module - Creates a sequelize model
 *
 * @param  {object} sequelize Sequelize instance.
 * @param  {object} DataTypes Allowed sequelize data types.
 * @return {object}           Sequelize model with associations defined
 */
module.exports = function(sequelize, DataTypes) {
    var Book = sequelize.define('book', {

        title: {
            type: Sequelize.STRING
        },
        genre: {
            type: Sequelize.STRING
        },
        publisher_id: {
            type: Sequelize.INTEGER
        }
    });

    Book.associate = function(models) {
        Book.belongsToMany(models.person, {
            as: 'Authors',
            foreignKey: 'bookId',
            through: 'books_to_people',
            onDelete: 'CASCADE'
        });
    };

    return Book;
};
