# Чат приложение
## Курсова работа по основи на разработката на приложения в облачна среда

### Основна функционалност
Имплементира се publish-subscribe message patern-а. Всяко едно приложение комуникира с останалите. За да комуникира, има уеб сървър, който получава съобщения през уеб сокет. Използват се 0MQ сокети за комуникация между различните инстанции на приложението. Целта е динамична архитектура, затова се използа Servei Registry, което да пази наличните портове, на които "слушат" инстанциите. За администрирането му е създаено JSON базиран API. Освен Service Registry, има имплементиран History Service, който пази история на съобщенията. Понеже 0MQ имплементират send and forget pattern-a, History Service-ът трябва да бъде Durable Subscriber. За целта е импламентирана опашка с Redis(Redis не поддържа Durable Subscriber pattern-а в неговата имплементация на Publish-subscribe, но се постига с комбинация от команди.).

### Използвани технологии
 - Основна сървърна технология - Node.js;
 - key-value store - Level DB;
 - Web Socket и web страница за клиент на приложението;
 - 0MQ библиотека за комуникация между процеси;
 - Redis и RedisSMQ за Message Queue;

### Инсталация
```npm install```

### npm пакети
 - express, body-parser - за уеб сървър;
 - ws - за уеб сокети, ecstatic middleware за статични файлове;
 - level, JSONStream, monotonic-timestamp за key-value store; 
 - request, request-promise, request-promise-native за изпращане на http заявки към Service Registry;
 - zeromq - wrapper върху C++ библиотеката;
 - redis-smq - Message Queue върху Redis;