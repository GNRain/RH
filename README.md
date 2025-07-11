# RH Management System

This is a comprehensive Human Resources management system designed to streamline and automate various HR processes. The system is built with a modern technology stack, featuring a robust NestJS backend and a dynamic React frontend.

## Table of Contents

- [About The Project](#about-the-project)
  - [Key Features](#key-features)
  - [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
- [Usage](#usage)
  - [Running the Application](#running-the-application)
  - [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## About The Project

This project is a full-stack application that provides a complete solution for managing human resources. It includes features for employee management, leave management, scheduling, document management, and more. The application is designed to be scalable, secure, and easy to use.

### Key Features

- **Authentication and Authorization:** Secure authentication with JWT, two-factor authentication (2FA), and role-based access control.
- **Employee Management:** Create, read, update, and delete employee records.
- **Leave Management:** A comprehensive leave management system with a multi-step approval workflow.
- **Scheduling:** A flexible scheduling system that allows for easy management of employee shifts.
- **Document Management:** A secure document management system for storing and sharing HR documents.
- **Dashboard:** An HR dashboard with key metrics and analytics.
- **Notifications:** A notification system to keep users informed of important events.
- **Internationalization:** The frontend is designed to support multiple languages.

### Tech Stack

#### Backend

- [NestJS](https://nestjs.com/)
- [Prisma](https://www.prisma.io/)
- [PostgreSQL](https://www.postgresql.org/)
- [JWT](https://jwt.io/)
- [Nodemailer](https://nodemailer.com/)
- [otplib](https://www.npmjs.com/package/otplib)
- [bcrypt](https://www.npmjs.com/package/bcrypt)
- [Passport](http://www.passportjs.org/)

#### Frontend

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [React Router](https://reactrouter.com/)
- [TanStack Query](https://tanstack.com/query/v4)
- [Axios](https://axios-http.com/)
- [i18next](https://www.i18next.com/)

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js (v16 or later)
- npm
- Docker

### Installation

1.  **Clone the repository:**

    ```sh
    git clone https://github.com/GNRain/RH.git
    ```

2.  **Install backend dependencies:**

    ```sh
    cd rh-backend
    npm install
    ```

3.  **Install frontend dependencies:**

    ```sh
    cd ../rh-frontend-updated
    npm install
    ```

### Configuration

1.  **Backend:**

    -   Create a `.env` file in the `rh-backend` directory and add the following environment variables:

        ```
        DATABASE_URL="postgresql://user:password@localhost:5432/mydatabase"
        JWT_SECRET="your_jwt_secret"
        CORS_ORIGIN="http://localhost:5173"
        ```

2.  **Frontend:**

    -   The frontend is configured to work with the backend at `http://localhost:3000`.

## Usage

### Running the Application

1.  **Start the backend server:**

    ```sh
    cd rh-backend
    npm run start:dev
    ```

2.  **Start the frontend development server:**

    ```sh
    cd ../rh-frontend-updated
    npm run dev
    ```

### API Endpoints

The backend exposes a RESTful API with the following endpoints:

-   `auth/`: Authentication and authorization
-   `users/`: User management
-   `leave/`: Leave management
-   `notifications/`: Notification management
-   `departments/`: Department management
-   `positions/`: Position management
-   `dashboard/`: HR dashboard
-   `shifts/`: Shift management
-   `schedules/`: Schedule management
-   `documents/`: Document management

For more details on the API endpoints, please refer to the backend source code.

## Project Structure

The project is organized into two main directories: `rh-backend` and `rh-frontend-updated`.

-   **`rh-backend`:** Contains the NestJS backend application.
    -   `src/`: Contains the source code for the backend application.
        -   `auth/`: Authentication and authorization module.
        -   `users/`: User management module.
        -   `leave/`: Leave management module.
        -   `notifications/`: Notification management module.
        -   `departments/`: Department management module.
        -   `positions/`: Position management module.
        -   `dashboard/`: HR dashboard module.
        -   `shifts/`: Shift management module.
        -   `schedules/`: Schedule management module.
        -   `documents/`: Document management module.
-   **`rh-frontend-updated`:** Contains the React frontend application.
    -   `src/`: Contains the source code for the frontend application.
        -   `api/`: Functions for making API requests to the backend.
        -   `components/`: Reusable UI components.
        -   `contexts/`: React contexts for managing global state.
        -   `hooks/`: Custom React hooks.
        -   `lib/`: Utility functions.
        -   `locales/`: Translation files for internationalization.
        -   `pages/`: The main pages of the application.

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

Ghaith Naouali - [@LinkedIN](https://www.linkedin.com/in/ghaith-naouali/) - ghaith.naouali@gmail.com

Project Link: https://github.com/GNRain/RH
