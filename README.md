# GKCinema - Real-time Movie Ticket Booking System

**GKCinema** is a modern Full-stack Web application that enables users to browse movies, select seats, and book tickets in real-time. This project is the implementation phase of a comprehensive System Analysis and Design process, combining the robustness of **Python (Django)** with the flexibility of **React**.

## 📌 Project Overview
The system was developed based on a detailed System Analysis and Design documentation (attached in this repository). It addresses core architectural challenges such as real-time data flow, entity-relationship management, and seamless user experience in the digital entertainment industry.

- **Design Documentation:** `Phan-tich-thiet-ke-he-thong-GKCinema.pdf`
- **Architecture:** Client-Server / RESTful API.

## ✨ Key Features

- **Real-time Seat Booking:** Instant updates on seat availability to prevent double-booking, powered by Firebase synchronization.
- **Interactive Seat Map:** A visual and intuitive interface for seat selection.
- **Secure Payments:** Integrated with Stripe (Sandbox mode) for international payment processing.
- **User Authentication:** Secure Sign-up/Login system using Firebase Authentication.
- **Fully Responsive:** Optimized for a seamless experience across Desktop, Tablet, and Mobile devices.
- **Booking History:** Users can manage and view their previous transactions and tickets.

## 🛠 Tech Stack

### Backend
- **Framework:** Python - Django REST Framework (DRF).
- **Real-time Database:** Firebase Firestore / Cloud Database.
- **Payment Gateway:** Stripe API.
- **Security:** Firebase Admin SDK for server-side verification.

### Frontend
- **Library:** ReactJS with **TypeScript** (for type safety and scalable code).
- **Styling:** Material-UI (MUI) & Tailwind CSS.
- **State Management:** Context API & Axios for API communication.

## 📂 Project Structure

- **backend/**: Business Logic, API, and Database connections
- **frontend/**: React TypeScript User Interface
- **Phan-tich-thiet-ke-he-thong-GKCinema.pdf**: System Analysis & Design documentation

## 🚀 Setup & Installation

### 1. Backend Configuration
```bash

python -m venv venv

source venv/bin/activate  # On Windows: venv\Scripts\activate

pip install -r requirements.txt

python manage.py runserver 8001
```
### 2. Frontend Configuration
```bash
cd frontend

npm install

npm start
```

Note: Ensure you configure your environment variables in the .env file following the .env.example template for Firebase and Stripe credentials.

### 📄 License
This project is developed by Nguyen Trieu Gia Khanh for educational and portfolio purposes. Licensed under the MIT License.
