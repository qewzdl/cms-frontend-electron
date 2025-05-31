export class Config {
  static baseUrl = 'http://109.172.39.156:8000';
  static apiBaseUrl = Config.baseUrl + '/api/v1';

  static endpoints = {
    refreshToken: '/authorization/refresh',
    authorization: '/authorization',
    chats: '/chats',
    messages: `/chats/messages`,
    send: `/chats/messages/send`,
  };

  static stopWords = [
    /\b\d{11}\b/g,
    /\+\d{11,13}/g,
    /\b\d{16}\b/g,
    /tme\/?[^\s]*/i,
    /мойтелеграм/i,
    /мойтг/i,
    /вкком/i,
    /vkcom\/?[^\s]*/i
  ];
}