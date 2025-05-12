const amqp = require('amqplib');
const CommunicationLog = require('./modals/communicationLog');
let channel, connection;

const connectRabbitMQ = async () => {
  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertQueue('email_campaign_queue');
    console.log(' Connected to RabbitMQ');

     connection.on('error', (err) => {
      console.error(' RabbitMQ error:', err.message);
    });

    connection.on('close', () => {
      console.warn('🔁 RabbitMQ connection closed. Reconnecting...');
      setTimeout(connectRabbitMQ, 5000); 
    });
    startConsumer();
  } catch (err) {
    console.error(' RabbitMQ connection failed:', err);
  }
};

const sendToQueue = async (queueName, data) => {
  if (!channel) {
    throw new Error('RabbitMQ channel not initialized.');
  }
  await channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)));
  console.log(`✉️ Sent message to queue: ${queueName}`);
};

const startConsumer = async () => {
  channel.consume('email_campaign_queue', async (msg) => {
    if (!msg) return;
    
    try {
      const payload = JSON.parse(msg.content.toString());
     
      const isSuccess = Math.random() < 0.9;
      const status = isSuccess ? 'SENT' : 'FAILED';
      
      console.log(` Processing email for ${payload.email}: ${status}`);
      
   
      await CommunicationLog.updateOne(
        { campaignId: payload.campaignId, customerId: payload.customerId },
        { 
          $set: { 
            status: status,
            sentAt: new Date()
          }
        }
      );
      
      channel.ack(msg);
      
      console.log(` Updated communication log for customer ${payload.customerId} in campaign ${payload.campaignId} with status: ${status}`);
    } catch (error) {
      console.error(' Error processing message:', error);
      channel.nack(msg, false, true);
    }
  });
  
  console.log(' Listening to queue: email_campaign_queue');
};

process.on('SIGINT', async () => {
  try {
    await channel.close();
    await connection.close();
    console.log('🛑 RabbitMQ connection closed');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error closing RabbitMQ connection:', err);
    process.exit(1);
  }
});

module.exports = {
  connectRabbitMQ,
  sendToQueue
};