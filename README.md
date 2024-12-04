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

1. Fork the repository:

1. Clone the repository:

   ```bash
   git clone https://github.com/your-user-name/webapp.git
   cd webapp
   ```

1. Install the dependencies:
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

## **SSL Certificate Configuration for Dev and Demo Environments**

This document provides instructions for configuring SSL certificates for both **Dev** and **Demo** environments.

---

### **Dev Environment**

#### **Steps to Get an SSL Certificate**

1. **Request an SSL certificate using AWS Certificate Manager (ACM):**

   - Go to the [AWS Certificate Manager Console](https://console.aws.amazon.com/acm/).
   - Click **Request a certificate** and select **Request a public certificate**.
   - Enter the domain name for your dev environment, e.g., `dev.rubyw.xyz`.
   - Use **DNS validation**:
     - ACM will provide a `CNAME` record.
     - If you use AWS Route 53, you can add the record automatically.
     - If your DNS is hosted elsewhere, add the `CNAME` record manually.
   - Wait for the certificate status to change to **Issued**.

2. **Configure the Load Balancer:**
   - Open the **Elastic Load Balancing (ELB) Console**.
   - Select your load balancer.
   - Go to the **Listeners** tab and add an HTTPS listener on port 443.
   - Select the ACM certificate issued for your domain.
   - Save the configuration.

---

### **Demo Environment**

#### **Steps to Get an SSL Certificate**

1. **Request an SSL certificate from Namecheap or another SSL vendor:**

   - **Generate a CSR and private key**:
     ```bash
     openssl req -new -newkey rsa:2048 -nodes -keyout demo.rubyw.xyz.key -out demo.rubyw.xyz.csr
     ```
     - Follow the prompts to enter your domain details (e.g., `demo.rubyw.xyz`).
   - Submit the CSR (`demo.rubyw.xyz.csr`) to your SSL vendor (e.g., Namecheap) during the certificate request process.
   - Verify your domain ownership using DNS validation (add a `CNAME` record) or email validation.
   - Once verified, download the issued certificate files:
     - Main certificate: `demo_rubyw_xyz.crt`
     - Certificate chain: `demo_rubyw_xyz.ca-bundle`

2. **Prepare the Files:**

   - Ensure you have the following:
     - **Private Key**: `demo.rubyw.xyz.key`
     - **Certificate**: `demo_rubyw_xyz.crt`
     - **Certificate Chain**: `demo_rubyw_xyz.ca-bundle`

3. **Import the Certificate into AWS ACM:**

   - Use the AWS CLI to import the certificate:
     ```bash
     aws acm import-certificate \
       --certificate fileb:///path/to/demo_rubyw_xyz.crt \
       --private-key fileb:///path/to/demo.rubyw.xyz.key \
       --certificate-chain fileb:///path/to/demo_rubyw_xyz.ca-bundle
     ```
     - Replace `/path/to/` with the actual paths to your files.

4. **Configure the Load Balancer:**
   - Open the **Elastic Load Balancing (ELB) Console**.
   - Select your load balancer.
   - Go to the **Listeners** tab and add an HTTPS listener on port 443.
   - Select the imported ACM certificate.
   - Save the configuration.

---

### **File Paths**

Below are the paths used in the commands:

| File              | Example Path                        |
| ----------------- | ----------------------------------- |
| Private Key       | `/path/to/demo.rubyw.xyz.key`       |
| Main Certificate  | `/path/to/demo_rubyw_xyz.crt`       |
| Certificate Chain | `/path/to/demo_rubyw_xyz.ca-bundle` |

---

### **Testing SSL Configuration**

1. Open your browser and navigate to:

   - Dev Environment: `https://dev.rubyw.xyz`
   - Demo Environment: `https://demo.rubyw.xyz`

2. Verify:
   - The connection is secure (lock icon appears).
   - The certificate matches the domain.

---

### **Troubleshooting**

#### **Certificate Import Issues**

- Ensure the private key matches the certificate.
- Check that the certificate chain is correctly included.
- Verify the file paths are correct.

#### **DNS Validation Issues**

- Ensure the `CNAME` record is added and has propagated.
- Use `dig` or `nslookup` to confirm DNS records are correct:
  ```bash
  dig CNAME _acme-challenge.demo.rubyw.xyz
  ```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
