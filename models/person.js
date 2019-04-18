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
    var Person = sequelize.define('person', {

        firstName: {
            type: Sequelize.STRING
        },
        lastName: {
            type: Sequelize.STRING
        },
        email: {
            type: Sequelize.STRING
        },
        companyId: {
            type: Sequelize.INTEGER
        }
    });

    Person.associate = function(models) {
        Person.belongsToMany(models.book, {
            as: 'works',
            foreignKey: 'personId',
            through: 'books_to_people',
            onDelete: 'CASCADE'
        });
    };

    return Person;
};
