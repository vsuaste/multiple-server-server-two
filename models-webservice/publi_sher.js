module.exports = class publi_sher {

    /**
     * constructor - Creates an instance of the model stored in webservice
     *
     * @param  {obejct} input    Data for the new instances. Input for each field of the model.
     */
    constructor({
        id,
        name,
        phone
    }) {
        this.id = id;
        this.name = name;
        this.phone = phone;
    }
}
