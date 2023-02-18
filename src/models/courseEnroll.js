const courseEnroll = (sequelize, DataTypes) => {
    const courseEnroll = sequelize.define('courseEnroll', {
        status: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
          },
      
    });
    courseEnroll.associate = (models) => {
        courseEnroll.belongsTo(models.users, {
        foreignKey: 'userId',
        as: 'user',
      });
      courseEnroll.belongsTo(models.course, {
        foreignKey: 'courseId',
        as: 'course',
      });
    };
    return courseEnroll;
  };
  export default courseEnroll;