// This example demonstrates a simple server with some
// relational data: Posts and Authors. You can get the
// posts for a particular author, and vice-versa

// Read the complete docs for graphql-tools here:
// http://dev.apollodata.com/tools/graphql-tools/generate-schema.html

import { find, filter } from 'lodash';
import { makeExecutableSchema } from 'graphql-tools';

const typeDefs = `
  type ExtensionPoint {
    name: String!
    schema: String!
  }
  type AppScript {
    appKey: ID!
    extensionPointName: String!
    title: String!
    inputSchema: String!
    configSchema: String!
  }
  type ShopScript {
    appKey: ID!
    extensionPointName: String!
    shopId: ID!
    title: String!
    configuration: String!
    appScript: AppScript!
  }

  type Query {
    extensionPoints: [ExtensionPoint!]!
    appScript(appKey: ID!, extensionPointName: String!): AppScript
    shopScript(appKey: ID!, shopId: ID!, extensionPointName: String!): ShopScript
  }

  type AppScriptPayload {
    userErrors: [UserError!]!
    appScript: AppScript
  }
  type ShopScriptPayload {
    userErrors: [UserError!]!
  }

  type UserError {
    message: String!
    field: [String!]
  }

  type Mutation {
    appScriptUpdateOrCreate (
      appKey: ID!
      extensionPointName: String!
      title: String
      sourceCode: String
      inputSchema: String
      configSchema: String
    ): AppScriptPayload

    shopScriptUpdateOrCreate (
      appKey: ID!
      shopId: ID!
      extensionPointName: String!
      title: String
      configuration: String
    ): ShopScriptPayload

    shopScriptDelete (
      appKey: ID!
      shopId: ID!
      extensionPointName: String!
    ): ShopScriptPayload

  }
`;

const resolvers = {
  Query: {
    extensionPoints: () => extensionPoints,
    appScript: (_, { appKey, extensionPointName }) => find(appScripts, { appKey: appKey, extensionPointName: extensionPointName }),
    shopScript: (_, { appKey, shopId, extensionPointName }) => find(shopScripts, { appKey: appKey, shopId: shopId, extensionPointName: extensionPointName }),
  },
  Mutation: {
    appScriptUpdateOrCreate: (_, { appKey, extensionPointName, title, inputSchema, configSchema, sourceCode }) => {
      let as = { appKey, extensionPointName, title, inputSchema, configSchema };
      appScripts.push(as);
      return { userErrors: [], appScript: as }
    },
    shopScriptUpdateOrCreate: (_, { appKey, extensionPointName, shopId, title, configuration }) => {
      let ss = { appKey, extensionPointName, shopId, title, configuration };
      shopScripts.push(ss);
      return { userErrors: [], shopScript: ss }
    },
    shopScriptDelete: (_, { appKey, shopId, extensionPointName, configuration }) => {
      let ss = find(shopScripts, { appKey: appKey, shopId: shopId, extensionPointName: extensionPointName });
      // delete
      return { userErrors: [] }
    },
  },
};

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

const extensionPoints = [
  { name: 'discount', schema: '{}' },
  { name: 'vanity_pricing', schema: '{}' },
  { name: 'shipping', schema: '{}' },
];

const appScripts = [
  { appKey: '1', extensionPointName: 'discount',       title: "app script 1", inputSchema: '{}', configSchema: '{ discount: Int }' },
  { appKey: '2', extensionPointName: 'vanity_pricing', title: "app script 2", inputSchema: '{}', configSchema: '' },
  { appKey: '3', extensionPointName: 'shipping',       title: "app script 3", inputSchema: '{}', configSchema: '' },
];

const shopScripts = [
  { appKey: '1', shopId: '1', extensionPointName: 'discount', title: "shop script 1", configuration: '{ discount: 99 }'},
  { appKey: '1', shopId: '2', extensionPointName: 'discount', title: "shop script 2", configuration: '{ discount: 95 }'},
  { appKey: '1', shopId: '3', extensionPointName: 'discount', title: "shop script 3", configuration: '{ discount: 90 }'},
];
