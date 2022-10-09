const Sequelize = require("sequelize");

module.exports = class Post extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        content: {
            type: Sequelize.STRING(1000),
            allowNull: false,
        },
        img: {
            type: Sequelize.STRING(200),
            allowNull: true,
        }
      },
      {
        sequelize,
        timestamps: true,
        underscored: true,
        modelName: "Post",
        tableName: "posts",
        paranoid: true,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }

    static associate(db) {
        db.Post.belongsTo(db.User);
        db.Post.hasOne(db.PostHashtagRel, {
            foreignKey: {
                name: 'postId'
            }
        })
    }
    
};
