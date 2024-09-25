# webapp

## Introduction
- **Programming Language**: Java Script
- **Environment**: Node.js
- **Database**: PostgreSQL
- **Backend Framework**: Express.js
- **ORM Framework**: Sequelize

## Prerequisites

Before you begin, ensure you have met the following requirements:

- **Node.js**: You need to have Node.js installed. You can download it from [Node.js official website](https://nodejs.org/).
- **PostgreSQL**: Make sure you have PostgreSQL installed and running on your local machine. You can download it from [PostgreSQL official website](https://www.postgresql.org/download/).
- **Sequelize ORG Framwork**: (https://sequelize.org/)
- **Environment Variables**: Create a `.env` file in the root of your project with the following variables:
    ```
    DB_NAME=your_database_name
    DB_USER=your_database_user
    DB_PASSWORD=your_database_password
    DB_HOST=localhost
    DB_PORT=5432
    ```

## Installation

To install the necessary dependencies, follow these steps:

1. Clone the repository:
    ```bash
    git clone https://github.com/YidanWWW/webapp.git
    cd webapp
    ```

2. Install the dependencies:
    ```bash
    npm install
    npm install express
    npm install sequelize sqlite3
    npm install --save pg pg-hstore
    ```

## Build and Deploy Instructions

To start your web application, follow these steps:
``

1. **Start the Application**:
    - To start the server, run the following command:
      ```bash
      node index.js
      ```
    - This will start the application on `http://localhost:8080`.

2. **Access the Health Check Endpoint**:
    - You can verify that your application is running by visiting the health check endpoint:
      ```bash
      curl -vvvv http://localhost:8080/healthz
      ```
    - You should receive a `200 OK` response if everything is set up correctly.

3. **Start or stop postgresql server**
    - You can start postgresql by using:
      ```bash
      systemctl start postgresql
      ```
    - You can stop postgresql by using:
      ```bash
      systemctl stop postgresql
      ```
## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
