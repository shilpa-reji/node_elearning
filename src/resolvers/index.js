import { GraphQLDateTime } from 'graphql-iso-date';
import userResolver from './users';


const customScalarResolver = {
  Date: GraphQLDateTime,
};

// eslint-disable-next-line max-len
export default [
    customScalarResolver,
    userResolver
];
