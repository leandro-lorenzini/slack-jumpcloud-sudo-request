const express = require("express");
const slack = require("./slack");
const jumpcloud = require("./jumpcloud");

const router = express.Router();

const errorMessage = "Sorry, We could not process your request at this time.";

router.post("/setAdminAccess", slack.verify, async (req, res) => {
  const { user_name } = req.body;
  if (!user_name) {
    console.log('Received request without username parameter');
    return res.status(200).send(errorMessage);
  }

  res
    .status(200)
    .send(`Processing your request for admin rights, please wait.`);

  try {
    const userData = await jumpcloud.getSystemUserByUsername(user_name);
    if (!userData || !userData.results || userData.results.length === 0) {
      slack.reply(req.body.response_url, "Username could not be found, your slack username does not match with a valid JumpCloud user");
      return;
    }

    const userId = userData.results[0]._id;

    jumpcloud.updateUser(userId, true);
    slack.reply(
      req.body.response_url,
      "Admin access granted for a period of 30 minutes.\nRemember: with great power comes great responsibility."
    );
    return;
  } catch (error) {
    console.error(error);
    slack.reply(req.body.response_url, errorMessage);
  }
});

module.exports = router;