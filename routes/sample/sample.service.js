'use strict';
const db = require('/Users/chyoo/node-workspace/myapp/config/database');

exports.index = async (req, res) => {
    let params = req.query;    
    // await db.select.findOne();
    db.getAllMemos((rows) => {
        
        let result = {
            list : rows,
            message: 'success'
        }
        res.status(200).json(result);
    });
    
    //res.status(200).json(result);
}

exports.show = (req, res) => {
    let params = req.params.id;
    let queryParams = req.query;
}

exports.create = (req, res) => {
    let body = req.body;
    console.log(body);

}

exports.update = (req, res) => {
    
}

exports.modify = (req, res) => {

}

exports.delete = (req, res) => {

}

exports.page = (req, res) => {
    res.render('index', {title: 'welcome'});
}



