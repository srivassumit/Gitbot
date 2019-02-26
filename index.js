var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var https = require('https');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

var router = express.Router();

var userList = [];

// user can provide a subscription user list by providing a comma separated list of Github user IDs as a environment variable `USERLIST`
if (process.env.USER_LIST) {
    console.log('mapping user list');
    userList = process.env.USER_LIST.split(',');
}

// these are all the possible events for Git pull requests.
var subscribedEvents = ['opened', 'closed', 'reopened', 'edited', 'assigned', 'unassigned', 'review_requested', 'review_request_removed', 'labeled', 'unlabeled'];

if (process.env.ACTION_LIST) {
    console.log('mapping action list');
    subscribedEvents = process.env.ACTION_LIST.split(',');
}

var port = process.env.PORT || 5000;

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

var doRequest = function (reqBody) {
    var mappedAction = reqBody.action === 'closed' ? reqBody.pull_request.merged === true ? 'merged' : reqBody.action : reqBody.action;
    console.log(mappedAction);
    var postData = {
        "text": 'New Pull Request Notification!',
        "attachments": [{
            "fallback": "Required plain-text summary of the attachment.",
            "color": "#36a64f",
            "title": 'Pull Request #' + reqBody.number + ': ' + reqBody.pull_request.title,
            "title_link": reqBody.pull_request.html_url,
            "text": 'Pull Request ' + mappedAction + ' by *<' + reqBody.pull_request.user.html_url + '|' + reqBody.pull_request.user.login +
                '>* on Repo: *<' + reqBody.pull_request.base.repo.html_url + '|' + reqBody.pull_request.base.repo.name +
                '>* from fork/branch: *<' + reqBody.pull_request.head.repo.html_url + '|' + reqBody.pull_request.head.label +
                '>* to fork/branch: *<' + reqBody.pull_request.base.repo.html_url + '|' + reqBody.pull_request.base.label + '>*'
        }]
    };
    console.log(postData);
    makePostReq(JSON.stringify(postData));
}

router.use(function (req, res, next) {
    console.log('Request is recieved.');
    next(); // make sure we go to the next routes and don't stop here
});

router.post('/', function (req, res) {
    // console.log(JSON.stringify(req.body));
    if (userList.length === 0) {
        doRequest(req.body);
    } else if (userList.length > 0 && userList.includes(req.body.pull_request.user.login)) {
        doRequest(req.body);
    } else {
        console.log('Pull request was created by someone in Git who is not on watch list. Do nothing.');
    }
    res.status(200);
    res.send("POST request complete");
});

router.get('/', function (req, res) {
    res.json({
        message: 'hooray! welcome to our api!'
    });
});

app.use('/', router);

app.listen(port, function () {
    console.log('server listening on port ' + port);
});