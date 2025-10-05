# Quizzify (MERN-Stack Quiz Platform) 🎯

A full-stack web application for creating, managing, and taking quizzes in real time.  
Built with the **MERN stack (MongoDB, Express, React, Node.js)** and designed for both admins and students.

---

## 🚀 Overview

**Quizzify** allows admins to create, manage, and publish quizzes while providing students with live courses, progress tracking, achievements, and leaderboard functionality. The platform supports role-based access and dynamic user experiences.

---

## ✨ Features

### **Admin Dashboard**
- Create, edit, and delete quizzes
- Upload optional cover images
- Set availability dates (start/end)
- Publish/unpublish quizzes
- Track quiz analytics: total submissions, average score, duration

### **Student Portal**
- Browse live courses based on branch/role
- Take quizzes in real-time
- View quiz history and leaderboard
- Track progress with dynamic progress bars
- Unlock achievements based on performance

### **Authentication & Profiles**
- Secure signup/login with **JWT tokens**
- Update personal information and profile picture (with cropping via `react-easy-crop`)
- Achievements and progress dynamically updated

### **UI & UX**
- Modern, responsive design using React and Tailwind CSS
- Smooth animations for transitions and interactive elements
- Role-based navigation ensures only relevant content is shown

---

## 🏗️ Architecture

- **Frontend:** React, Tailwind CSS, react-easy-crop (profile picture cropping), dynamic progress bars  
- **Backend:** Node.js with Express for REST API endpoints  
- **Database:** MongoDB with Mongoose schemas for users, quizzes, results  
- **Authentication:** JWT-based secure login and role-based access  
- **Deployment:** Vercel, Render, or Heroku

---

## ⚙️ Setup Instructions

### **1. Clone the Repository**
```bash
git clone https://github.com/Ananya-Kundarapu/Quiz_Application.git
cd Quiz_Application
````

### **2. Install Dependencies**

```bash
npm install
```

### **3. Configure Environment Variables**

Create a `.env` file in the root directory and add the following:

```env
PORT=5000
MONGO_URI=<your_mongodb_connection_string>
JWT_SECRET=<your_jwt_secret_key>
```

> Replace `<your_mongodb_connection_string>` with your MongoDB Atlas or local connection string and `<your_jwt_secret_key>` with a strong, random string.

### **4. Run the Application**

```bash
npm run dev
```

> This command runs both the frontend and backend simultaneously.

---

## 🧑‍💻 Usage

### **Admin Actions**

* Navigate to `/admin-courses` to manage quizzes.
* Create quizzes by specifying a title, description, time limit, and available branches.
* Use the publish/unpublish toggle to control student access.
* Set start and end dates to automate quiz availability.
* View quiz analytics on the dashboard to monitor performance.

### **Student Actions**

* Browse and filter courses on the home page.
* Start a quiz and submit answers in real-time.
* Check your progress and view a summary of your performance.
* Access your quiz history and view your ranking on the leaderboard.

---

## 🚀 Deployment

* The application can be deployed on platforms like **Vercel** (frontend) and **Render** or **Heroku** (backend).
* Ensure environment variables on the deployment platform match your local `.env` file.

---

## 🤝 Contributing

Contributions are welcome! Follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix:

```bash
git checkout -b feature-name
```

3. Make your changes and test thoroughly.
4. Commit your changes:

```bash
git commit -m "Add new feature"
```

5. Push to your branch:

```bash
git push origin feature-name
```

6. Submit a pull request with a clear description of your changes.

---
