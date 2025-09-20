# Quiz Application 🎯

A full-stack web application for creating, managing, and taking quizzes in real time.  
Built with the **MERN stack (MongoDB, Express, React, Node.js)** and designed for both admins and students.

---

## ✨ Features
- **Admin Dashboard**
  - Create, edit, publish/unpublish quizzes
  - Upload optional cover images
  - Set availability dates and track analytics (submissions, average score, duration)
- **Student Portal**
  - Browse live courses & take quizzes
  - View quiz history and leaderboard
  - Track progress with a dynamic progress bar and unlock achievements
- **Authentication & Profiles**
  - Secure signup/login with JWT
  - Personal info editing and profile picture (with cropping)
- **Responsive UI**
  - Clean, modern design with animations and role-based navigation

---

## 🛠️ Tech Stack
| Layer       | Technology |
|-------------|------------|
| Frontend    | React, Tailwind CSS, react-easy-crop |
| Backend     | Node.js, Express.js |
| Database    | MongoDB (Mongoose) |
| Auth        | JSON Web Tokens (JWT) |
| Deployment  | *(Add where you plan to deploy — e.g., Vercel, Render, Heroku)* |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- [MongoDB](https://www.mongodb.com/) running locally or via Atlas
- Git installed

### Installation
```bash
# Clone the repository
git clone https://github.com/<your-username>/Quiz_Application.git
cd Quiz_Application

# Install dependencies
npm install

# Run the backend and frontend (if scripts are set up)
npm run dev
