import jwt from "jsonwebtoken";
import { AuthenticationError, UserInputError } from "apollo-server";
import respObj from "../assets/lang/en.json";
const bcrypt = require("bcryptjs");
import { Op, where } from "sequelize";
import e from "express";
var Bugsnag = require("@bugsnag/js");
const md5 = require("md5");
const { authAPI } = respObj;
const createToken = async (user, secret, expiresIn) => {
  const { id, emailId, role } = user;

  const jwtToken = await jwt.sign(
    {
      id,
      emailId,
      role,
    },
    secret,
    {
      expiresIn,
    }
  );
  return jwtToken;
};
function userCode() {
  let result = "";
  const length = 4;
  const characters = "0123456789";
  let string = "";
  console.log(string.slice(0, 6));
  const charactersLength = characters.length;
  for (let i = 0; i < length; i += 1) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return `USER_ ` + `${string.slice(0, 6)}` + `${result}`;
}
export default {
  Mutation: {
    userSignup: async (
      parent,
      { name, emailId, phoneNo, password, role },
      { models, secret }
    ) => {
      try {
        const userId = userCode();

        const userEmailCheck = await models.users.findOne({
          where: { emailId: emailId, role: role, status: 1 },
        });

        if (userEmailCheck) {
          throw new UserInputError(authAPI.email_already_exist);
        }
        const userPhoneCheck = await models.users.findOne({
          where: { phoneNo: phoneNo, role: role, status: 1 },
        });
        if (userPhoneCheck) {
          throw new UserInputError(authAPI.phoneNo_already_exist);
        }
        const user = await models.users.create({
          userCode: userId,
          name,
          emailId,
          phoneNo,
          password: md5(password),
          role,
        });

        const token = await createToken(user, secret, "1d");
        const datas = {
          jwtToken: token,
        };
        const update = await models.users.update(datas, {
          where: { id: user.id },
        });

        const data = {
          token: token,
          user: user,
        };

        return data;
      } catch (error) {
        Bugsnag.notify(error);
        throw new UserInputError(error);
      }
    },

    userSignIn: async (
      parent,
      { emailId, password, role },
      { models, secret }
    ) => {
      try {
        const users = await models.users.findOne({
          where: { emailId, role, status: 1 },
        });
        if (users) {
          const loginData = await models.users.findOne({
            where: { emailId, password: md5(password), status: 1 },
          });
          if (loginData) {
            const token = await createToken(loginData, secret, "1d");
            const datas = {
              jwtToken: token,
            };
            const update = await models.users.update(datas, {
              where: { id: users.id },
            });
            let user = await models.users.findOne({
              where: { id: users.id },
            });
            return { token, user };
          } else {
            throw new UserInputError(authAPI.invalid_password);
          }
        } else {
          throw new UserInputError(authAPI.email_no_exists);
        }
      } catch (error) {
        Bugsnag.notify(error);
        throw new UserInputError(error);
      }
    },
    addCourse: async (
      parent,
      { name, startTime, endTime, userId },
      { models, me }
    ) => {
      try {
        if (!me) {
          throw new AuthenticationError(authAPI.auth_failed);
        }
        let postData = {
          name,
          startTime,
          endTime,
          userId,
        };
        const isTeacher = await models.users.findOne({ where: { id: me.id } });
        if (!isTeacher.role === 2) {
          throw new UserInputError(authAPI.No_Permission);
        }
        const teachersCourse = await models.course.findAll({
          where: { userId },
        });
        if (teachersCourse.length >= 3) {
          throw new UserInputError(authAPI.limit_reched);
        }
        const start = new Date(startTime);
        const end = new Date(endTime);

        const differenceInMs = Math.abs(end - start);
        const differenceInHrs = differenceInMs / (1000 * 60 * 60);

        if (differenceInHrs > 1) {
          throw new UserInputError("Please provide period within 1 hr");
        }
        const overLapCourse = await models.course.findAll({
          where: {
            [Op.or]: [
              {
                startTime: {
                  [Op.between]: [startTime, endTime],
                },
                endTime: {
                  [Op.between]: [startTime, endTime],
                },
              },
            ],
          },
        });
        if (overLapCourse.length > 0) {
          throw new UserInputError(authAPI.time_overlap);
        }
        const now = new Date();

        const courseCreate = await models.course.create(postData);
        if (courseCreate.id) {
          const msg = {
            status: authAPI.success,
            code: authAPI.codeSuccess,
            message: authAPI.courseCreated,
          };

          const course = await models.course.findOne({
            where: { id: courseCreate.id },
          });
          const data = {
            msg,
            course,
          };
          return data;
        }
      } catch (error) {
        Bugsnag.notify(error);
        throw new UserInputError(error);
      }
    },
    joinCourse: async (parent, { courseId, userId }, { models, me }) => {
      try {
        if (!me) {
          throw new AuthenticationError(authAPI.auth_failed);
        }
        let postData = {
          userId: userId,
          courseId,
        };
        const studentCheck = await models.users.findOne({
          where: { id: me.id },
        });
        if (!studentCheck) {
          throw new UserInputError(authAPI.student_not_exist);
        }
        const checkCourse = await models.course.findOne({
          where: { id: courseId },
        });
        if (!checkCourse) {
          throw new UserInputError(authAPI.course_not_exist);
        }
        const isEnrolled = await models.courseEnroll.findOne({
          where: { userId: userId },
        });
        if (isEnrolled) {
          throw new UserInputError(authAPI.course_limit_reached);
        }
        const joinCourse = await models.courseEnroll.create(postData);

        const msg = {
          status: authAPI.success,
          code: authAPI.codeSuccess,
          message: authAPI.successfully_joined,
        };
        return msg;
      } catch (error) {
        Bugsnag.notify(error);
        throw new UserInputError(error);
      }
    },
  },
};
