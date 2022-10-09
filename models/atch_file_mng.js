const Sequelize = require("sequelize");

module.exports = class AtchFileMng extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        uldFileNm: {
            type: Sequelize.STRING(45),
            allowNull: false,
            comment: "업로드 파일명"
        },
        filePath: {
            type: Sequelize.STRING(200),
            allowNull: false,
            comment: "파일 경로"
        },
        fileSize: {
            type: Sequelize.INTEGER,
            allowNull: false,
            comment: "파일크기"
        },
        ext: {
            type: Sequelize.STRING(10),
            allowNull: false,
            comment: "확장자"
        },
        orgFileNm: {
            type: Sequelize.STRING(15),
            allowNull: false,
            comment: "원파일명"
        },
        regNo: {
          type: Sequelize.BIGINT,
          allowNull: false,
          comment: "등록자번호"
        },
        modNo: {
          type: Sequelize.BIGINT,
          allowNull: false,
          comment: "수정자번호"
        }
      },
      {
        sequelize,
        timestamps: true,
        underscored: true,
        modelName: "AtchFileMng",
        tableName: "atch_file_mng",
        paranoid: true,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }

    static associate(db) {
        db.AtchFileMng.hasOne(db.PostAtchFileMngRel, {
            foreignKey: {
                name: 'atchFileMngId'
            }
        });
    }
};
