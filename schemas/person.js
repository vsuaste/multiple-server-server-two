module.exports = `
  type Person  {
    id: ID
    firstName: String
    lastName: String
    email: String
    companyId: Int
    company: publi_sher
    worksFilter(search: searchBookInput, order: [ orderBookInput ], pagination: paginationInput): [Book]
    countFilteredWorks(search: searchBookInput) : Int

  }

  type VueTablePerson{
    data : [Person]
    total: Int
    per_page: Int
    current_page: Int
    last_page: Int
    prev_page_url: String
    next_page_url: String
    from: Int
    to: Int
  }

  enum PersonField {
    id
    firstName
    lastName
    email
  }

  input searchPersonInput {
    field: PersonField
    value: typeValue
    operator: Operator
    search: [searchPersonInput]
  }

  input orderPersonInput{
    field: PersonField
    order: Order
  }

  type Query {
    people(search: searchPersonInput, order: [ orderPersonInput ], pagination: paginationInput ): [Person]
    readOnePerson(id: ID!): Person
    countPeople(search: searchPersonInput ): Int
    vueTablePerson : VueTablePerson  }

    type Mutation {
    addPerson( firstName: String, lastName: String, email: String , companyId: Int ): Person!
    updatePerson(id: ID!, firstName: String, lastName: String, email: String ,companyId: Int ): Person!
    deletePerson(id: ID!): String!
    bulkAddPersonXlsx: [Person]
    bulkAddPersonCsv: [Person]
}
  `;
