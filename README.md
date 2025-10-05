# **CCAPDEV Term 1, AY 2025 – 2026**

Machine Project – Project Specifications Document

**Groupings:****** At most 4 members in a group


**Online Airline Ticketing System**


# **Project Overview**

You  are  tasked  to  design  and  implement  an  **Online  Airline  Ticketing  System**. The system should allow passengers to search for flights, book tickets, select optional packages (meals, seat selection, baggage), and manage reservations (modify/cancel).

The project is divided into **3 milestones**. Each milestone builds upon the previous one and introduces additional tools and requirements.

\
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABOIAAAACCAYAAAD1jXPXAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAE4qADAAQAAAABAAAAAgAAAAAv2fdKAAAAVElEQVRoBe3QMQEAIAzAMMAHk4XwTRB8ONiXCuiRmZV3iAABAgQIECBAgAABAgQIECBAgACBNoHYcVbb3ZgAAQIECBAgQIAAAQIECBAgQIAAgS/wAAlbBCk2eDE1AAAAAElFTkSuQmCC)


# **Milestone 1 — Client-Side UI Design (HTML, CSS, JavaScript, jQuery, Bootstrap)**

## **Goal**

Design the **front-end user interface** for the airline ticketing system. Focus only on **client-side development**.


## **Requirements**

1. ### **Flight Search Page (MANATAD, OSENA)**

   - Form inputs for origin, destination, departure date, return date, passenger count.

   - Display list of available flights (dummy/static data).

   - Flight details include: airline, flight number, departure/arrival time, price.

2. ### **Reservation Form (MANATAD)**

   - Passenger details: name, email, passport number.

   - Optional package selection:

     - Meal options (dropdown: standard, vegetarian, kosher, etc.)

     - Seat selection (interactive seat map UI using Bootstrap grid & jQuery click events).

     - Extra baggage (checkbox or number input).

   - Show a **summary panel** with total price calculation (JavaScript updates dynamically).

3. ### **Reservation List (My Bookings)  (REIN, BOWEN)**

   - Display booked reservations (dummy/static data).

   - Ability to select a booking and view details.

4. ### **Other Pages  (REIN, BOWEN)**

   - Relevant admin pages as mentioned in Milestone 2 (User Management and Flights, UI only)

5. ### **UI / UX Guidelines (OSENA, PERSON 2)**

   - Use **Bootstrap** for layout and styling.

   - Use **jQuery** for interactivity (seat selection, dynamic price updates, form validation).

   - Ensure **responsive design** for desktop and mobile.

   - Provide a clear **navigation bar** with links: _Search Flights, Book Flight, My Reservations, Profile_

**IMPORTANT:** Note that for every instance of a create feature that adds data in the database of the web application, there should be corresponding features that will allow the corresponding user to read, update, and delete the data from the database. For example, if you have a feature that allows the user to create a post, the user should also be allowed to read/view the post, update/edit the post, and delete/remove the post.

\


**WORKING WITH GROUPMATES**

For this project, you are encouraged to work in groups of at most 4 members. Make sure that each member of the group has approximately the same amount of contribution for the project. Problems with groupmates must be discussed internally within the group, and if needed, with the lecturer.

\


**USE OF AI**

As this is a common core course and as stated in the course syllabus, AI should not be used in any portion of the submission of this project.
