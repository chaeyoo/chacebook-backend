/* eslint-disable prettier/prettier */
const Sequelize = require("sequelize");

module.exports = class Bookmark extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {},
      {
        sequelize,
        timestamps: true,
        underscored: true,
        modelName: "Bookmark",
        tableName: "bookmark",
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }

  static associate(db) {
    db.Bookmark.belongsTo(db.User, {
      foreignKey: "user_id",
    });
    db.Bookmark.belongsTo(db.Post, {
      foreignKey: "post_id",
    });
  }
};
