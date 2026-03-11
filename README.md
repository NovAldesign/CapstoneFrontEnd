Frontend README (CapstoneFrontEnd)
The Grown Folks Collective | Frontend Portal
A premium React-based membership platform dedicated to bridging the gap in professional social connection.

🌟 Project Vision
The Grown Folks Collective is a response to the growing challenge of professional social isolation. This portal serves as the digital hub for a community that prioritizes intentional, alcohol-free social experiences and authentic interpersonal networking for the 35+ demographic.

🔌 Eventbrite Integration
The Events Page utilizes a high-performance integration with the Eventbrite API to provide real-time community updates:

Dynamic Fetching: Uses a Private Token (VITE_EVENTBRITE_TOKEN) for secure authentication.

Two-Step Flow: Automatically retrieves the Organization ID before querying the /v3/organizations/ endpoint for event data.

Categorization: Custom logic filters the data to display both Upcoming Events and Past Experiences (Game Nights, Dinners, Golf) to showcase community history.

📂 Portal Architecture
Home: Vision statement focusing on social wellness.

Events: Real-time data sync with Eventbrite for seamless RSVP management.

Membership & Partnership Intake: Secure application gateways for individuals and organizations.

Admin Dashboard: 🔒 Protected Suite for managing collective growth and approval workflows.

Login: Unified secure entry point using JWT and RBAC.

🛠️ Tech Stack
Framework: React.js (Vite)

API Integration: Eventbrite API (REST)

Authentication: JWT (JSON Web Tokens) with LocalStorage persistence.

Styling: Custom CSS3 (Navy & Gold Executive Theme).

🔗 Project Links
Backend Repository: https://github.com/NovAldesign/CapstoneBackEnd

ClickUp Project Management https://sharing.clickup.com/9014876050/l/h/6-901413868218-1/f0876eea91c3c06
I used this app to help keep the flow of all the tasks needed to complete my Capstone.

Future Updates: 
I will add the membership and partnership portal, I will remove the Eventbrite API and replace it with Stripe API and customize the events. I will also link membership portal to events, so people can purchase their event tickets in the portal. 