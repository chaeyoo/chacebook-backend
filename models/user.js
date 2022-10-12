const Sequelize = require("sequelize");

module.exports = class User extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        email: {
          type: Sequelize.STRING(40),
          allowNull: false,
          unique: true,
          comment: "이메일",
        },
        password: {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: "비밀번호",
        },
        provider: {
          type: Sequelize.STRING(10),
          allowNull: false,
          defaultValue: "local",
          comment: "비밀번호",
        },
        snsId: {
          type: Sequelize.STRING(30),
          allowNull: true,
          comment: "sns id",
        },
        nickName: {
          type: Sequelize.STRING(15),
          allowNull: false,
          comment: "닉네임",
        },
        regNo: {
          type: Sequelize.BIGINT,
          allowNull: false,
          comment: "등록자번호",
        },
        modNo: {
          type: Sequelize.BIGINT,
          allowNull: false,
          comment: "수정자번호",
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: true,
        modelName: "User",
        tableName: "users",
        paranoid: true,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }

    static associate(db) {
      db.User.hasMany(db.Post);
      db.User.hasOne(db.Follow, {
        foreignKey: {
          name: 'follower'
        }
      })
      db.User.hasOne(db.Follow, {
        foreignKey: {
          name: 'followee'
        }
      })
    }
};
