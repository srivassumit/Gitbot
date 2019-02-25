var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

var router = express.Router();

var port = process.env.PORT || 5000;

router.use(function (req, res, next) {
    console.log('Request is recieved.');
    next(); // make sure we go to the next routes and don't stop here
});

router.post('/', function (req, res) {
    // console.log(JSON.stringify(req.body));

    // console.log(req.body.action);
    // console.log(req.body.number);
    // console.log(req.body.pull_request.user.login);


    console.log('Pull Request #' + req.body.number + ': "' + req.body.pull_request.title +
        '", ' + req.body.action + ' by user ' + req.body.pull_request.user.login +
        ' from: ' + req.body.pull_request.head.label +
        ' to: ' + req.body.pull_request.base.label);

    res.status(200);
    res.send("POST request complete");
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function (req, res) {
    res.json({
        message: 'hooray! welcome to our api!'
    });
});

app.use('/api', router);

app.listen(port, function () {
    console.log('server listening on port ' + port);
});