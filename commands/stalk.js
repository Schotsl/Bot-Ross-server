"use strict";

module.exports = class Stalk extends Command {
  constructor() {
    super();
    this.commands = [{
      trigger: `notify`,
      function: `notify`,
      description: `Get notifications about a specfic person`,
      timeout: 1000,
      executed: {},
      hidden: true
    }];
  }

  notify(input, message) {
    getRepositoryFactory().getSentenceRepository().getClosestIntention(`confirm`, emotionValue, (sentenceCollection) => {
      message.channel.send(sentenceCollection.getSentences()[0].getContent());
    });

    getRepositoryFactory().getPersonRepository().getByFirst(input[0], (personCollection) => {
      let personObject = personCollection.getPersons()[0];

      bot.on(`voiceStateUpdate`, function(oldMember, newMember) {
        if (oldMember.id === personObject.getDiscord() || newMember.id === personObject.getDiscord()) {

          //If voice channel change
          if (oldMember.voiceChannelID !== newMember.voiceChannelID) {
            let channelObjects = newMember.guild.channels;
            if (newMember.voiceChannelID !== null && oldMember.voiceChannelID !== null) message.channel.send(`${personObject.getFullname()} changed to ${channelObjects.get(newMember.voiceChannelID).name}`);
            else if (oldMember.voiceChannelID === null) message.channel.send(`${personObject.getFullname()} joined ${channelObjects.get(newMember.voiceChannelID).name}`);
            else if (newMember.voiceChannelID === null) message.channel.send(`${personObject.getFullname()} left ${channelObjects.get(oldMember.voiceChannelID).name}`);
          }

          //If voice mute change
          if (oldMember.selfMute !== newMember.selfMute) {
            if (newMember.selfMute) message.channel.send(`${personObject.getFullname()} muted itself`);
            else message.channel.send(`${personObject.getFullname()} unmuted its self`);
          }

          //If voice mute change
          if (oldMember.selfDeaf !== newMember.selfDeaf) {
            if (newMember.selfDeaf) message.channel.send(`${personObject.getFullname()} deafened itself`);
            else message.channel.send(`${personObject.getFullname()} undeafened itself`);
          }

        }
      });

      bot.on(`presenceUpdate`, function(oldMember, newMember) {
        if (oldMember.id === personObject.getDiscord() || newMember.id === personObject.getDiscord()) {

          //If status change
          if (oldMember.presence.status !== newMember.presence.status) {
            message.channel.send(`${personObject.getFullname()} status changed to ${newMember.user.presence.status}`);
          }
        }
      });
    })
  }
}
