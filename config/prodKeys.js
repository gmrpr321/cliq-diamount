// module.exports = {
//   CLIQ_APP_PUBLIC_KEY:
//     "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAoDcmmYbxPG6oYjgrZcQXUFnFFaqI/3Gc+FMh/KpXay8FfuzkrpjPVzNHbZwk4ldlVdR+J7mxomRM6/HSu+g0SRPtPVaMpVDYnIYhvaMaI8x0+h8AsJfmJ2Q7YAEQz8SIrj4Igfk3LTwmPzldYrRWNg8jjOSZ+0ADAk/SNMou9YO7BpT6mm4JJdSkQ2tIk9dUDqq3cCYTbPkdkGcrmC19fnBmzuwVyNtP1q3iB9Og62tsTcFABodZD/KOv4QVLrjPeYkZskDIgVMQTwfnCvgwUqNLk0chzMS6IIaLi44UfQzXMwHda5jd9KMs7adIjTyOFdfGuxO7v3gi5ST1adwakwIDAQAB",
//   CLIQ_APP_KEY: "sbx-NTA0OS0yZjk0ZDE1NC1mNDg5LTQ4OGQtYmJlMC1iMzdmNjRlNGViNjM=",
//   MONGODB_URI:
//     "mongodb+srv://pradeepsn606:Lqa2vn7G0NBzWrNG@cluster0.3iho36y.mongodb.net/?retryWrites=true&w=majority",
// };
module.exports = {
  CLIQ_APP_PUBLIC_KEY: process.env.CLIQ_APP_PUBLIC_KEY,
  CLIQ_APP_KEY: process.env.CLIQ_APP_KEY,
  MONGODB_URI: process.env.MONGODB_URI,
};
