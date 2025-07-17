# Classmate Academic Hub

[![Vite](https://img.shields.io/badge/Built%20with-Vite-blue)](https://vitejs.dev)
[![Made by Abhijay Panwar](https://img.shields.io/badge/Made%20by-Abhijay%20Panwar-brightgreen)](https://github.com/linux-cmd)

> Classmate Academic Hub is a modern, full-stack academic productivity platform built for students to manage assignments, visualize grades, collaborate in study groups, and sync schedules—all in one intuitive interface.

---

## Overview

Classmate Academic Hub is built with a powerful frontend stack using:

- Vite + React + TypeScript  
- Tailwind CSS with shadcn/ui components  
- Radix UI primitives for accessibility  
- React Router and React Query  
- Supabase for authentication and backend services  

While the frontend is fully functional, backend services (authentication, persistent storage, calendar sync) are configured to integrate with Supabase.

---

## Features

- Assignment tracker with due dates and completion status  
- Visual gradebook with subject/category analysis  
- Interactive calendar with local and Google events  
- Study group system with roles and invite codes  
- Theming support (light, dark, system)  
- Supabase-based authentication (Google Sign-In)  
- Google Calendar sync (planned)  
- Responsive and mobile-friendly design  

---

## Technologies Used

| Layer         | Technology               |
|--------------|---------------------------|
| Framework     | React + TypeScript       |
| Build Tool    | Vite                     |
| Styling       | Tailwind CSS + shadcn/ui |
| UI Components | Radix UI + Lucide Icons  |
| Forms         | React Hook Form + Zod    |
| Data Fetching | React Query              |
| Charts        | Recharts                 |
| Auth & DB     | Supabase                 |
| Routing       | React Router             |

---

## Getting Started

### Clone the repository

```bash
git clone https://github.com/linux-cmd/classmate-academic-hub.git
cd classmate-academic-hub
```

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm run dev
```
Visit [http://localhost:8080](http://localhost:8080) to access the app locally.

## Planned Backend Schema (Supabase)

- `profiles`: stores user data (id, name, email, theme preference)  
- `assignments`: title, description, due date, subject, status  
- `schedule_events`: calendar events (local and Google)  
- `grades`: score entries by subject/category/date  
- `study_groups`: group management and role control  
- `group_members`: members and permissions  
- `calendar_tokens`: OAuth tokens for Google Calendar sync  

All tables will enforce Row Level Security (RLS) to ensure user-specific data isolation.

---

## Author

This project is built and maintained by [Abhijay Panwar](https://github.com/linux-cmd), a passionate 9th-grade student exploring AI, full-stack development, and academic empowerment tools.

---

## License

This project is released under the MIT License.
