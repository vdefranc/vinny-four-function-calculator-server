const { GraphQLServer } = require('graphql-yoga');
const { Prisma } = require('prisma-binding');

const uuidv4 = require('uuid/v4');

const resolvers = {
  Query: {
    calculator: (parent, args, ctx, info) => {
      return ctx.db.query.calculators({ where: { id: args.id } })
    },
    operations: (parent, args, ctx, info) => {
      return ctx.db.query.operations({ where: { calculator: {id: args.calculatorId } } })
    }
  },
  Mutation: {
    addCalculator: (parent, lmfao, ctx, info) => {
      return ctx.db.mutation.createCalculator({ data: {
        display: '0',
        operations: []
      }});
    },
    addOperation: (parent, {calculatorId, operation}, ctx, info) => {
      return ctx.db.mutation.createOperation({
        data: {
          calculator: { connect: { id: calculatorId } },
          ...operation
        },
      }, info);
    }
  },
  Subscription: {
    newOperation: {
      subscribe: (parent, args, ctx, info) => {
        return ctx.db.subscription.operation(
          // { where: { calculator: { id : args.calculatorId }}},
          { },
          info,
        )
      }
    }
  }
}

const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,
  context: req => ({
    ...req,
    db: new Prisma({
      typeDefs: 'src/generated/prisma.graphql',
      endpoint: 'https://us1.prisma.sh/public-pintoninja-957/vin-calc/dev',
      secret: process.env.PRISMA_SECRET,
      debug: true
    }),
  }),
})

server.start({ port: process.env.PORT || 4000 },
  () => console.log(`Server is running on port ${process.env.PORT || 4000}`)
);
