const { getFirestore, doc, setDoc, getDocs, collection } = require('firebase/firestore');
const { initializeApp } = require('firebase/app');
const { firebaseConfig } = require('../firebaseConfig.js');
const { EmbedBuilder } = require('discord.js');

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

module.exports = {
    name: 'messageCreate',
    once: false,
    execute: async function(message) {
        const client = message.client;
        if (message.author.bot) return;

        if (message.partial) {
            message.fetch()
                .then(async fullMessage => {
                    await setDoc(doc(db, `${message.author.id}/EventQuestProgression/Weekly/Week1`), { mission1: 101 }, { merge: true });
                })
                .catch(error => {
                    console.log('Something went wrong when fetching the message: ', error);
                });
        }
        else {
            const weeklyQuestsSnap = await getDocs(collection(db, '/Event'));
            const querySnapshot = await getDocs(collection(db, `/${message.author.id}/EventQuestProgression/Weekly`));

            weeklyQuestsSnap.forEach(async (docSnap) => {
                if (!docSnap.id.includes('QuestsWeek')) return;
                const week = docSnap.id.substring(6);

                if (!docSnap.data()?.quest1) return;
                for (let i = 1; i < 6; i++) {

                    const mission = docSnap.data()[`quest${i}`];
                    /* Quest Types:
                    1 = Send Message | DONE
                    2 = React with emoji to messages | DONE
                    3 = Send message with certain letter | DONE
                    4 = Completion quest | DONE
                    5 = Send message with certain content | DONE
                    6 = Custom mission */
                    switch (mission?.type) {
                        case 1:

                            querySnapshot.forEach(async (document) => {
                                if (document.id == 'Milestones' || document.id != week) return;
                                let current = document.data()[`mission${i}`];
                                const missionGoal = docSnap.data()[`quest${i}`].goal;
                                const quest = docSnap.data()[`quest${i}`];

                                if (current >= missionGoal) {
                                    console.log('Goal reached');
                                    await setDoc(doc(db, `${message.author.id}/EventQuestProgression/Weekly/${week}`), { [`mission${quest.position}`]: (missionGoal) }, { merge: true });
                                    return;
                                }
                                if (!current) { current = 0; }

                                if ((current + 1) >= missionGoal) {
                                    client.emit('questCompleted', mission, message, week);
                                    message.author.send('You have completed a quest!');
                                }

                                if ((current + 1) == Math.ceil((25 / 100) * missionGoal)) {
                                    const progressEmbed = new EmbedBuilder()
                                        .setTitle('You have made progress on a quest!')
                                        .setColor('#00FF06')
                                        .setDescription(`You have reached 25% on a quest. (${current + 1}/${missionGoal})`);

                                    message.author.send({ embeds: [progressEmbed] });
                                }
                                else if ((current + 1) == Math.ceil((50 / 100) * missionGoal)) {
                                    const progressEmbed = new EmbedBuilder()
                                        .setTitle('You have made progress on a quest!')
                                        .setColor('#00284A')
                                        .setDescription(`You have reached 50% on a quest. (${current + 1}/${missionGoal})`);

                                    message.author.send({ embeds: [progressEmbed] });
                                }
                                else if ((current + 1) == Math.ceil((75 / 100) * missionGoal)) {
                                    const progressEmbed = new EmbedBuilder()
                                        .setTitle('You have made progress on a quest!')
                                        .setColor('#0066BC')
                                        .setDescription(`You have reached 75% on a quest. (${current + 1}/${missionGoal})`);

                                    message.author.send({ embeds: [progressEmbed] });
                                }
                                console.log(current + 1, quest.position);
                                await setDoc(doc(db, `${message.author.id}/EventQuestProgression/Weekly/${week}`), { [`mission${quest.position}`]: (current + 1) }, { merge: true });
                            });
                            break;
                        // Quest Type 2 handler is in type2QuesHandler file

                        case 3:
                            querySnapshot.forEach(async (document) => {
                                if (document.id == 'Milestones' || document.id != week) return;

                                let current = document.data()[`mission${i}`];
                                if (!current) { current = 0; }
                                const missionGoal = docSnap.data()[`quest${i}`].goal;
                                const quest = docSnap.data()[`quest${i}`];

                                if (current == missionGoal) {
                                    await setDoc(doc(db, `${message.author.id}/EventQuestProgression/Weekly/${week}`), { [`mission${quest.position}`]: (missionGoal) }, { merge: true });
                                    return;
                                }

                                if (message.content.toLowerCase().includes(quest.targetLetter.toLowerCase())) {
                                    if ((current + 1) >= missionGoal) {
                                        message.author.send('You have completed a quest!');
                                    }

                                    if ((current + 1) == Math.ceil((25 / 100) * missionGoal)) {
                                        const progressEmbed = new EmbedBuilder()
                                            .setTitle('You have made progress on a quest!')
                                            .setColor('#00FF06')
                                            .setDescription(`You have reached 25% on a quest. (${current + 1}/${missionGoal})`);

                                        message.author.send({ embeds: [progressEmbed] });
                                    }
                                    else if ((current + 1) == Math.ceil((50 / 100) * missionGoal)) {
                                        const progressEmbed = new EmbedBuilder()
                                            .setTitle('You have made progress on a quest!')
                                            .setColor('#00284A')
                                            .setDescription(`You have reached 50% on a quest. (${current + 1}/${missionGoal})`);

                                        message.author.send({ embeds: [progressEmbed] });
                                    }
                                    else if ((current + 1) == Math.ceil((75 / 100) * missionGoal)) {
                                        const progressEmbed = new EmbedBuilder()
                                            .setTitle('You have made progress on a quest!')
                                            .setColor('#0066BC')
                                            .setDescription(`You have reached 75% on a quest. (${current + 1}/${missionGoal})`);

                                        message.author.send({ embeds: [progressEmbed] });
                                    }
                                    await setDoc(doc(db, `${message.author.id}/EventQuestProgression/Weekly/${week}`), { [`mission${quest.position}`]: (current + 1) }, { merge: true });
                                }
                            });
                            break;
                            // Type 4 handler is in completed quest event

                        case 5:
                            querySnapshot.forEach(async document => {
                                if (document.id == 'Milestones' || document.id != week) return;

                                let current = document.data()[`mission${i}`];
                                if (!current) { current = 0; }
                                const missionGoal = docSnap.data()[`quest${i}`].goal;
                                const quest = docSnap.data()[`quest${i}`];

                                if (current >= missionGoal) {
                                    await setDoc(doc(db, `${message.author.id}/EventQuestProgression/Weekly/${week}`), { [`mission${quest.position}`]: (missionGoal) }, { merge: true });
                                    return;
                                }


                                const targetCount = [];
                                if (message.content.toLowerCase() == quest.targetContent[0].toLowerCase()) {
                                    for (const key of quest.targetContent) {
                                        targetCount.push(key);
                                    }

                                    targetCount[0] = 'passed';

                                    for (let index = 1; index < targetCount.length; index++) {
                                        const filter = m => m.content.toLowerCase().includes(quest.targetContent[index].toLowerCase());
                                        const collector = message.channel.createMessageCollector({ filter, time: 7000 });
                                        collector.on('collect', m => {
                                            console.log(`Collected ${m.content}`);
                                            targetCount[index] = 'passed';
                                        });

                                        collector.on('end', async collected => {
                                            console.log(`Collected ${collected.size} items`);
                                            const allEqual = arr => arr.every(v => v === arr[0]);
                                            if (allEqual(targetCount)) {
                                                if ((current + 1) >= missionGoal) {
                                                    message.author.send('You have completed a quest!');
                                                }

                                                if ((current + 1) == Math.ceil((25 / 100) * missionGoal)) {
                                                    const progressEmbed = new EmbedBuilder()
                                                        .setTitle('You have made progress on a quest!')
                                                        .setColor('#00FF06')
                                                        .setDescription(`You have reached 25% on a quest. (${current + 1}/${missionGoal})`);

                                                    message.author.send({ embeds: [progressEmbed] });
                                                }
                                                else if ((current + 1) == Math.ceil((50 / 100) * missionGoal)) {
                                                    const progressEmbed = new EmbedBuilder()
                                                        .setTitle('You have made progress on a quest!')
                                                        .setColor('#00284A')
                                                        .setDescription(`You have reached 50% on a quest. (${current + 1}/${missionGoal})`);

                                                    message.author.send({ embeds: [progressEmbed] });
                                                }
                                                else if ((current + 1) == Math.ceil((75 / 100) * missionGoal)) {
                                                    const progressEmbed = new EmbedBuilder()
                                                        .setTitle('You have made progress on a quest!')
                                                        .setColor('#0066BC')
                                                        .setDescription(`You have reached 75% on a quest. (${current + 1}/${missionGoal})`);

                                                    message.author.send({ embeds: [progressEmbed] });
                                                }
                                                await setDoc(doc(db, `${message.author.id}/EventQuestProgression/Weekly/${week}`), { [`mission${quest.position}`]: (current + 1) }, { merge: true });
                                            }
                                        });
                                    }
                                }
                                // lmao yo await setDoc(doc(db, `${message.author.id}/EventQuestProgression/Weekly/${week}`), { [`mission${i}`]: (current + 1) }, { merge: true });
                            });
                            break;

                        case 6:
                            console.log(message.stickers.first().name);
                            break;

                        default:
                            break;
                    }

                }
            });
        }
    },
};