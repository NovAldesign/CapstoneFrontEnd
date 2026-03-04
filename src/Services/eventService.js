import axios from "axios";

const AUTH_TOKEN = import.meta.env.VITE_EVENTBRITE_TOKEN;

export const fetchGfcEvents = async () => {
  try {
    // 1. Get Organization ID (Axios automatically parses JSON)
    const orgRes = await axios.get(`https://www.eventbriteapi.com/v3/users/me/organizations/?token=${AUTH_TOKEN}`);
    
    if (!orgRes.data.organizations || orgRes.data.organizations.length === 0) {
      throw new Error("No organizations found.");
    }

    const orgId = orgRes.data.organizations[0].id;

    // 2. Get Events for that Org
    const eventRes = await axios.get(`https://www.eventbriteapi.com/v3/organizations/${orgId}/events/?token=${AUTH_TOKEN}`);

    return eventRes.data.events || [];
  } catch (err) {
    console.error("GFC Event Service Error:", err);
    throw err;
  }
};