const course = (sequelize, DataTypes) => {
    const course = sequelize.define('course', {
      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      startTime: {
        type: DataTypes.TIME,
        allowNull: true,
      },
      endTime: {
        type: DataTypes.TIME,
        allowNull: true,
    },
      status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
    });
    course.associate = (models) => {
        course.belongsTo(models.users, {
        foreignKey: 'userId',
        as: 'user',
      });
    };
    return course;
  };
  export default course;