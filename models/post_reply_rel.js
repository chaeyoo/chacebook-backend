/* eslint-disable prettier/prettier */
const Sequelize = require("sequelize");

module.exports = class PostReplyRel extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
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
        modelName: "PostReplyRel",
        tableName: "post_reply_rel",
        paranoid: true,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }

  static associate(db) {
    db.PostReplyRel.belongsTo(db.Post, {
      foreignKey: "postId",
    });
    db.PostReplyRel.belongsTo(db.Reply, {
      foreignKey: "replyId",
    });
  }
};
