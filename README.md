
# MOC-PTW System

MOC-PTW (Management of Change & Permit to Work) System is a web-based application designed to streamline industrial safety processes. It allows users to create, approve, and track work permits and change management requests efficiently, ensuring compliance with safety standards.

## Features

* **User Roles:** Admin, HSE, Contractor, and Employee roles with role-based access control.
* **Permit to Work (PTW):** Create, submit, approve, and track work permits.
* **Management of Change (MOC):** Request, review, and approve changes to operational processes safely.
* **Notifications:** Alerts for pending approvals and task updates.
* **Dashboard:** Overview of active permits, change requests, and pending actions.
* **Search & Filter:** Quickly find permits and requests by type, status, or user.

## Tech Stack

* **Frontend & Backend:** [Next.js](https://nextjs.org)
* **Database:** MongoDB / any preferred database
* **Authentication:** JWT or session-based authentication
* **Styling:** Tailwind CSS / custom CSS
* **API:** RESTful API routes via Next.js `pages/api`

## Getting Started

### Prerequisites

* Node.js >= 18.x
* npm, yarn, or pnpm

### Installation

Clone the repository:

```bash
git clone <repository-url>
cd moc-ptw-system
```

Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

### Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the app.

### API Routes

All backend API routes are inside `pages/api`. Example:

```
GET /api/hello
```

You can edit this endpoint in `pages/api/hello.js`.

### Environment Variables

Create a `.env.local` file for environment variables like database URL and JWT secret:

```
MONGO_URI=<your_mongo_connection_string>
JWT_SECRET=<your_jwt_secret>

# MOC/PTW Mini Management System

## Workflow
1. Contractor logs in and creates an **MOC item** in Draft status.
2. Contractor submits the MOC (status: Submitted).
3. HSE Manager reviews the MOC:
   - Can Approve → PTW can be issued for actual work
   - Can Reject → MOC sent back to Contractor
4. HSE can update the item status to Approved/Rejected.
5. Contractor can view items and see status updates.

## 10 QA Test Cases
1. Contractor can create a Draft MOC.
2. Contractor cannot edit a Submitted MOC.
3. HSE can view all items.
4. HSE can approve or reject MOC items.
5. PTW can only be issued after MOC is Approved.
6. Unauthorized user cannot access API.
7. Search filter returns correct items by title.
8. Type filter shows only MOC or PTW items.
9. Status filter returns items matching status.
10. Saved message shows after HSE updates status.

```
