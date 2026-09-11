# StoreKit Enterprise Platform

StoreKit Enterprise is a full-stack, production-grade e-commerce application designed for authentic tech and electronics retail. The project features an Apple-inspired minimal frontend built with Next.js 14, a robust Java 17 Spring Boot backend microservice layer, relational SQL database migrations, and a floating AI Assistant widget.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Repository Structure](#repository-structure)
4. [Key Features](#key-features)
5. [Prerequisites](#prerequisites)
6. [Getting Started](#getting-started)
   - [Option A: Docker Compose (Recommended)](#option-a-docker-compose-recommended)
   - [Option B: Manual Development Setup](#option-b-manual-development-setup)
7. [API Endpoints Reference](#api-endpoints-reference)
8. [Database Schema & Migrations](#database-schema--migrations)
9. [Security Implementation](#security-implementation)
10. [License](#license)

---

## Architecture Overview

The system follows a multi-tier decoupled architecture:

```
+-------------------------------------------------------------------+
|                        Client Layer                               |
|          Next.js 14+ App Router (React 18, TypeScript)             |
+-------------------------------------------------------------------+
                                  |
                                  | HTTPS / REST API
                                  v
+-------------------------------------------------------------------+
|                        API Gateway / Security                     |
|           Spring Security + JWT Token Filter (Java 17)            |
+-------------------------------------------------------------------+
                                  |
                                  |
          +-----------------------+-----------------------+
          |                                               |
          v                                               v
+-----------------------------------+   +-----------------------------------+
|         Business Logic            |   |          Payment Gateways         |
| Spring Boot Controllers & Services|   |       VNPay & Momo Integrations   |
+-----------------------------------+   +-----------------------------------+
          |                                               |
          v                                               v
+-----------------------------------+   +-----------------------------------+
|          Data Storage             |   |            Caching                |
|     PostgreSQL 15 Database        |   |         Redis Server 7.0          |
+-----------------------------------+   +-----------------------------------+
```

---

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.3
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Icons**: Lucide React / SVG Vectors
- **Styling**: CSS Modules / Custom Design Tokens

### Backend
- **Framework**: Spring Boot 3.2 (Java 17)
- **Security**: Spring Security 6.x, JWT (JSON Web Tokens), BCrypt Password Hashing
- **Data Access**: Spring Data JPA, Hibernate ORM
- **Database Migrations**: Flyway DB
- **API Documentation**: SpringDoc OpenAPI / Swagger UI

### Infrastructure & Database
- **Primary Database**: PostgreSQL 15
- **In-Memory Cache**: Redis 7.0
- **Containerization**: Docker & Docker Compose

---

## Repository Structure

```
LNT_Webstore/
├── frontend/                     # Next.js 14+ App Router Frontend
│   ├── public/                   # Static assets & SVG icons
│   ├── src/
│   │   ├── app/                  # Application Routes & Pages
│   │   ├── components/           # UI Atoms, Layouts & AI Assistant Widget
│   │   ├── services/             # Axios API Service Modules
│   │   ├── store/                # Zustand State Stores
│   │   ├── types/                # TypeScript Interfaces & Models
│   │   └── middleware.ts         # Route Guard Middleware for authentication
│   ├── Dockerfile                # Multi-stage Next.js Docker Build
│   ├── package.json              # Frontend Dependencies
│   └── tsconfig.json             # TypeScript Compiler Configuration
│
├── backend/                      # Java 17 Spring Boot Backend
│   ├── src/main/java/com/store/  # Enterprise Package Hierarchy
│   │   ├── config/               # Security & CORS Configurations
│   │   ├── controller/           # REST API Controllers
│   │   ├── dto/                  # Data Transfer Objects
│   │   ├── entity/               # JPA ORM Entities
│   │   ├── payment/              # VNPay & Momo Integration Services
│   │   ├── repository/           # Data Access Repositories
│   │   ├── security/             # JWT Authentication Provider & Filters
│   │   └── service/              # Core Business Logic Services
│   ├── src/main/resources/       # Application Properties & YML Configs
│   ├── Dockerfile                # Multi-stage Maven/Java Docker Build
│   └── pom.xml                   # Maven Build Manifest
│
├── database/                     # SQL Migrations & Seed Data
│   ├── migrations/               # V1__init_schema.sql (3NF Relational Tables)
│   └── seed/                     # V2__seed_data.sql (Seed Product Datasets)
│
├── docs/                         # System Documentation
│   ├── ERD/                      # Entity Relationship Diagram (Mermaid)
│   └── architecture/             # System Architecture Specifications
│
├── docker-compose.yml            # Multi-container Orchestration Config
├── README.md                     # Project Documentation
└── .env.example                  # Environment Variables Template
```

---

## Key Features

- **Apple-Inspired Minimalist UI**: Clean design system with typography, smooth card animations, and responsive layout.
- **AI Chatbox Assistant**: Floating AI Assistant widget capable of processing customer queries regarding product specifications, pricing, and order status.
- **Route Guard Protection**: Next.js middleware protecting private routes (`/account`, `/checkout`) against unauthenticated access.
- **Stateless Authentication**: JWT-based session management integrated with Spring Security.
- **Payment Gateway Ready**: Native service structures for VNPay and Momo digital payment processing.
- **Database Versioning**: Flyway SQL migration scripts ensuring relational integrity across development and production environments.

---

## Prerequisites

Ensure the following tools are installed on your environment before starting:

- **Node.js**: v18.0.0 or higher
- **Java Development Kit (JDK)**: Version 17 or higher
- **Maven**: Version 3.8 or higher (or use Maven Wrapper)
- **Docker Desktop**: Version 24.0 or higher (for containerized setup)

---

## Getting Started

### Option A: Docker Compose (Recommended)

1. Clone the repository:
   ```bash
   git clone https://github.com/truong123123/LNT_Webstore.git
   cd LNT_Webstore
   ```

2. Copy the environment variables template:
   ```bash
   cp .env.example .env
   ```

3. Launch all services using Docker Compose:
   ```bash
   docker-compose up --build -d
   ```

4. Access the application:
   - **Frontend Application**: `http://localhost:3000`
   - **Backend REST API**: `http://localhost:8080/api/v1`
   - **Swagger API Specs**: `http://localhost:8080/swagger-ui.html`

---

### Option B: Manual Development Setup

#### 1. Backend Setup
```bash
cd backend
./mvnw clean install
./mvnw spring-boot:run
```

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## API Endpoints Reference

| HTTP Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Register new user account | Public |
| `POST` | `/api/v1/auth/login` | Authenticate user and issue JWT | Public |
| `GET` | `/api/v1/products` | Retrieve catalog products with filters | Public |
| `GET` | `/api/v1/products/{id}` | Retrieve product details | Public |
| `POST` | `/api/v1/orders` | Create new customer order | Authenticated |
| `POST` | `/api/v1/payment/vnpay` | Generate VNPay payment URL | Authenticated |
| `POST` | `/api/v1/chat` | Send prompt to AI Assistant | Public |

---

## Database Schema & Migrations

Database tables are created and managed via Flyway versioned migration scripts located in `database/migrations/`:

- `users`: User credentials, contact details, and role assignments (`ROLE_USER`, `ROLE_ADMIN`).
- `categories`: Product category hierarchy and slug mappings.
- `products`: Product SKUs, specifications, pricing, stock levels, and promotional flags.
- `orders` & `order_items`: Customer transaction history, shipping addresses, and line item details.
- `reviews`: Customer ratings and review comments.

---

## Security Implementation

- **Password Hashing**: BCrypt hashing with configurable work factor.
- **JWT Authentication**: Short-lived access tokens signed via HMAC SHA-256 keys.
- **CORS Policy**: Configured to restrict origin requests exclusively to approved frontend domains.

---

## License

This project is licensed under the MIT License - see the `LICENSE` file for details.
