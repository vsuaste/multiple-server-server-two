'use strict';

/**
 * @module - Migrations to creates a through table correspondant to manay-to-many association between two sequelize models.
 */
module.exports = {

    /**
     * up - Creates a table in the database for storing a many-to-many association
     *
     * @param  {object} queryInterface Used to modify the table in the database.
     * @param  {object} Sequelize      Sequelize instance with data types included
     * @return {promise}                Resolved if the table was succesfully created.
     */
    up: function(queryInterface, Sequelize) {
        return queryInterface.createTable('books_to_people', {

            createdAt: {
                type: Sequelize.DATE
            },

            updatedAt: {
                type: Sequelize.DATE
            },

            personId: {
                type: Sequelize.INTEGER,
                onDelete: 'CASCADE',
                references: {
                    model: 'people',
                    key: 'id'
                }
            },

            bookId: {
                type: Sequelize.INTEGER,
                onDelete: 'CASCADE',
                references: {
                    model: 'books',
                    key: 'id'
                }
            }
        }).then(() => {
            return queryInterface.addIndex('books_to_people', ['personId']);
        }).then(() => {
            return queryInterface.addIndex('books_to_people', ['bookId']);
        });
    },

    /**
     * down - Deletes a table in the database for storing a many-to-many association
     *
     * @param  {object} queryInterface Used to modify the table in the database.
     * @param  {object} Sequelize      Sequelize instance with data types included
     * @return {promise}                Resolved if the table was succesfully deleted.
     */
    down: function(queryInterface, Sequelize) {
        return queryInterface.dropTable('books_to_people');
    }

};
