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
        paranoid: true,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }

    static associate(db) {
        db.Follow.belongsTo(db.User, {
            foreignKey: 'followerId',
        });
        db.Follow.belongsTo(db.User, {
            foreignKey: 'followeeId',
        });
    }
};
