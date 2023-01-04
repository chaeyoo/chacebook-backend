/* eslint-disable prettier/prettier */
const Sequelize = require("sequelize");

module.exports = class Favorite extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {},
      {
        sequelize,
        timestamps: true,
        underscored: true,
        modelName: "Favorite",
        tableName: "favorite",
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }

  static associate(db) {
    db.Favorite.belongsTo(db.User, {
      foreignKey: "user_id",
    });
    db.Favorite.belongsTo(db.Post, {
      foreignKey: "post_id",
    });
  }
};
