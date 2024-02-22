const axios = require("axios");

// Function to get system user by username
const getSystemUserByUsername = async (username) => {
  try {
    const response = await axios.get(
      `https://console.jumpcloud.com/api/systemusers?filter=username:eq:${username}`,
      {
        headers: {
          "x-api-key": process.env.JUMPCLOUD_API_KEY,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};

// Function to get system user by username
const getAllSudoUsers = async () => {
  try {
    const response = await axios.get(
      `https://console.jumpcloud.com/api/systemusers?filter=sudo:eq:true`,
      {
        headers: {
          "x-api-key": process.env.JUMPCLOUD_API_KEY,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );
    return response.data && response.data.results ?
      response.data.results : [];
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};

// Function updates a user Global Administrator settings
const updateUser = async (userId, admin, slackUserId) => {
  try {
    const response = await axios.put(
      `https://console.jumpcloud.com/api/systemusers/${userId}`,
      {
        sudo: admin,
        attributes: [
          {
            name: "LastAdminRequest",
            value: Date.now(),
          },
          {
            name: "slackUserId",
            value: slackUserId,
          }
        ],
      },
      {
        headers: {
          "x-api-key": process.env.JUMPCLOUD_API_KEY,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

// Function updates a the user attributes setSlackUserId
const setSlackUserId = async (userId, slackUserId) => {
  try {
    const response = await axios.put(
      `https://console.jumpcloud.com/api/systemusers/${userId}`,
      {
        attributes: [
          {
            name: "slackUserId",
            value: slackUserId,
          },
        ],
      },
      {
        headers: {
          "x-api-key": process.env.JUMPCLOUD_API_KEY,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

module.exports = { getSystemUserByUsername, updateUser, getAllSudoUsers, setSlackUserId };
