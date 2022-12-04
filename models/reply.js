/* eslint-disable prettier/prettier */
const Sequelize = require("sequelize");
module.exports = class Reply extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        comment: {
          type: Sequelize.STRING(2000),
          allowNull: false,
          comment: "댓글내용",
        },
        class: {
            type: Sequelize.INTEGER,
            allowNull: false,
            comment: "분류",
        },
        upReplyId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            comment: "상위댓글아이디",
        },
        order: {
            type: Sequelize.INTEGER,
            allowNull: false,
            comment: "순서",
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: true,
        modelName: "Reply",
        tableName: "reply",
        paranoid: true,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }

  static associate(db) {
    db.Reply.belongsTo(db.User);
    db.Reply.hasOne(db.PostReplyRel, {
      foreignKey: {
        name: "replyId",
      },
    });
  }
};
