# Pet Adoption Management System Frontend

A responsive React (Vite) + Tailwind CSS frontend for browsing pets, applying for adoption, and managing requests from user and admin dashboards.

## Purpose
This frontend provides a complete pet adoption workflow:
- Visitors can browse pets, search/filter, and view basic pet information.
- Logged-in users can view pet details and submit adoption requests.
- Logged-in users can manage their own adoption applications in the user panel.
- Admins can manage pets (add/edit/delete), review adoption requests, and approve/reject them.

## Tech Stack

- React + Vite
- Tailwind CSS (v4 via `@tailwindcss/vite`)
- React Router
- Axios with auth interceptor

## Features

- Public pet listing with search and filters
- Responsive pet details page with adopt action
- Login/Register pages with validation and loading states
- User dashboard for adoption application tracking
- Admin dashboard with:
  - Pet CRUD UI
  - Application approval/rejection UI
- Reusable components:
  - Navbar, PetCard, Button, InputField, Modal, Loader, StatusBadge
- Mobile-first layouts:
  - Responsive grids, cards/tables, collapsible admin sidebar
- Performance-friendly patterns:
  - Route-level lazy loading
  - Debounced search

## Important Routes (Frontend)
- Public: `/` (pet listing)
- Public: `/pets/:id` (pet details + Adopt Now)
- Auth: `/login`
- Auth: `/register`
- User Panel:
  - `/dashboard` (my adoption applications)
  - `/dashboard/pets` (available pets to adopt)
- Admin Panel:
  - `/dashboard/admin` (overview)
  - `/dashboard/admin/pets` (pet management: add/edit/delete + filters)
  - `/dashboard/admin/applications` (adoption management: approve/reject)



## Run Locally

```bash
npm install
npm run dev
```

## Backend Connection (Required for real data)
Set the backend base URL so Axios requests hit your backend.

Optional API base URL in `.env`:

```bash
VITE_API_BASE_URL=http://localhost:5000/api
```

## Registering Admin Users (Admin Key)
If you use the frontend registration page, admins can only be created when:
- User Type = `admin`
- Admin Key = `Admin@123`

### Steps (Frontend)
1. Open `/register`
2. Select `User Type`: `admin`
3. Enter `Admin Key`: `Admin@123`
4. Fill `name`, `email`, `password`
5. Click `Register`
6. After successful registration, the app redirects to `/login` (it does not auto-login)
7. Log in using the email/password you created (your sidebar will show admin options)

### Optional: Create Admin via Backend Directly
If your backend allows self-assigning roles, you can also create an admin directly:

```bash
curl -s -X POST http://localhost:5000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Ali\",\"email\":\"ali@example.com\",\"password\":\"password123\",\"role\":\"admin\"}"
```

If your backend requires extra checks, prefer the Frontend “Admin Key” flow above.

## Adoption Flow (How It Works)
1. User clicks **Adopt Now** on a pet details screen.
2. Frontend calls `POST /api/adoptions` with `{ petId }`.
3. User panel shows the adoption list by calling:
   - `GET /api/adoptions/me`
4. Admin approves/rejects:
   - List: `GET /api/adoptions`
   - Update: `PATCH /api/adoptions/:id/status`

## Pet Image Upload (Admin)
When adding/editing a pet in the admin pet modal, the image is uploaded first:
- `POST /api/uploads/pets-image` (multipart upload)
- The returned `imageUrl` is then sent with `POST /api/pets` or `PATCH /api/pets/:id`.

## Notes (Mock Mode)
If the backend is not available, the app uses mock data internally so you can still test UI flows.
