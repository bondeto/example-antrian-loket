
# QueuePro System

QueuePro System is a web application for managing customer queues. It allows clients to get a numbered ticket for various services, and administrators to call, serve, skip, or recall tickets. The system features voice announcements for called tickets and an option to print tickets.

**Note**: This version is a frontend-only demonstration. For persistent data storage, comprehensive reporting, and multi-user capabilities, a backend server and database (e.g., PostgreSQL) would be required. See `DOCUMENTATION.md` for more details on potential backend integration. Station configurations are persisted using browser `localStorage`.

## Features

*   **Customer View**:
    *   Select from multiple service types (e.g., General Inquiry, Payments).
    *   Receive a unique, prefixed ticket number (e.g., A-001, B-001).
    *   View a modal with the ticket number and a QR code.
    *   Print the ticket.
    *   See "Now Serving" display.
*   **Admin View**:
    *   **Dynamic Station Management**: Add new stations/counters with custom names and assign supported service types. Remove stations if they are idle. Configurations are saved in `localStorage`.
    *   Manage multiple service stations (counters).
    *   Call the next waiting ticket appropriate for the station's supported services.
    *   Mark tickets as "Serving", "Completed", or "Skipped".
    *   Recall "Skipped" or "Absent" tickets to an available station.
    *   View "Waiting" and "Skipped/Absent" queues.
*   **Voice Announcements**: Tickets are announced in Indonesian (e.g., "Nomor antrian A-001, silahkan ke Counter 1").
*   **Automatic Timeout**: Tickets in "CALLED" status for too long are marked "ABSENT".
*   **Responsive Design**: Dark-themed UI built with Tailwind CSS.
*   **Print Functionality**: Customers can print their tickets.

## Future Considerations (Requires Backend Development)

*   **PostgreSQL Database Integration**: For persistent storage of tickets, stations, service history, and user data (currently stations are in localStorage).
*   **Reporting Module**: Generate reports on queue statistics (wait times, service times, peak hours, etc.).
*   **User Authentication**: For admin roles.
*   **Real-time Updates**: Using WebSockets for instant updates across multiple admin or display screens.

## Prerequisites

*   [Node.js](https://nodejs.org/) (version 18.x or later recommended)
*   [npm](https://www.npmjs.com/) (usually comes with Node.js) or [yarn](https://yarnpkg.com/)

## Installation

1.  **Clone the repository** (or download and extract the files to a local directory):
    ```bash
    # If you have git installed
    # git clone <repository-url>
    # cd <repository-name>

    # If you downloaded the files, navigate to the project directory
    # cd /path/to/your/project/QueueProSystem
    ```

2.  **Install dependencies**:
    Open your terminal in the project's root directory and run:
    ```bash
    npm install
    ```
    or if you prefer yarn:
    ```bash
    yarn install
    ```

## Running the Application Locally

1.  **Start the development server**:
    ```bash
    npm run dev
    ```
    or with yarn:
    ```bash
    yarn dev
    ```
2.  **Open your browser**:
    Vite will typically output the local URL where the application is running (usually `http://localhost:5173`). Open this URL in your web browser.

You should now see the QueuePro System running. You can switch between Customer and Admin views to test the functionality.

## Building for Production

To create an optimized build of the application for deployment:

1.  **Run the build command**:
    ```bash
    npm run build
    ```
    or with yarn:
    ```bash
    yarn build
    ```
2.  The production-ready files will be generated in the `dist` folder. You can then deploy this `dist` folder to any static web hosting service.

## Project Structure

```
/
├── public/              # Static assets (if any, Vite serves this)
├── components/          # React UI components
│   ├── NowServingDisplay.tsx
│   ├── QueueDisplay.tsx
│   ├── StationCard.tsx
│   ├── StationManagement.tsx # New component
│   └── TicketModal.tsx
├── hooks/               # Custom React hooks
│   └── useSpeechSynthesis.ts
├── App.tsx              # Main application component
├── config.ts            # Application configuration (e.g., API endpoints)
├── index.html           # Main HTML entry point for Vite
├── index.tsx            # React application entry point
├── metadata.json        # Application metadata (not directly used by Vite build)
├── package.json         # Project dependencies and scripts
├── README.md            # This file
├── DOCUMENTATION.md     # Detailed project documentation
├── styles.css           # Global and print stylesheets
├── tsconfig.json        # TypeScript compiler configuration
├── tsconfig.node.json   # TypeScript configuration for Node environment (e.g., Vite config)
├── types.ts             # TypeScript type definitions
└── vite.config.ts       # Vite configuration file
```

For more details on the application's architecture and features, please refer to `DOCUMENTATION.md`.
