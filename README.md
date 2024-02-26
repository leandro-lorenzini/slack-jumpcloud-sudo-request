## Slack Command - JumpCloud Sudo Request
Responds to a slack command "eg. /admin" to grant users admin/sudo rights for 30 minutes to their devices if a member of a specified private channel approves it.

### How to use it
#### Slack setup
- Create a Slack App
- Create a new command under the app with the following parameters:
    - Command: /admin (You can use any name you want)
    - Request URL: http://YourServerAddress/requestAdminAccess
    - Description: Request temporary admin access to your computer.
- Create a new Interactivity under the app with the following parameters:
    - Request URL: http://YourServerAddress/setAdminAccess

#### Server setup
A docker-compose.yml file is provided in this project, you can use that file to deploy it or use other tools to run the node.js application.
The following environment variables are necessary:
- **JUMPCLOUD_API_KEY**: Found under the jumpcloud admin UI.
- **SLACK_SIGNING_SECRET**: Found under the Slack App information page.
- **SLACK_BOT_USER_TOKEN**: Found under the Slack App information page.
- **SLACK_ADMIN_CHANNEL**: The provate channel where requests will be sent for approval. (The slack app app must be a member of the channel).
