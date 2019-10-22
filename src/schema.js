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
    appId: ID!
    extensionPointName: String!
    title: String!
    inputSchema: String!
    configSchema: String!
  }
  type ShopScript {
    shopId: ID!
    extensionPointName: String!
    title: String!
    configOverrides: String!
    appScript: AppScript!
  }

  type Query {
    extensionPoints: [ExtensionPoint!]!
    appScript(appId: ID!, extensionPointName: String!): AppScript
    shopScript(appId: ID!, shopId: ID!, extensionPointName: String!): ShopScript
  }

  input ShopScriptID {
    appId: ID!
    shopId: ID!
    extensionPointName: String!
  }
  input AppScriptID {
    appId: ID!
    extensionPointName: String!
  }

  type AppScriptPayload {
    userErrors: [UserError!]!
    appScript: AppScript
  }
  type ShopScriptPayload {
    userErrors: [UserError!]!
    shopScript: ShopScript
  }

  type UserError {
    message: String!

    # Path to input field which caused the error.
    field: [String!]
  }

  type Mutation {
    appScriptCreateOrUpdate (
      id: AppScriptID!
      title: String
      wasm: String
      inputSchema: String
      configSchema: String
    ): AppScriptPayload

    shopScriptCreate (
      id: ShopScriptID!
      title: String!
      configOverrides: String!
    ): ShopScriptPayload

    shopScriptUpdate (
      id: ShopScriptID!
      title: String!
      configOverrides: String
    ): ShopScriptPayload

    shopScriptDelete (
      id: ShopScriptID!
    ): ShopScriptPayload

  }
`;

const resolvers = {
  Query: {
    extensionPoints: () => extensionPoints,
    appScript: (_, { appId, extensionPointName }) => find(appScripts, { appId: appId, extensionPointName: extensionPointName }),
    shopScript: (_, { appId, shopId, extensionPointName }) => find(shopScripts, { appId: appId, shopId: shopId, extensionPointName: extensionPointName }),
  },
  Mutation: {
    appScriptCreateOrUpdate: (_, { appId, extensionPointName, title, inputSchema, configSchema, wasm }) => {
      let as = { appId, extensionPointName, title, inputSchema, configSchema, wasm };
      appScripts.push(as);
      return { userErrors: [], appScript: as }
    },
    shopScriptCreate: (_, { appId, shopId, extensionPointName, title, configOverrides }) => {
      let ss = { appId, shopId, extensionPointName, title, configOverrides };
      shopScripts.push(ss);
      return { userErrors: [], shopScript: ss }
    },
    shopScriptUpdate: (_, { appId, shopId, extensionPointName, title, configOverrides }) => {
      let ss = find(shopScripts, { appId: appId, shopId: shopId, extensionPointName: extensionPointName });
      // update
      return { userErrors: [], shopScript: ss }
    },
    shopScriptDelete: (_, { appId, shopId, extensionPointName, configOverrides }) => {
      let ss = find(shopScripts, { appId: appId, shopId: shopId, extensionPointName: extensionPointName });
      // delete
      return { userErrors: [], shopScript: null }
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
  { appId: '1', extensionPointName: 'discount',       title: "1", inputSchema: '{}', configSchema: '{ discount: Int }' },
  { appId: '2', extensionPointName: 'vanity_pricing', title: "2", inputSchema: '{}', configSchema: '' },
  { appId: '3', extensionPointName: 'shipping',       title: "3", inputSchema: '{}', configSchema: '' },
];

const shopScripts = [
  { appId: '1', shopId: '1', extensionPointName: 'discount', title: "1", configOverrides: '{ discount: 99 }'},
  { appId: '1', shopId: '2', extensionPointName: 'discount', title: "2", configOverrides: '{ discount: 95 }'},
  { appId: '1', shopId: '3', extensionPointName: 'discount', title: "3", configOverrides: '{ discount: 90 }'},
];
