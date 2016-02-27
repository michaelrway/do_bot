# do_bot
A slack bot for deploying digital ocean servers

This is a simple rough server deploy bot for slack made with [botkit](https://github.com/howdyai/botkit).

It requires a token for a slack bot and an api token from digital ocean.

## To run

`npm install`

`token=SLACK_TOKEN doapi=DO_TOKEN node dobot.js`

## Slack commands

`my servers` to see server list

`new server` to start new server dialogue

`delete server` to remove a server

### This project is pretty rough, needs more of documentation, and is open for contribution.
