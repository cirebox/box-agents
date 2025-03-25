// src/shared/providers/rabbitmq/rabbitmq.service.ts
import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqplib from 'amqplib';

// Interface personalizada para corresponder à implementação real do amqplib
interface AmqpConnection {
  createChannel(): Promise<AmqpChannel>;
  close(): Promise<void>;
  on(event: string, listener: (...args: any[]) => void): unknown;
}

interface AmqpChannel {
  assertQueue(
    queue: string,
    options?: amqplib.Options.AssertQueue,
  ): Promise<amqplib.Replies.AssertQueue>;
  assertExchange(
    exchange: string,
    type: string,
    options?: amqplib.Options.AssertExchange,
  ): Promise<amqplib.Replies.AssertExchange>;
  bindQueue(
    queue: string,
    source: string,
    pattern: string,
    args?: any,
  ): Promise<amqplib.Replies.Empty>;
  consume(
    queue: string,
    onMessage: (msg: amqplib.ConsumeMessage | null) => void,
    options?: amqplib.Options.Consume,
  ): Promise<amqplib.Replies.Consume>;
  sendToQueue(
    queue: string,
    content: Buffer,
    options?: amqplib.Options.Publish,
  ): boolean;
  publish(
    exchange: string,
    routingKey: string,
    content: Buffer,
    options?: amqplib.Options.Publish,
  ): boolean;
  ack(message: amqplib.ConsumeMessage, allUpTo?: boolean): void;
  nack(
    message: amqplib.ConsumeMessage,
    allUpTo?: boolean,
    requeue?: boolean,
  ): void;
  close(): Promise<void>;
}

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private connection: AmqpConnection | null = null;
  private channel: AmqpChannel | null = null;
  private readonly logger = new Logger(RabbitMQService.name);

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  async connect(): Promise<AmqpConnection | null> {
    try {
      const url = this.configService.get<string>('RABBITMQ_URL');
      if (!url) {
        throw new Error('RABBITMQ_URL environment variable is not defined');
      }

      this.logger.log(`Connecting to RabbitMQ server at ${url}`);

      this.connection = (await amqplib.connect(
        url,
      )) as unknown as AmqpConnection;
      if (this.connection) {
        this.channel = await this.connection.createChannel();

        this.logger.log('Successfully connected to RabbitMQ');

        // Setup connection event handlers
        this.connection.on('error', (err) => {
          this.logger.error(`RabbitMQ connection error: ${err.message}`);
          this.reconnect();
        });

        this.connection.on('close', () => {
          this.logger.warn(
            'RabbitMQ connection closed, attempting to reconnect...',
          );
          this.reconnect();
        });
      }

      return this.connection;
    } catch (error) {
      this.logger.error(
        `Failed to connect to RabbitMQ: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      // Implement retry with exponential backoff
      setTimeout(() => this.reconnect(), 5000);
      return null;
    }
  }

  private async reconnect() {
    try {
      if (this.channel) {
        await this.channel.close();
        this.channel = null;
      }
      if (this.connection) {
        await this.connection.close();
        this.connection = null;
      }
    } catch (error) {
      this.logger.error(
        `Error during cleanup before reconnect: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }

    try {
      await this.connect();
    } catch (error) {
      this.logger.error(
        `Failed to reconnect: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      setTimeout(() => this.reconnect(), 5000);
    }
  }

  async disconnect() {
    try {
      if (this.channel) {
        await this.channel.close();
        this.channel = null;
      }
      if (this.connection) {
        await this.connection.close();
        this.connection = null;
      }
      this.logger.log('Disconnected from RabbitMQ');
    } catch (error) {
      this.logger.error(
        `Error disconnecting from RabbitMQ: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async createQueue(
    queueName: string,
    options: amqplib.Options.AssertQueue = { durable: true },
  ) {
    try {
      if (!this.channel) {
        await this.connect();
      }
      if (!this.channel) {
        throw new Error('Failed to create RabbitMQ channel');
      }

      await this.channel.assertQueue(queueName, options);
      this.logger.log(`Queue ${queueName} created or asserted`);
    } catch (error) {
      this.logger.error(
        `Error creating queue ${queueName}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  async sendToQueue(
    queueName: string,
    message: any,
    options: amqplib.Options.Publish = {},
  ): Promise<boolean> {
    try {
      if (!this.channel) {
        await this.connect();
      }
      if (!this.channel) {
        throw new Error('Failed to create RabbitMQ channel');
      }

      // Ensure queue exists
      await this.createQueue(queueName);

      const messageBuffer = Buffer.from(JSON.stringify(message));
      const result = this.channel.sendToQueue(queueName, messageBuffer, {
        persistent: true,
        ...options,
      });

      this.logger.log(`Message sent to queue ${queueName}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Error sending message to queue ${queueName}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  async consume(
    queueName: string,
    callback: (msg: amqplib.ConsumeMessage | null) => void,
    options: amqplib.Options.Consume = {},
  ) {
    try {
      if (!this.channel) {
        await this.connect();
      }
      if (!this.channel) {
        throw new Error('Failed to create RabbitMQ channel');
      }

      // Ensure queue exists
      await this.createQueue(queueName);

      await this.channel.consume(queueName, callback, {
        noAck: false,
        ...options,
      });

      this.logger.log(`Consumer registered for queue ${queueName}`);
    } catch (error) {
      this.logger.error(
        `Error consuming from queue ${queueName}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  async ack(message: amqplib.ConsumeMessage) {
    if (this.channel) {
      this.channel.ack(message);
    }
  }

  async nack(message: amqplib.ConsumeMessage, requeue = true) {
    if (this.channel) {
      this.channel.nack(message, false, requeue);
    }
  }

  async createExchange(
    exchangeName: string,
    type: string,
    options: amqplib.Options.AssertExchange = { durable: true },
  ) {
    try {
      if (!this.channel) {
        await this.connect();
      }
      if (!this.channel) {
        throw new Error('Failed to create RabbitMQ channel');
      }

      await this.channel.assertExchange(exchangeName, type, options);
      this.logger.log(`Exchange ${exchangeName} created or asserted`);
    } catch (error) {
      this.logger.error(
        `Error creating exchange ${exchangeName}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  async publishToExchange(
    exchangeName: string,
    routingKey: string,
    message: any,
    options: amqplib.Options.Publish = {},
  ): Promise<boolean> {
    try {
      if (!this.channel) {
        await this.connect();
      }
      if (!this.channel) {
        throw new Error('Failed to create RabbitMQ channel');
      }

      const messageBuffer = Buffer.from(JSON.stringify(message));
      const result = this.channel.publish(
        exchangeName,
        routingKey,
        messageBuffer,
        {
          persistent: true,
          ...options,
        },
      );

      this.logger.log(
        `Message published to exchange ${exchangeName} with routing key ${routingKey}`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Error publishing message to exchange ${exchangeName}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  async bindQueue(queueName: string, exchangeName: string, routingKey: string) {
    try {
      if (!this.channel) {
        await this.connect();
      }
      if (!this.channel) {
        throw new Error('Failed to create RabbitMQ channel');
      }

      await this.channel.bindQueue(queueName, exchangeName, routingKey);
      this.logger.log(
        `Queue ${queueName} bound to exchange ${exchangeName} with routing key ${routingKey}`,
      );
    } catch (error) {
      this.logger.error(
        `Error binding queue ${queueName} to exchange ${exchangeName}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  getChannel(): AmqpChannel | null {
    return this.channel;
  }
}
