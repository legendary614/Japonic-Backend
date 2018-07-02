 /*
  * Basic configuration object
  */
 module.exports = {
  auth: {
       secret: 'my_secret_key',
       session_secret: "Japonic_api_secret"
    },
    smtpConfig: {
       // host: 'smtp.yandex.com',
       // port: 465,
       // secure: true, // use SSL
      service: 'gmail',
       auth: {
          user: 'japonicmail@gmail.com',
          pass: 'technical@123'
       }

    }
 };