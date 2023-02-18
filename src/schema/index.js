import { gql } from 'apollo-server-express';
import userSchema from './users';


const linkSchema = gql`
  scalar Date
  type Query {
    _: Boolean
  }
 
  type Mutation {
    _: Boolean
  }
 
  type Subscription {
    _: Boolean
  }
`;

// eslint-disable-next-line max-len
export default [
    linkSchema,
    userSchema
];
