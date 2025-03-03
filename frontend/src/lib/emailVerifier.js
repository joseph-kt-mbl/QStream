import axios from "axios";

const API_KEY = "54e8019494240f55647f0d5368bd0651057521bc"; // Replace with your actual API key
const BASE_URL = "https://api.hunter.io/v2/email-verifier";

export const verifyEmail = async (email) => {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        email,
        api_key: API_KEY,
      },
    });

    const data = response.data;

    if (data?.data?.score > 50 && !data?.data?.gibberish ) {
      return {
        status: "active",
        details: data.data,
      };
    } else {
      return {
        status: "inactive",
        details: data.data,
      };
    }
  } catch (error) {
    console.error("Error verifying email:", error.message);
    throw new Error("Failed to verify email. Please try again.");
  }
};
