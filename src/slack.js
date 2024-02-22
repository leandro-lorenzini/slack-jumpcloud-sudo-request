const crypto = require("crypto");
const axios = require("axios");

const errorMessage = "Sorry, We could not process your request at this time.";

// Verify is incoming Slack request is valid
function verify(req, res, next) {
  // verify that the timestamp does not differ from local time by more than five minutes
  if (
    !req.headers["x-slack-request-timestamp"] ||
    Math.abs(
      Math.floor(new Date().getTime() / 1000) -
        +req.headers["x-slack-request-timestamp"]
    ) > 300
  ) {
    console.log(`Request is too old!`);
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
    console.log(`Could not verify the request`);
    return res.send(errorMessage);
  }
  next();
}
// Replies to an icoming Slack message
async function reply(responseUrl, message) {
  responseUrl = decodeURIComponent(responseUrl);
  // Prepare the message you want to send back
  const messagePayload = {
    text: message,
  };

  // Use axios to POST the message to the response_url
  try {
    await axios.post(responseUrl, messagePayload);
  } catch (error) {
    console.error(`Error sending message back to user: `, error);
  }
}
// Send a direct message to the end user.
async function postMessage(userId, message) {
  // open convo
  const channel = await openConversation(userId);
  // Prepare the message you want to send back
  const messagePayload = {
    channel: channel,
    text: message,
  };

  // Use axios to POST the message to the response_url
  try {
    let response = await axios.post(
      "https://slack.com/api/chat.postMessage",
      messagePayload,
      {
        headers: {
          Authorization: `Bearer ${process.env.SLACK_BOT_USER_TOKEN}`,
        },
      }
    );
    console.log(response);
  } catch (error) {
    console.error(`Error sending message back to user: `, error);
  }
}
// Creates a new conversation in between the App and the end user. (Required by PostMessage)
async function openConversation(userId) {
  // Prepare the message you want to send back
  const messagePayload = {
    users: userId,
  };

  // Use axios to POST the message to the response_url
  try {
    let response = await axios.post(
      "https://slack.com/api/conversations.open",
      messagePayload,
      {
        headers: {
          Authorization: `Bearer ${process.env.SLACK_BOT_USER_TOKEN}`,
        },
      }
    );
    return response.data.channel.id;
  } catch (error) {
    console.error(`Error sending message back to user: `, error);
  }
}
// Notifies channel that a user has requested for admin access
async function requestApproval(username, reason) {
  // Prepare the message you want to send back
  const messagePayload = {
    channel: process.env.SLACK_ADMIN_CHANNEL,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `@${username} requested laptop admin access for 30 minutes. *Reason*: ${reason}`,
        },
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            value: username,
            action_id: "allow",
            style: "primary",
            text: {
              type: "plain_text",
              text: "Allow",
              emoji: true,
            },
          },
          {
            type: "button",
            value: username,
            action_id: "deny",
            style: "danger",
            text: {
              type: "plain_text",
              text: "Deny",
              emoji: true,
            },
          },
        ],
      },
    ],
  };

  try {
    let response = await axios.post(
      "https://slack.com/api/chat.postMessage",
      messagePayload,
      {
        headers: {
          Authorization: `Bearer ${process.env.SLACK_BOT_USER_TOKEN}`,
        },
      }
    );
    return response.data?.ts || false;
  } catch (error) {
    console.error(`Error sending message back to user: `, error);
    return false;
  }
}

module.exports = { verify, reply, postMessage, requestApproval };
