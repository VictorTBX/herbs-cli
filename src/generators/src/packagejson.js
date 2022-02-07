const { objToString } = require('../utils')
const fsPromises = require('fs').promises

const optionalPackages = {
  mongo: ['"@herbsjs/herbs2mongo": "^1.0.2"', '"mongodb": "^4.3.0"'],
  postgres: ['"@herbsjs/herbs2knex": "^1.4.1"', '"pg": "^8.7.1"'],
  sqlserver: ['"@herbsjs/herbs2knex": "^1.4.1"', '"tedious": "^14.0.0"'],
  mysql: ['"@herbsjs/herbs2knex": "^1.4.1"', '"mysql2": "^2.3.3"'],
  rest: ['"express": "^4.17.2"', '"cors": "^2.8.5"', '"@herbsjs/herbs2rest": "^2.0.1"'],
  graphql: ['"graphql": "^15.8.0"', '"apollo-server": "^3.6.1"',
    '"apollo-server-express": "^3.6.1"', '"graphql-tools": "^8.2.0"', '"graphql-scalars": "^1.14.1"',]
}

const defaultOptions = (options) => {
  return {
    name: options.name ? options.name : 'herbs-project',
    description: options.description ? options.description : 'project generated by herbs CLI S2',
    author: options.author ? options.author : 'herbs CLI',
    license: options.license ? options.license : 'MIT',
    mongo: options.mongo ? options.mongo : false,
    postgres: options.postgres ? options.postgres : false,
    sqlserver: options.sqlserver ? options.sqlserver : false,
    mysql: options.mysql ? options.mysql : false,
    graphql: options.graphql ? options.graphql : false,
    rest: options.rest ? options.rest : false
  }
}

module.exports =
  async ({
    template: { generate },
    parameters: {
      options
    } }) => async () => {

      process.stdout.write(`Generating package.json and running npm\n`)

      options = defaultOptions(options)
      const migration = (options.postgres || options.sqlserver || options.mysql)
        ? `,
      "knex:make": "npx knex --knexfile knexFile.js migrate:make",
      "knex:migrate": "npx knex --knexfile knexFile.js migrate:latest",
      "knex:rollback": "npx knex --knexfile knexFile.js migrate:rollback",
      "knex:makeSeeds": "npx knex --knexfile knexFile.js seed:make",
      "knex:runSeeds": "npx knex --knexfile knexFile.js seed:run"`
        : ''

      let packages = [
        '"@herbsjs/herbs": "^1.4.2"',
        '"@herbsjs/herbarium": "^1.1.0"',
        '"@herbsjs/herbs2gql": "^2.0.1"',
        '"@herbsjs/herbsshelf": "^2.1.2"',
        '"deepmerge": "^4.2.2"',
        '"dotenv": "^12.0.3"',
        '"nodemon": "^2.0.15"',
        '"mocha": "^9.1.4"',
        '"lodash.camelcase": "^4.3.0"',
        '"sugar-env": "^1.5.14"'
      ]

      for (const key of Object.keys(options)) {
        if (key && options[key]) {
          packages = packages.concat(optionalPackages[key])
        }
      }
      packages = packages.filter(item => !!item)

      await generate({
        template: 'package.json.ejs',
        target: 'package.json',
        props: {
          ...options,
          migration,
          packages: objToString(packages, { removeQuotes: false, removeBraces: true, extraSpaces: 2 })
        }
      })

      //fsPromises.symlink(`${__dirname}/../../../node_modules`, `${process.cwd()}/node_modules`)
    }
