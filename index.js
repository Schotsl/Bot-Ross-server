const talkedRecently = new Set();

const Discord = require("discord.js");

const Fs = require('fs');
const Hue = require('node-hue-api').HueApi;

const Light = require('./classes/light.js')
const Group = require('./classes/group.js');
const Report = require('./classes/report.js');

const botoptions = require("./credentials/bot.json");
const hueCredentials = require('./credentials/hue.json');

global.report = new Report(Fs)
const bot = new Discord.Client();
const api = new Hue(hueCredentials['host'], hueCredentials['username']);

let officeLightsId = [10, 11, 12, 13];
let officeLights = new Array();

let officeGroupsId = [8];
let officeGroups = new Array();

//Turn light id array into Light array
officeLightsId.forEach(function(officeLightId) {
  officeLights.push(new Light(officeLightId, api));
});

//Turn group id array into Group array
officeGroupsId.forEach(function(officeGroupsId) {
  officeGroups.push(new Group(officeGroupsId, api));
});

function toggle() {
  officeLights.forEach(function(officeLight) {
    officeLight.toggleLight();
  });
}

function party() {
  officeLights.forEach(function(officeLight) {
    for (let i = 0; i < 9; i ++ ) {
      setTimeout(() => {
        officeLight.toggleLight();
      }, getRandomInteger(100, 1000));
    }
  });
}

function getRandomInteger(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

bot.on("ready", async () => {
  report.log(`Bot is ready. ${bot.user.username}`);
  report.log(`Invite link ${await bot.generateInvite(["ADMINISTRATOR"])}`);
});

bot.on("message", async message => {
if (message.content.startsWith(botoptions.prefix)) {

  let messageArray = message.content.split(" ");
  let command = messageArray[0];

  command = command.substring(1);

  switch (command.toLowerCase()) {
    case "info":
    message.channel.send(botoptions.info);
    break;

    case "party":
    message.channel.send("Get the party started");
    party();
    break;

    case "toggle":
    if (talkedRecently.has(message.author.id)) {
      message.channel.send("Wait 1 minute before getting typing this again. - " + message.author);
    } else {

      toggle();
      message.channel.send("Toggled the lights.");

      talkedRecently.add(message.author.id);
      setTimeout(() => {
        // Removes the user from the set after a minute
        talkedRecently.delete(message.author.id);
      }, 60000);
    }
    break;

    case "set":
    if (isNaN(messageArray[1] && isNaN(messageArray[2]))) return message.channel.send("Please provide a number and off/on");
    if (!(messageArray[2] == "off" || messageArray[2] == "on")) return message.channel.send("Please provide a number and off/on");
    let state = messageArray[2] == "off" ? false : true;

    let stateObject = {
      on: state,
    }
    officeLights[messageArray[1] -1].setState(stateObject);
    break;

    case "warm":
    let data = {ct: 500};
    console.log("doing stuff.")
    officeGroups[0].setGroup(data);
    break;

    default:
      message.channel.send(botoptions.default);
    break;
  }
  }
})

bot.login(botoptions.token);
