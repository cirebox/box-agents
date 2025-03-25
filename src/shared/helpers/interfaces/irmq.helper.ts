// src/shared/helpers/interfaces/irmq.helper.ts
import * as amqplib from 'amqplib';

export interface IRabbitMQHelper {
  /**
   * Envia uma mensagem para uma fila específica
   * @param queueName Nome da fila
   * @param message Mensagem a ser enviada
   * @param options Opções de publicação
   */
  sendToQueue(
    queueName: string,
    message: any,
    options?: amqplib.Options.Publish,
  ): Promise<boolean>;

  /**
   * Publica uma mensagem em uma exchange
   * @param exchangeName Nome da exchange
   * @param routingKey Chave de roteamento
   * @param message Mensagem a ser publicada
   * @param options Opções de publicação
   */
  publishToExchange(
    exchangeName: string,
    routingKey: string,
    message: any,
    options?: amqplib.Options.Publish,
  ): Promise<boolean>;

  /**
   * Cria uma fila se ela não existir
   * @param queueName Nome da fila
   * @param options Opções de criação da fila
   */
  createQueue(
    queueName: string,
    options?: amqplib.Options.AssertQueue,
  ): Promise<void>;

  /**
   * Cria uma exchange se ela não existir
   * @param exchangeName Nome da exchange
   * @param type Tipo da exchange (direct, topic, fanout, headers)
   * @param options Opções de criação da exchange
   */
  createExchange(
    exchangeName: string,
    type: string,
    options?: amqplib.Options.AssertExchange,
  ): Promise<void>;

  /**
   * Liga uma fila a uma exchange
   * @param queueName Nome da fila
   * @param exchangeName Nome da exchange
   * @param routingKey Chave de roteamento
   */
  bindQueue(
    queueName: string,
    exchangeName: string,
    routingKey: string,
  ): Promise<void>;

  /**
   * Consome mensagens de uma fila
   * @param queueName Nome da fila
   * @param callback Função de callback para processar as mensagens
   * @param options Opções de consumo
   */
  consume(
    queueName: string,
    callback: (msg: amqplib.ConsumeMessage | null) => void,
    options?: amqplib.Options.Consume,
  ): Promise<void>;

  /**
   * Confirma o processamento de uma mensagem
   * @param message Mensagem a ser confirmada
   */
  ack(message: amqplib.ConsumeMessage): Promise<void>;

  /**
   * Rejeita uma mensagem
   * @param message Mensagem a ser rejeitada
   * @param requeue Indica se a mensagem deve voltar para a fila
   */
  nack(message: amqplib.ConsumeMessage, requeue?: boolean): Promise<void>;

  /**
   * Formata um nome de fila seguindo padrões do sistema
   * @param baseName Nome base da fila
   * @param suffix Sufixo opcional
   */
  formatQueueName(baseName: string, suffix?: string): string;

  /**
   * Retorna o canal RabbitMQ para operações avançadas
   */
  getChannel(): any;
}
