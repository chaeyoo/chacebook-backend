const Sequelize = require("sequelize");

module.exports = class PostHashtagRel extends Sequelize.Model {
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
        },},
      {
        sequelize,
        timestamps: true,
        underscored: true,
        modelName: "PostHashtagRel",
        tableName: "post_hashtag_rel",
        paranoid: true,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }

    static associate(db) {
        db.PostHashtagRel.belongsTo(db.Post, {
            foreignKey: 'postId',
        });
        db.PostHashtagRel.belongsTo(db.Hashtag, {
            foreignKey: 'hashtagId',
        });
    }
};
