import { gql } from "apollo-server-express";

export default gql`
  extend type Mutation {
    userSignup(
      name: String!
      emailId: String!
      phoneNo: String!
      password: String!
      role: Int!
    ): Token

    userSignIn(emailId: String!, password: String, role: Int): Token

    addCourse(
      name: String!
      startTime: String!
      endTime: String!
      userId: Int!
    ): courseResponse

    joinCourse(courseId: Int, userId: Int!): Msg
  }

  type Msg {
    status: String
    code: String
    message: String
  }

  type Token {
    token: String
    user: Users
  }

  type Users {
    id: ID
    name: String
    emailId: String
    password: String
    role: Int
  }
  type course {
    id: Int
    name: String
    startTime: String
    endTime: String
    userId: Int
  }
  type courseResponse {
    msg: Msg
    course: course
  }
`;
