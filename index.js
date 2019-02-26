var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var https = require('https');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

var router = express.Router();

var userList = ['susrivastava', 'srivassumit'];

var port = process.env.PORT || 5000;


// var slackWebhookPath = '/services/TGFUG9XDX/BGGRUDC7P/YgM1rD8xWxQOPNTES3xwrkIT';
console.log(JSON.stringify(process.env.SLACK_WEBHOOK).split('https://hooks.slack.com/services/')[1]);


var makePostReq = function (postData) {
    var postOptions = {
        host: 'hooks.slack.com',
        path: '/services/' + process.env.SLACK_WEBHOOK.split('https://hooks.slack.com/services/')[1],
        port: 443,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': postData.length
        }
    }
    var req = https.request(postOptions, (res) => {
        console.log('statusCode from Slack:', res.statusCode);
        // console.log('headers from Slack:', res.headers);
        // res.on('data', (d) => {
        //     process.stdout.write(d);
        // });
    });
    req.on('error', (e) => {
        console.log('Error while sending POST to Slack');
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

    if (userList.includes(req.body.pull_request.user.login)) {
        var postData = {
            "text": 'New Pull Request Notification!',
            "attachments": [{
                "fallback": "Required plain-text summary of the attachment.",
                "color": "#36a64f",
                "title": 'Pull Request #' + req.body.number + ': ' + req.body.pull_request.title,
                "title_link": req.body.pull_request.html_url,
                "text": 'Pull Request ' + req.body.action + ' by *<' + req.body.pull_request.user.html_url + '|' + req.body.pull_request.user.login +
                    '>* on Repo: *<' + req.body.pull_request.base.repo.html_url + '|' + req.body.pull_request.base.repo.name +
                    '>* from fork/branch: *<' + req.body.pull_request.head.repo.html_url + '|' + req.body.pull_request.head.label +
                    '>* to fork/branch: *<' + req.body.pull_request.base.repo.html_url + '|' + req.body.pull_request.base.label + '>*'
            }]
        };
        console.log(postData);
        makePostReq(JSON.stringify(postData));
    } else {
        console.log('Pull request was created by someone in Git who is not on watch list. Do nothing.');
    }
    res.status(200);
    res.send("POST request complete");
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function (req, res) {
    console.log('env var is: ' + process.env.SLACK_WEBHOOK);
    console.log('path is: ' + JSON.stringify(process.env.SLACK_WEBHOOK).split('https://hooks.slack.com')[1]);
    res.json({
        message: 'hooray! welcome to our api!'
    });
});

app.use('/', router);

app.listen(port, function () {
    console.log('server listening on port ' + port);
});