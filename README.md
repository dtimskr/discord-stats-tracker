# Discord Stats Tracker BETA

# Features
- checking top10 on messages and voice chat using `*top10 msg/v`
- checking rank by `*rank` command
- automatically fetching time spend on voice chat and count of messages

# Requirements
- MongoDB server (you can create free on MongoDB atlas)
- Discord Bot Token

# Usage
After setting discord bot token and mongodb settings in `.env` file, you can start bot by `npm start` command

# TODO
## Commands
- [ ] Add checking any user rank by mention in `*rank <@user>`
- [ ] Add some charts for statistic
## Back-end
- [ ] API to get data from MongoDB stats
- [ ] Simplify `*top10` to use `collection.aggregate`
- [ ] Creating automatically guild collection on join
## Front-end
- [ ] Create Web Panel
- [ ] OAuth to Web Panel via Discord

