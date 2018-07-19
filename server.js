var compression = require('compression');
var express = require('express');
var jsonfile = require('jsonfile');
var methodOverride = require('method-override');
var router = express.Router();
var port = process.env.PORT || 3000;
var bodyParser = require('body-parser');
var empFile = './data/employe.data.json';
var __response = {
    status: "ok",
    error: {},
    errorcode: null
};
var app = express();
app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride());

app.use(function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Accept', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

    next();
});

router.get('/', function (req, res) {

    res.send('Hi!, This api is at http:localhost:' + port + '/api')
});
router.get('/emp', function (req, res, next) {
    jsonfile.readFile(empFile, function (err, obj) {
        res.json({ "match": obj ? obj['heroList'] : [] });
    })
});
router.get('/emp/:id', function (req, res, next) {
    jsonfile.readFile(empFile, function (err, obj) {
        var data = obj ? (obj['heroList'] ? obj['heroList'].filter(i => i.id == req.param('id')) : []) : [];
        if (data.length > 0)
            res.json({ "match": data });
        else
            res.json({});
    });
});
router.post('/emp', function (req, res, next) {
    try {
        if (req.body.id && req.body.depart && req.body.name) {
            jsonfile.readFile(empFile, function (err, obj) {
                try {
                    var data = obj ? obj['heroList'] : [];
                    if (data.filter(i => i.id == req.body.id).length == 0) {
                        data.push({ "id": req.body.id, "name": req.body.name, "depart": req.body.depart });
                        jsonfile.writeFile(empFile, { "heroList": data }, { spaces: 2 }, function (err) {
                            try {
                                res.status(200);
                                res.json(__response);
                            } catch (error) {
                                next(error);
                            }
                        })
                    } else {
                        throw new Error("can not insert duplicate record");
                    }
                } catch (error) {
                    next(error);
                }
            });
        } else {
            throw new Error("Invalid parameters");
        }
    } catch (error) {
        next(error);
    }

});
router.put('/emp', function (req, res, next) {
    var isRecordFound = false;
    jsonfile.readFile(empFile, function (err, obj) {
        try {
            var data = obj ? obj['heroList'] : [];
            for (var i = 0; i < data.length; i++) {
                if (data[i]['id'] == req.body.id) {
                    isRecordFound = true;
                    data[i]['name'] = req.body.name;
                    data[i]['depart'] = req.body.depart;

                    jsonfile.writeFile(empFile, { "heroList": data }, { spaces: 2 }, function (err) {
                        try {
                            res.status(200);
                            res.json(__response);
                        } catch (error) {
                            next(error);
                        }

                    })
                    break;
                }
            }
            if (!isRecordFound) {
                res.status(500);
                __response.error = {
                    message: "Record not found."
                };
                __response.errorcode = 500;
                __response.status = "ERROR";
                res.json(__response);
            }
        } catch (error) {
            next(error);
        }
    });


});

app.use('/api', router);
app.use(function (err, req, res, next) {
    if (app.get('env') === 'development') {
        __response.error = { message: err['message'], stack: err['stack'] ? JSON.stringify(err['stack']) : "" };
    } else {
        __response.error = { message: err['message'] };
    }

    __response.errorcode = err.status || 500;
    __response.status = "Something went wrong!"
    res.status(__response.errorcode);
    res.json(__response);
});

app.listen(port);
console.log('\t \t \t *** API STARTED on http://localhost:' + port + '/api/ ***');