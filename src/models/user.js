const user = (sequelize, DataTypes) => {
    const user = sequelize.define('users', {
      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      userCode: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      emailId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      phoneNo: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      role: {
        type: DataTypes.INTEGER,
        allowNull: true,
        //1=> admin, 2=> teacher, 3=> student
      },
      jwtToken: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
    });
    user.associate = (models) => {
      
      user.hasMany(models.course, {
        foreignKey: 'userId',
        as: 'course',
      });
      user.hasMany(models.courseEnroll, {
        foreignKey: 'userId',
        as: 'courseEnroll',
      });
      
    };
    return user;
  };
  export default user;