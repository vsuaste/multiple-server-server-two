module.exports = `
type publi_sher  {
  id: ID
  name: String
  phone: String
  director: Person
  publicationsFilter(search: searchBookInput, order: [ orderBookInput ], pagination: paginationInput): [Book]
  countFilteredPublications(search: searchBookInput) : Int
}

type VueTablePubli_sher{
  data : [publi_sher]
  total: Int
  per_page: Int
  current_page: Int
  last_page: Int
  prev_page_url: String
  next_page_url: String
  from: Int
  to: Int
}

enum publi_sherField {
  id
  name
  phone
}

input searchPubli_sherInput {
  field: publi_sherField
  value: typeValue
  operator: Operator
  search: [searchPubli_sherInput]
}

input orderPubli_sherInput{
  field: publi_sherField
  order: Order
}

type Query {
  publi_shers(search: searchPubli_sherInput, order: [ orderPubli_sherInput ], pagination: paginationInput ): [publi_sher]
  readOnePubli_sher(id: ID!): publi_sher
  countPubli_shers(search: searchPubli_sherInput ): Int
  vueTablePubli_sher : VueTablePubli_sher  }

  type Mutation {
  addPubli_sher( name: String,  phone: String  ): publi_sher!
  updatePubli_sher(id: ID!, name: String,  phone: String ): publi_sher!
  deletePubli_sher(id: ID!): String!
  bulkAddPubli_sherXlsx: [publi_sher]
  bulkAddPubli_sherCsv: [publi_sher]
}

  `;
