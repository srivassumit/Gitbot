var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var https = require('https');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

var router = express.Router();

var port = process.env.PORT || 5000;

var makePostReq = function (postData) {
    var postOptions = {
        url: 'https://hooks.slack.com/services/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',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': postData.length
        }
    }
    var req = https.request(postOptions, (res) => {
        console.log('statusCode from Slack:', res.statusCode);
        console.log('headers from Slack:', res.headers);
        res.on('data', (d) => {
            process.stdout.write(d);
        });
    });
    req.on('error', (e) => {
        console.error(e);
    });
    req.write(postData);
    req.end();
}

router.use(function (req, res, next) {
    console.log('Request is recieved.');
    next(); // make sure we go to the next routes and don't stop here
});

router.post('/', function (req, res) {
    // console.log(JSON.stringify(req.body));

    var postData = JSON.stringify({
        'msg': 'Pull Request #' + req.body.number + ': "' + req.body.pull_request.title +
            '", ' + req.body.action + ' by user ' + req.body.pull_request.user.login +
            ' from: ' + req.body.pull_request.head.label +
            ' to: ' + req.body.pull_request.base.label +
            ' on Repo: ' + req.body.pull_request.base.repo.name
    });
    console.log(postData);
    makePostReq(postData);
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