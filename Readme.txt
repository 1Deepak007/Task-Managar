----------------> Backend
cd backend_task_manager
npm init -y
npm install express mysql2 sequelize mime-types jsonwebtoken bcryptjs cors helmet express-validator dotenv
npm install --save-dev nodemon
npm i cloudinary
run ====> nodemon server.js

=====================================================================

npm create vite@latest task-manager-frontend -- --template react
cd task-manager-frontend
npm install
npm install axios react-router-dom
task-manager-frontend> npm i vite@latest
modify package.json 
"scripts": {
    "dev": "node ./node_modules/vite/bin/vite.js",
    "start": "node ./node_modules/vite/bin/vite.js",
    "build": "vite build",
    "preview": "vite preview"
  },
npm run dev

npm install tailwindcss @tailwindcss/vite

index.css  ---->     @import "tailwindcss";

vite.config.js
          import { defineConfig } from 'vite'
          import react from '@vitejs/plugin-react'
          import tailwindcss from '@tailwindcss/vite'

          // https://vite.dev/config/
          export default defineConfig({
            plugins: [
              react(),
              tailwindcss()
            ],
          })





CREATE TABLE users (
 id INT AUTO_INCREMENT PRIMARY KEY,
 email VARCHAR(255) NOT NULL UNIQUE,
 password VARCHAR(255) NOT NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tasks (
 id INT AUTO_INCREMENT PRIMARY KEY,
 user_id INT NOT NULL,
 title VARCHAR(255) NOT NULL,
 description TEXT,
 status ENUM('pending', 'working', 'completed') NOT NULL DEFAULT 'pending',
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY (user_id) REFERENCES users(id)
);





