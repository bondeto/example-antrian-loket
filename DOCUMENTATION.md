
# QueuePro System - Documentation

This document provides a detailed overview of the QueuePro System application, including its workflow, architecture, components, and key features.

## 1. Application Workflow

The application has two main views: Customer View and Admin View.

### 1.1. Customer View

1.  **Select Service**: The customer chooses a service type (e.g., "General Inquiry," "Payments," "Technical Support") from a dropdown menu.
2.  **Get Ticket**: The customer clicks the "Get Ticket" button.
3.  **Ticket Issuance**:
    *   A new ticket is generated with a unique, prefixed number (e.g., A-001 for General Inquiry). The numbering is sequential per service type.
    *   A "PLING" sound is played (if browser supports it).
    *   A modal window appears displaying the ticket number, service name, issued time, and a QR code.
4.  **Print Ticket (Optional)**: The customer can click the "Print Ticket" button in the modal to print a physical copy. The print layout is optimized for clarity.
5.  **View Now Serving**: The customer can see a display of tickets currently being "CALLED" or "SERVING" across all stations.

### 1.2. Admin View

Admins manage the queue and service stations.

1.  **Station Management (Dynamic)**:
    *   **Add Station**: Admins can add new stations/counters by providing a name and selecting which service types the station will support.
    *   **Remove Station**: Admins can remove existing stations. A station can only be removed if it is currently "IDLE" and not actively handling a ticket.
    *   **Persistence**: Station configurations are saved in the browser's `localStorage`, so they persist between sessions on the same browser.
2.  **Service Operations (Per Station)**:
    *   **Call Next**: The admin clicks "Call Next" for a specific station.
        *   The system finds the longest-waiting ticket that matches one of the station's supported service types.
        *   The ticket status changes to "CALLED," and it's assigned to the station.
        *   A voice announcement is made (e.g., "Nomor antrian A-001, silahkan ke Counter 1").
        *   The station status changes to "CALLING".
    *   **Start Serving**: Once a ticket is "CALLED," the admin can click "Start Serving".
        *   The ticket status changes to "SERVING".
        *   The station status changes to "SERVING".
    *   **Complete Service**: After serving the customer, the admin clicks "Complete Service".
        *   The ticket status changes to "COMPLETED".
        *   The station becomes "IDLE" and available for the next customer.
    *   **Skip Ticket**: If a customer doesn't respond or needs to be skipped, the admin clicks "Skip Ticket".
        *   The ticket status changes to "SKIPPED".
        *   The station becomes "IDLE".
3.  **Queue Monitoring**:
    *   **Waiting Queue**: Admins can see a list of all tickets currently in "WAITING" status, ordered by issue time.
    *   **Skipped/Absent Queue**: Admins can see tickets that were "SKIPPED" by an admin or automatically marked "ABSENT".
4.  **Recall Ticket**:
    *   For tickets in the "Skipped/Absent Queue," admins can select an "IDLE" station that supports the ticket's service type.
    *   Clicking "Recall" will change the ticket's status to "CALLED" and assign it to the selected station, with a voice announcement.
5.  **Automatic "ABSENT" Status**:
    *   If a ticket remains in "CALLED" status at a station for a predefined duration (e.g., 2 minutes), it is automatically marked "ABSENT".
    *   The station that was calling the ticket becomes "IDLE".

## 2. Architecture & Key Components

The application is currently a **frontend-only SPA** built with React and TypeScript, using Vite for development and bundling. For advanced features like data persistence and reporting, a backend system would be necessary. Station configuration is an exception, being persisted via `localStorage`.

### 2.1. Core Files

*   **`index.html`**: The main HTML entry point.
*   **`index.tsx`**: Mounts the main React application (`<App />`) to the DOM.
*   **`App.tsx`**: The root component of the application. It manages the global state (client-side), contains the core logic for ticket and station management, and routes between customer and admin views. Handles `localStorage` for stations.
*   **`types.ts`**: Defines all shared TypeScript interfaces and enums (e.g., `Ticket`, `Station`, `TicketStatus`, `ServiceType`, `AppState`).
*   **`styles.css`**: Contains global CSS, custom animations (`pulseFast`), and print-specific styles. Tailwind CSS is used via CDN for rapid UI development.
*   **`config.ts`**: Placeholder for application configuration, such as backend API endpoints (see Section 5).

### 2.2. UI Components (`components/`)

*   **`TicketModal.tsx`**:
    *   Displays information for a newly issued ticket (number, service, QR code).
    *   Provides "Print Ticket" and "Close" buttons.
    *   Responsible for formatting the ticket for printing.
*   **`StationCard.tsx`**:
    *   Represents an individual service station/counter in the Admin View.
    *   Displays station name, status (Idle, Calling, Serving), current ticket, supported services, and waiting count for its services.
    *   Contains action buttons: "Call Next," "Start Serving," "Complete Service," "Skip Ticket."
    *   Indicates if voice announcements are active or unsupported.
*   **`StationManagement.tsx` (New)**:
    *   Provides UI in the Admin View for adding new stations (name, supported services) and removing existing idle stations.
    *   Interacts with `App.tsx` to update station configurations.
*   **`QueueDisplay.tsx`**:
    *   Renders lists of tickets (e.g., "Waiting Queue," "Skipped/Absent Queue").
    *   Shows ticket details (number, service, time).
    *   Includes functionality to recall tickets from the "Skipped/Absent Queue" by selecting an available, compatible station.
*   **`NowServingDisplay.tsx`**:
    *   Prominently displays tickets that are currently "CALLED" or "SERVING" across all stations.
    *   Visible in the Customer View and often part of public queue displays.
    *   Uses distinct styling for "CALLED" (pulsing animation) vs. "SERVING" tickets.

### 2.3. Custom Hooks (`hooks/`)

*   **`useSpeechSynthesis.ts`**:
    *   A React hook abstracting the browser's `SpeechSynthesis` API.
    *   Provides `speak(text)` function, `isSpeaking` state, and `supported` flag.
    *   Configured for Indonesian language ("id-ID") with attempts to find a natural female voice.

## 3. State Management (Current Frontend-Only Model)

*   The primary application state (`AppState`) is managed within the `App.tsx` component using React's `useState` hook.
*   **Data Persistence**:
    *   `Tickets` and `ServiceType` states are ephemeral and reset on page refresh.
    *   `Stations` configuration is persisted in the browser's `localStorage` and loaded on application startup.
*   The state includes:
    *   `tickets`: An array of all `Ticket` objects.
    *   `stations`: An array of `Station` objects (dynamically managed and persisted).
    *   `serviceTypes`: An array defining available services, their prefixes, and next ticket numbers.
    *   `showTicketModal`, `lastIssuedTicket`: For managing the ticket display modal.
    *   `currentView`: Toggles between 'customer' and 'admin' views.
    *   `selectedServiceType`: The service type chosen by the customer before getting a ticket.
*   State updates are performed using the `setState` function, often with functional updates to ensure consistency based on the previous state.
*   `useEffect` hook is used for side effects, such as:
    *   Loading/saving stations from/to `localStorage`.
    *   Setting up an interval to check for and mark "ABSENT" tickets.

## 4. Key Features Detailed

### 4.1. Dynamic Station Management

*   Admins can create stations, giving them a name and assigning one or more service types they can handle.
*   Stations can be removed if they are idle (not `CALLING` or `SERVING` and no `currentTicketId`).
*   The `localStorage` key `queueProStations` is used to store the array of station objects.

### 4.2. Service Types & Ticket Numbering

*   Each service (e.g., "General Inquiry," "Payments") has a unique ID, name, prefix (e.g., "A," "B"), and its own `nextNumber` counter (managed in client-side state).
*   This ensures that ticket numbers are unique per service (e.g., A-001, B-001, A-002).
*   The `formatTicketNumber` function in `App.tsx` creates the display string (e.g., "A-001").

### 4.3. Ticket Printing

*   The `TicketModal.tsx` component includes a "Print Ticket" button.
*   `window.print()` is used to trigger the browser's print dialog.
*   `styles.css` contains `@media print` rules.

### 4.4. Voice Announcements

*   Leverages the `useSpeechSynthesis` hook.
*   The announcement message is "Nomor antrian [Ticket Number], silahkan ke [Station Name]."

### 4.5. Styling and UI

*   **Tailwind CSS (CDN)**: Used for most of the layout and styling.
*   **`styles.css`**: Global base styles, custom animations, print styles.
*   **Dark Theme** and **Responsive Design**.
*   **Basic Accessibility** (ARIA attributes).

## 5. Future Enhancements: Backend, Database, and Reporting (Conceptual)

To enable data persistence (beyond `localStorage` for stations), multi-user access, and advanced reporting, a backend system and database are essential.

### 5.1. Backend and Database Integration (e.g., PostgreSQL)

*   **Architecture Shift**: The application would transition to a client-server model. The React frontend would become the client, interacting with a backend API.
*   **Backend Technology**: A backend could be built using Node.js (with Express.js), Python (Django/Flask), Java (Spring Boot), Ruby on Rails, etc.
*   **Database**: PostgreSQL is a powerful open-source relational database suitable for this type of application.
    *   **Schema Design**:
        *   `Services` (id, name, prefix)
        *   `Stations` (id, name, supported_service_ids) - Currently in localStorage, would move to DB.
        *   `Tickets` (id, service_id, station_id, ticket_number, display_number, status, issued_at, called_at, serving_at, completed_at, skipped_at)
        *   `QueueLog` or `TicketEvents` (event_id, ticket_id, event_type, timestamp, station_id, admin_id) - for detailed auditing and reporting.
*   **API Endpoints**: The backend would expose RESTful or GraphQL APIs for:
    *   Managing service types.
    *   Managing stations (CRUD operations).
    *   Issuing tickets.
    *   Updating ticket statuses (call, serve, complete, skip, recall).
    *   Fetching queue data.
    *   User authentication for admins.
    *   Fetching data for reports.
*   **Frontend Changes**:
    *   State management in `App.tsx` would primarily handle UI state and fetched data.
    *   All data manipulation logic (`handleIssueTicket`, `handleCallNext`, `handleAddStation` etc.) would be replaced with API calls to the backend.
    *   The `config.ts` file would store the `API_BASE_URL`.

### 5.2. Reporting Module

Once data is persisted in a database like PostgreSQL, a reporting module can be developed.

*   **Data Collection**: The backend would query the database (especially `Tickets` and `QueueLog` tables) to aggregate data.
*   **Key Metrics for Reporting**:
    *   **Average Wait Time**: Overall, per service, per station, by time of day/day of week.
    *   **Average Service Time**: Overall, per service, per station.
    *   **Peak Hours**: Identify busiest times based on ticket issuance or active serving.
    *   **Ticket Volume**: Total tickets, tickets per service, tickets per station.
    *   **Abandonment Rate**: Percentage of "SKIPPED" or "ABSENT" tickets.
    *   **Station Utilization**: How busy each station is.
    *   **Throughput**: Tickets processed per hour/day.
*   **Frontend Display**:
    *   A new "Reporting" section could be added to the Admin View.
    *   Data could be presented using tables, charts (bar charts, line graphs, pie charts), and dashboards. Libraries like Chart.js, Recharts, or Nivo could be used in the frontend.
    *   Filters for date ranges, service types, stations would allow for more granular analysis.
*   **Backend API for Reports**: Specific endpoints would be needed, e.g.:
    *   `GET /api/reports/summary?startDate=<date>&endDate=<date>`
    *   `GET /api/reports/wait-times?serviceId=<id>&period=daily`

### 5.3. User Authentication & Authorization

*   For a production system, admin functionalities would need to be protected.
*   The backend would handle user registration, login (e.g., JWT, sessions), and role-based access control.

This documentation should provide a good understanding of the QueuePro System's current functionality and a roadmap for potential future enhancements.
