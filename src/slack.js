const crypto = require("crypto");
const axios = require("axios");

const errorMessage = "Sorry, We could not process your request at this time.";

function verify(req, res, next) {
  console.log(`Received request to grant admin access to ${req.body.user_name}.`);
  // verify that the timestamp does not differ from local time by more than five minutes
  if (
    !req.headers["x-slack-request-timestamp"] ||
    Math.abs(
      Math.floor(new Date().getTime() / 1000) -
        +req.headers["x-slack-request-timestamp"]
    ) > 300
  ) {
    console.log(`Request for user ${req.body.user_name} is too old!`);
    return res.send(errorMessage);
  }

  // compute the basestring
  const baseStr = `v0:${req.headers["x-slack-request-timestamp"]}:${req.rawBody}`;

  // extract the received signature from the request headers
  const receivedSignature = req.headers["x-slack-signature"];

  // compute the signature using the basestring
  // and hashing it using the signing secret
  // which can be stored as a environment variable
  const expectedSignature = `v0=${crypto
    .createHmac("sha256", process.env.SLACK_SIGNING_SECRET)
    .update(baseStr, "utf8")
    .digest("hex")}`;

  // match the two signatures
  if (expectedSignature !== receivedSignature) {
    console.log(`Could not verify the request for ${req.body.user_name}`);
    return res.send(errorMessage);
  }
  next();
}

async function reply(responseUrl, message) {
  responseUrl = decodeURIComponent(responseUrl);
  // Prepare the message you want to send back
  const messagePayload = {
    text: message,
  };

  // Use axios to POST the message to the response_url
  try {
    await axios.post(responseUrl, messagePayload);
    console.log(`Confirmation message sent to ${req.body.user_name}`);
  } catch (error) {
    console.error(`Error sending message to ${req.body.user_name}: `, error);
  }
}

module.exports = { verify, reply };
