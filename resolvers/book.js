/*
    Resolvers for basic CRUD operations
*/

const book = require('../models/index').book;
const searchArg = require('../utils/search-argument');
const fileTools = require('../utils/file-tools');
const helper = require('../utils/helper');
const globals = require('../config/globals');
const checkAuthorization = require('../utils/check-authorization');
const path = require('path');
const fs = require('fs');
const uuidv4 = require('uuidv4');
const resolvers = require('./index');
const {
    handleError
} = require('../utils/errors');
const email = require('../utils/email');
const helpersAcl = require('../utils/helpers-acl');
const validatorUtil = require('../utils/validatorUtil');






/**
 * book.prototype.AuthorsFilter - Check user authorization and return certain number, specified in pagination argument, of records
 * associated with the current instance, this records should also
 * holds the condition of search argument, all of them sorted as specified by the order argument.
 *
 * @param  {object} search     Search argument for filtering associated records
 * @param  {array} order       Type of sorting (ASC, DESC) for each field
 * @param  {object} pagination Offset and limit to get the records from and to respectively
 * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {array}             Array of associated records holding conditions specified by search, order and pagination argument
 */
book.prototype.AuthorsFilter = function({
    search,
    order,
    pagination
}, context) {

    let options = {};

    if (search !== undefined) {
        let arg = new searchArg(search);
        let arg_sequelize = arg.toSequelize();
        options['where'] = arg_sequelize;
    }

    return this.countAuthors(options).then(items => {
        if (order !== undefined) {
            options['order'] = order.map((orderItem) => {
                return [orderItem.field, orderItem.order];
            });
        } else if (pagination !== undefined) {
            options['order'] = [
                ["id", "ASC"]
            ];
        }

        if (pagination !== undefined) {
            options['offset'] = pagination.offset === undefined ? 0 : pagination.offset;
            options['limit'] = pagination.limit === undefined ? (items - options['offset']) : pagination.limit;
        } else {
            options['offset'] = 0;
            options['limit'] = items;
        }

        if (globals.LIMIT_RECORDS < options['limit']) {
            throw new Error(`Request of total authorsFilter exceeds max limit of ${globals.LIMIT_RECORDS}. Please use pagination.`);
        }
        return this.getAuthors(options);
    }).catch(error => {
        handleError(error);
    });
}

/**
 * book.prototype.countFilteredAuthors - Count number of associated records that holds the conditions specified in the search argument
 *
 * @param  {object} {search} description
 * @param  {object} context  Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {type}          Number of associated records that holds the conditions specified in the search argument
 */
book.prototype.countFilteredAuthors = function({
    search
}, context) {

    let options = {};

    if (search !== undefined) {
        let arg = new searchArg(search);
        let arg_sequelize = arg.toSequelize();
        options['where'] = arg_sequelize;
    }

    return this.countAuthors(options);
}


/**
 * book.prototype.publisher - Return associated record
 *
 * @param  {string} _       First parameter is not used
 * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
 * @return {type}         Associated record
 */
book.prototype.publisher = function(_, context) {
    return resolvers.readOnePublisher({
        "id": this.publisherId
    }, context);
}



module.exports = {

    /**
     * books - Check user authorization and return certain number, specified in pagination argument, of records that
     * holds the condition of search argument, all of them sorted as specified by the order argument.
     *
     * @param  {object} search     Search argument for filtering records
     * @param  {array} order       Type of sorting (ASC, DESC) for each field
     * @param  {object} pagination Offset and limit to get the records from and to respectively
     * @param  {object} context     Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {array}             Array of records holding conditions specified by search, order and pagination argument
     */
    books: function({
        search,
        order,
        pagination
    }, context) {
        return checkAuthorization(context, 'books', 'read').then(authorization => {
            if (authorization === true) {
                let options = {};
                if (search !== undefined) {
                    let arg = new searchArg(search);
                    let arg_sequelize = arg.toSequelize();
                    options['where'] = arg_sequelize;
                }

                return book.count(options).then(items => {
                    if (order !== undefined) {
                        options['order'] = order.map((orderItem) => {
                            return [orderItem.field, orderItem.order];
                        });
                    } else if (pagination !== undefined) {
                        options['order'] = [
                            ["id", "ASC"]
                        ];
                    }

                    if (pagination !== undefined) {
                        options['offset'] = pagination.offset === undefined ? 0 : pagination.offset;
                        options['limit'] = pagination.limit === undefined ? (items - options['offset']) : pagination.limit;
                    } else {
                        options['offset'] = 0;
                        options['limit'] = items;
                    }

                    if (globals.LIMIT_RECORDS < options['limit']) {
                        throw new Error(`Request of total books exceeds max limit of ${globals.LIMIT_RECORDS}. Please use pagination.`);
                    }
                    return book.findAll(options);
                });
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            handleError(error);
        })
    },

    /**
     * readOneBook - Check user authorization and return one book with the specified id in the id argument.
     *
     * @param  {number} {id}    Id of the record to retrieve
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Record with id requested
     */
    readOneBook: function({
        id
    }, context) {
        return checkAuthorization(context, 'books', 'read').then(authorization => {
            if (authorization === true) {
                return book.findOne({
                    where: {
                        id: id
                    }
                });
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            handleError(error);
        })
    },

    /**
     * addBook - Check user authorization and creates a new record with data specified in the input argument
     *
     * @param  {object} input   Info of each field to create the new record
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         New record created
     */
    addBook: function(input, context) {
        return checkAuthorization(context, 'books', 'create').then(authorization => {
            if (authorization === true) {

                let err = validatorUtil.ifHasValidatorFunctionInvoke('validatorForCreate', book, input);
                if (!!err) {
                    return err;
                } else {
                    return book.create(input)
                        .then(book => {
                            if (input.addAuthors) {
                                book.setAuthors(input.addAuthors);
                            }
                            return book;
                        });
                }
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            handleError(error);
        })
    },

    /**
     * bulkAddBookXlsx - Load xlsx file of records NO STREAM
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     */
    bulkAddBookXlsx: function(_, context) {
        return checkAuthorization(context, 'books', 'create').then(authorization => {
            if (authorization === true) {
                let xlsxObjs = fileTools.parseXlsx(context.request.files.xlsx_file.data.toString('binary'));
                return book.bulkCreate(xlsxObjs, {
                    validate: true
                });
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            handleError(error);
        })
    },


    /**
     * bulkAddBookCsv - Load csv file of records
     *
     * @param  {string} _       First parameter is not used
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     */
    bulkAddBookCsv: function(_, context) {
        return checkAuthorization(context, 'books', 'create').then(authorization => {
            if (authorization === true) {

                delim = context.request.body.delim;
                cols = context.request.body.cols;
                tmpFile = path.join(__dirname, uuidv4() + '.csv');

                context.request.files.csv_file.mv(tmpFile).then(() => {

                    fileTools.parseCsvStream(tmpFile, individual, delim, cols).then(() => {
                        try {
                            email.sendEmail(helpersAcl.getTokenFromContext(context).email,
                                'ScienceDB batch add',
                                'Your data has been successfully added to the database.');
                        } catch (error) {
                            console.log(error.message);
                        }

                        fs.unlinkSync(tmpFile);
                    }).catch((error) => {
                        try {
                            email.sendEmail(helpersAcl.getTokenFromContext(context).email,
                                'ScienceDB batch add', `${error.message}`);
                        } catch (error) {
                            console.log(error.message);
                        }

                        fs.unlinkSync(tmpFile);
                    });

                }).catch((error) => {
                    return new Error(error);
                });

            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            return error;
        })
    },

    /**
     * deleteBook - Check user authorization and delete a record with the specified id in the id argument.
     *
     * @param  {number} {id}    Id of the record to delete
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {string}         Message indicating if deletion was successfull.
     */
    deleteBook: function({
        id
    }, context) {
        return checkAuthorization(context, 'books', 'delete').then(authorization => {
            if (authorization === true) {
                return book.findByPk(id)
                    .then(book_sqlz => {

                        if (book_sqlz === null) return new Error(`Record with ID = ${id} not exist`);

                        let err = validatorUtil.ifHasValidatorFunctionInvoke('validatorForDelete', book, book_sqlz);
                        if (!!err) {
                            return err;
                        } else {
                            return book_sqlz
                                .destroy()
                                .then(() => {
                                    return 'Item successfully deleted';
                                });
                        }
                    });
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            handleError(error);
        })
    },

    /**
     * updateBook - Check user authorization and update the record specified in the input argument
     *
     * @param  {object} input   record to update and new info to update
     * @param  {object} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Updated record
     */
    updateBook: function(input, context) {
        return checkAuthorization(context, 'books', 'update').then(authorization => {
            if (authorization === true) {

                let err = validatorUtil.ifHasValidatorFunctionInvoke('validatorForUpdate', book, input);
                if (!!err) {
                    return err;
                } else {
                    return book.findById(input.id)
                        .then(book => {
                            if (input.addAuthors) {
                                book.addAuthors(input.addAuthors);
                            }
                            if (input.removeAuthors) {
                                book.removeAuthors(input.removeAuthors);
                            }
                            return book.update(input);
                        });
                }

            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            handleError(error);
        })
    },

    /**
     * countBooks - Count number of records that holds the conditions specified in the search argument
     *
     * @param  {object} {search} Search argument for filtering records
     * @param  {object} context  Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {number}          Number of records that holds the conditions specified in the search argument
     */
    countBooks: function({
        search
    }, context) {
        return checkAuthorization(context, 'books', 'read').then(authorization => {
            if (authorization === true) {
                let options = {};
                if (search !== undefined) {
                    let arg = new searchArg(search);
                    let arg_sequelize = arg.toSequelize();
                    options['where'] = arg_sequelize;
                }

                return book.count(options);
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            handleError(error);
        })
    },

    /**
     * vueTableBook - Return table of records as needed for displaying a vuejs table
     *
     * @param  {string} _       First parameter is not used
     * @param  {type} context Provided to every resolver holds contextual information like the resquest query and user info.
     * @return {object}         Records with format as needed for displaying a vuejs table
     */
    vueTableBook: function(_, context) {
        return checkAuthorization(context, 'books', 'read').then(authorization => {
            if (authorization === true) {
                return helper.vueTable(context.request, book, ["id", "title", "genre"]);
            } else {
                return new Error("You don't have authorization to perform this action");
            }
        }).catch(error => {
            handleError(error);
        })
    }
}
