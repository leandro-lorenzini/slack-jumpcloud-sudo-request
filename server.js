const express = require("express");
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const route = require("./src/route");
const jumpcloud = require("./src/jumpcloud");

const app = express();
const port = 3000;

// Protect application
const limiter = rateLimit({
	windowMs: 10 * 60 * 1000, // 10 minutes
	limit: 15, // Limit each IP to 10 requests per minute.
})
app.use(limiter)

// Needed for slack signing verification
app.use(
  express.urlencoded({
    extended: true,
    verify: (req, _, buf) => {
      req.rawBody = buf;
    },
  })
);

app.use("/", route);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Remove admin rights for admin requests older than 30 minutes
setInterval(() => {
  const thirtyMinutesAgo = Date.now() - (30 * 60 * 1000);
  jumpcloud.getAllSudoUsers().then(users => {
    for (let user of users) {
      for (let attr of user.attributes) {
        if (attr.name === "LastAdminRequest" && attr.value < thirtyMinutesAgo) {
          console.log(`Revoking sudo access from ${user.username}`);
          jumpcloud.updateUser(user._id, false);
        }
      }
    }
  }).catch(error => {
    console.log(error);
  });
}, 10000);
