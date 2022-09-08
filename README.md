# Authentication service
## Description

In this task I used minimal packages and libraries, to show that we have the basic understanding of the concepts of authentication and MQTT connections.
## Functionality

This is a basic authentication service has two main functionalities [Sign-up and login using email and username] using email verification style.

After registration this service produce a message to a mailer service through Kafka as an MQTT broker to send a verification email to the user contain a link to activate the user's account.

This link in the email should hit the activation end point in this service to activate the account and then send another message to the mailer service on another topic to send another welcoming email.

Now let's dive into the technical stuff.


## Dependencies
This application depends on mongodb as a datastore and Kafka as an MQTT broker, you can get these dependencies up and running using docker-comps, which is configured in the `docker-compose.yml`  file in the root of the application directory.

All the environment variables are needed should be added to the `.env` file in the root of the application directory, I added `.example.env` file which contains the variable that I used in my machine, I know it's not a good practice to do so in the real applications but I did this here to make it easy for the reviewer to quickly run the application to review.

The variables in `.example.env` file should works fine if you gonna use the docker compose file to run the dependencies and you can just copy that using the following command.


``` bash
  cp .example.env .env
```


> All  services are exposed to the localhost and you can access the DB using whatever DB client you preferrer.

> You can also access Kafka-Ui on port `8080`.

To install application's dependencies run

``` bash
npm install
```


Now let's find out how we can run the application.
## Running the app

To run the application directly on your machine.

This will make the application runs on `http://localhost:3000`

Or `SERVER_PORT` this environment variable that we can change the default port of the application.

```bash
# development
# watch mode
$ npm run start

$ npm run start:dev

# production mode
$ npm run start:prod
```

Also I added docker file to run the application on `node:alpine` image, in multi stage docker file one for dev and one for production.

## APIs

I added a post man collection for the APIs with example in the `docs/` directory that holds all the APIs that generated for this service.

Simply we have these four APIs here

### [GET] /ping  

This API just a health check it should return a 200 response if the application is up and running

### [POST] /users/create

This API for creating a new user it takes the following body as json payload to sign up a new user.

``` json
{
    "username": "tawfiek123",
    "firstName": "tawfiek",
    "lastName": "Khalaf",
    "email": "tawfiek123.108@gmail.com",
    "password": "password"
}
```

### [POST] /users/login

Login API this one takes the following json payload to authenticate the user into his account.

``` json
{
  "username": "tawfiek",
  "password": "passwords"
}
```

### [PUT] /users/activate/:uuid

This API that should be sent by the user to activate his account, by clicking the link in his email and it takes some UUID to Identify this user which should be send to the user on his email using the mailer service.

The mailer service repo can be found [here](https://github.com/tawfiek/nest-email-service).

> For more information please checkout `/docs/api.json` file in the application directory.
