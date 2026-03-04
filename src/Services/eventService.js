import axios from "axios";

const AUTH_TOKEN = import.meta.env.VITE_EVENTBRITE_TOKEN;

export const fetchGfcEvents = async () => {
  try {
    const orgRes = await axios.get(`https://www.eventbriteapi.com/v3/users/me/organizations/?token=${AUTH_TOKEN}`);
    const orgId = orgRes.data.organizations[0].id;

    const eventRes = await axios.get(`https://www.eventbriteapi.com/v3/organizations/${orgId}/events/?token=${AUTH_TOKEN}`);
    
    // Always return an array to keep the Frontend safe
    return eventRes.data.events || [];
  } catch (error) {
    console.error("GFC Service Error:", error);
    return []; // Return empty array so .filter() doesn't crash the UI
  }
};