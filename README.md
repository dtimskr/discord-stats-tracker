# Discord Stats Tracker
Tested on Node v16.9.1

# Features
- checking top10 on messages and voice chat using `*top10 msg/v`
- checking rank by `*rank` command
- automatically fetching time spend on voice chat and count of messages

# Requirements
- MongoDB server (you can create free on MongoDB atlas)
- Discord Bot Token

# Usage
Rename `.env.example` to `.env` file, setup variables to your data and use `npm start` to run bot.

# TODO
## Tracking
- [ ] Add spam detector
## Commands
- [ ] Add checking any user rank by mention in `*rank <@user>`
- [ ] Add some charts for statistic
## Back-end
- [ ] Simplify `*top10` to use `collection.aggregate`
- [ ] Creating automatically guild collection on join
## Front-end
- [ ] Create Web Panel to view stats
- [ ] OAuth to Web Panel via Discord

