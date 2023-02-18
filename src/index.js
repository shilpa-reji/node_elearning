import cors from 'cors';
import express from 'express';
import { ApolloServer, AuthenticationError } from 'apollo-server-express';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

import schema from './schema';
import resolvers from './resolvers';
import models, { sequelize } from './models';

const app = express();
app.use(cors());

const getMe = async (req) => {
  const token = req.headers['x-token'];
  if (token) {
    try {
      return await jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      throw new AuthenticationError(
        'Your session expired. Sign in again.',
      );
    }
  }
  return false;
};

var Bugsnag = require('@bugsnag/js')
var BugsnagPluginExpress = require('@bugsnag/plugin-express')
Bugsnag.start({
  apiKey: '3df437fe0a8924b0d796cc0dce00f0d9',
  plugins: [BugsnagPluginExpress]
})
var middleware = Bugsnag.getPlugin('express')
app.use(middleware.requestHandler)
app.use(middleware.errorHandler)

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  formatError: (error) => {
    const message = error.message
      .replace('SequelizeValidationError: ', '')
      .replace('Validation error: ', '');
    return {
      ...error,
      message,
    };
  },
  context: async ({ req, connection }) => {
    if (connection) {
      return {
        models,
      };
    }
    if (req) {
      const me = await getMe(req);
      const language = req.headers['language'];
      return {
        models,
        me,
        language,
        secret: process.env.JWT_SECRET,
      };
    }
  },
});

server.applyMiddleware({ app, path: '/graphql' });

const createUsersWithMessages = async () => {
  await models.user.create(
    {
      
      name: 'admin',
      emailId: 'admin@gmail.com',
      password: '123456',
      phoneNo: '0000000000',
      status: 1,
    },
  );

  await models.user.create(
    {
      
      name: 'dev',
      emailId: 'dev@gmail.com',
      password: '123456',
      phoneNo: '0000000000',
      status: 1,
    },
  );
};

const eraseDatabaseOnSync = false;

sequelize.sync({ force: eraseDatabaseOnSync }).then(async () => {
  if (eraseDatabaseOnSync) {
    createUsersWithMessages();
  }

  app.listen({ port: process.env.PORT }, () => {
    // eslint-disable-next-line no-console
    console.log('Apollo Server on http://localhost:80/graphql');
  });
}).catch((Err) => {
  throw Err;
});
