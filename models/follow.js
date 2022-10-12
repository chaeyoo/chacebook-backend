const Sequelize = require("sequelize");

module.exports = class Follow extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
      },
      {
        sequelize,
        timestamps: true,
        underscored: true,
        modelName: "Follow",
        tableName: "follow",
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }

    static associate(db) {
        db.Follow.belongsTo(db.User, {
            foreignKey: 'follower',
        });
        db.Follow.belongsTo(db.User, {
            foreignKey: 'followee',
        });
    }
};
