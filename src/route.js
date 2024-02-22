const express = require("express");
const slack = require("./slack");
const jumpcloud = require("./jumpcloud");

const router = express.Router();

const errorMessage = "Sorry, We could not process your request at this time.";

// Called by slack command to request for admin access
router.post("/requestAdminAccess", slack.verify, async (req, res) => {
  const { user_id, user_name, text } = req.body;
  
  if (!user_name) {
    console.log("Received request without username parameter");
    return res.status(200).send(errorMessage);
  }

  if (!text) {
    res.send(
      "You didn't provide the reason why you need admin access.\nExample: /admin Reason for admin access request..."
    );
    return;
  }

  res
    .status(200)
    .send("Request has been sent. We'll notify you when an admin accepts/rejects your request.");

  try {
    const userData = await jumpcloud.getSystemUserByUsername(user_name);
    if (!userData || !userData.results || userData.results.length === 0) {
      slack.reply(
        req.body.response_url,
        "Username could not be found, your slack username does not match with a valid JumpCloud user"
      );
      return;
    }
    const userId = userData.results[0]._id;
    await slack.requestApproval(user_name, text);
    jumpcloud.setSlackUserId(userId, user_id);
    return;
  } catch (error) {
    console.error(error);
    slack.reply(req.body.response_url, errorMessage);
  }
});

// Called by slack action to approve/deny admin access
router.post("/setAdminAccess", slack.verify, async (req, res) => {
  const payload = JSON.parse(req.body.payload);
  const user_name = payload.actions[0].value;
  for (let attr of userData.results[0].attributes) {
    if (attr.name === "slackUserId") {
      const slackUserId = attr.value;
    }
  }

  if (!user_name) {
    console.log("Received request without username parameter");
    return res.status(200).send(errorMessage);
  }

  if (!slackUserId) {
    console.log("Could not find Slack User Id");
    return res.status(200).send(errorMessage);
  }

  try {
    const userData = await jumpcloud.getSystemUserByUsername(user_name);
    if (!userData || !userData.results || userData.results.length === 0) {
      slack.reply(
        req.body.response_url,
        "Username could not be found, or the user's slack username does not match with a valid JumpCloud user"
      );
      return;
    }
    
    const userId = userData.results[0]._id;
    if (payload.actions[0].action_id === "allow") {
      jumpcloud.updateUser(userId, true, slackUserId);
      slack.reply(
        payload.response_url,
        `<@${payload.user.username}> has granted admin access to devices assigned to *${user_name}* for a period of 30 minutes.`
      );

      slack.postMessage(
        slackUserId,
        `Admin access to your device(s) has been granted by <@${payload.user.username}> for 30 minutes.`
      );
    } else {
      jumpcloud.updateUser(userId, false, slackUserId);
      slack.reply(
        payload.response_url,
        `<${payload.user.username}> has denied admin access to <@${user_name}> on his/her device(s)`
      );

      slack.postMessage(
        slackUserId,
        `<@${payload.user.username}> has denied admin access to your devices.`
      );
    }
    return;
  } catch (error) {
    console.error(error);
    slack.reply(req.body.response_url, errorMessage);
  }
});

module.exports = router;
