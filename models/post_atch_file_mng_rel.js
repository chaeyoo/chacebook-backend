const Sequelize = require("sequelize");

module.exports = class PostAtchFileMngRel extends Sequelize.Model {
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
        modelName: "PostAtchFileMngRel",
        tableName: "post_atch_file_mng_rel",
        paranoid: true,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }

  static associate(db) {
    db.PostAtchFileMngRel.belongsTo(db.Post, {
      foreignKey: "postId",
    });
    db.PostAtchFileMngRel.belongsTo(db.AtchFileMng, {
      foreignKey: "atchFileMngId",
    });
  }
};
