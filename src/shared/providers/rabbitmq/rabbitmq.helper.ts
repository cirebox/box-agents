// src/shared/providers/rabbitmq/rabbitmq.helper.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqplib from 'amqplib';
import { IRabbitMQHelper } from '../../helpers/interfaces/irmq.helper';
import { RabbitMQService } from './rabbitmq.service';

@Injectable()
export class RabbitMQHelper implements IRabbitMQHelper {
  private readonly logger = new Logger(RabbitMQHelper.name);
  private readonly environment: string;

  constructor(
    private rabbitmqService: RabbitMQService,
    private configService: ConfigService,
  ) {
    this.environment =
      this.configService.get<string>('NODE_ENV') || 'development';
  }

  async sendToQueue(
    queueName: string,
    message: any,
    options?: amqplib.Options.Publish,
  ): Promise<boolean> {
    const formattedQueueName = this.formatQueueName(queueName);
    this.logger.debug(`Sending message to queue ${formattedQueueName}`);
    return this.rabbitmqService.sendToQueue(
      formattedQueueName,
      message,
      options,
    );
  }

  async publishToExchange(
    exchangeName: string,
    routingKey: string,
    message: any,
    options?: amqplib.Options.Publish,
  ): Promise<boolean> {
    const formattedExchangeName = this.formatQueueName(exchangeName);
    this.logger.debug(
      `Publishing message to exchange ${formattedExchangeName} with routing key ${routingKey}`,
    );
    return this.rabbitmqService.publishToExchange(
      formattedExchangeName,
      routingKey,
      message,
      options,
    );
  }

  async createQueue(
    queueName: string,
    options?: amqplib.Options.AssertQueue,
  ): Promise<void> {
    const formattedQueueName = this.formatQueueName(queueName);
    this.logger.debug(`Creating queue ${formattedQueueName}`);
    await this.rabbitmqService.createQueue(formattedQueueName, options);
  }

  async createExchange(
    exchangeName: string,
    type: string,
    options?: amqplib.Options.AssertExchange,
  ): Promise<void> {
    const formattedExchangeName = this.formatQueueName(exchangeName);
    this.logger.debug(
      `Creating exchange ${formattedExchangeName} of type ${type}`,
    );
    await this.rabbitmqService.createExchange(
      formattedExchangeName,
      type,
      options,
    );
  }

  async bindQueue(
    queueName: string,
    exchangeName: string,
    routingKey: string,
  ): Promise<void> {
    const formattedQueueName = this.formatQueueName(queueName);
    const formattedExchangeName = this.formatQueueName(exchangeName);
    this.logger.debug(
      `Binding queue ${formattedQueueName} to exchange ${formattedExchangeName} with routing key ${routingKey}`,
    );
    await this.rabbitmqService.bindQueue(
      formattedQueueName,
      formattedExchangeName,
      routingKey,
    );
  }

  async consume(
    queueName: string,
    callback: (msg: amqplib.ConsumeMessage | null) => void,
    options?: amqplib.Options.Consume,
  ): Promise<void> {
    const formattedQueueName = this.formatQueueName(queueName);
    this.logger.debug(`Setting up consumer for queue ${formattedQueueName}`);
    await this.rabbitmqService.consume(formattedQueueName, callback, options);
  }

  async ack(message: amqplib.ConsumeMessage): Promise<void> {
    await this.rabbitmqService.ack(message);
  }

  async nack(message: amqplib.ConsumeMessage, requeue = true): Promise<void> {
    await this.rabbitmqService.nack(message, requeue);
  }

  formatQueueName(baseName: string, suffix?: string): string {
    // Formato: aplicação.ambiente.baseName.suffix
    let queueName = `ai_agents.${this.environment}.${baseName}`;

    if (suffix) {
      queueName += `.${suffix}`;
    }

    return queueName.toLowerCase();
  }

  getChannel(): any {
    return this.rabbitmqService.getChannel();
  }
}
