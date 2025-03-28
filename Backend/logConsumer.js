//This script listens to movieLogQueue, processes messages, and writes them to movieLogs.txt.

const amqp = require('amqplib');
const fs = require('fs');

const RABBITMQ_URL = 'amqp://localhost';
const QUEUE_NAME = 'movieLogQueue';

async function startConsumer() {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();
        await channel.assertQueue(QUEUE_NAME, { durable: true });

        console.log(" [*] Waiting for messages. To exit press CTRL+C");

        channel.consume(QUEUE_NAME, (msg) => {
            if (msg !== null) {
                const logEntry = JSON.parse(msg.content.toString());
                console.log(" [x] Received", logEntry);

                const logMessage = `[${new Date().toISOString()}] ${logEntry.action} Movie: ${logEntry.movie.title} by ${logEntry.movie.director}\n`;

                fs.appendFileSync('movieLogs.txt', logMessage);
                console.log(" [x] Logged to movieLogs.txt");

                channel.ack(msg);
            }
        });
    } catch (error) {
        console.error("RabbitMQ Consumer Error:", error);
    }
}

startConsumer();
