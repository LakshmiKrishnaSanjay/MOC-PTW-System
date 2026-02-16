
# MOC-PTW System

MOC-PTW (Management of Change & Permit to Work) System is a web-based application designed to streamline industrial safety processes. It allows users to create, approve, and track work permits and change management requests efficiently, ensuring compliance with safety standards.

## Features

* **User Roles:** HSE, Contractor
* **Management of Change (MOC):** Create request, Submit, and approve changes to operational processes safely.
* **Permit to Work (PTW):** Create after approving MOC, submit, approve, and Job started.
* **HSE Dashboard:** Overview of active works started, view all contractors, view all items and view requests.
* **Contractor Dashboard:** Overview of active works started, create MOC, view MOC, submit MOC and approve PTW.
* **Search & Filter:** Quickly find contractors and items by type, status, or user.

## Tech Stack

* **Frontend & Backend:** [Next.js](https://nextjs.org)
* **Database:** MongoDB
* **Authentication:** JWT
* **Styling:** Tailwind CSS
* **API:** RESTful API routes via Next.js `pages/api`


### Prerequisites

* Node.js >= 18.x
* npm

### Run the Development Server

```
# Frontend
npm run dev

# Backend
node server.js

```

### Environment Variables

Create a `.env.local` file in frontend folder and paste

NEXT_PUBLIC_API_URL=http://localhost:5000/api

## Workflow
1. Contractor logs in and creates an **MOC item** in Draft status.
2. Contractor submits the MOC (status: Submitted).
3. HSE Manager reviews the MOC:
   - Can Approve → MOC status updated to accepted. PTW can be issued for actual work
   - Can Reject → MOC status updated to rejected.
4. HSE can view all the item and contractors and can filter them based on type,status and username.
5. Contractor can view items and see status updates.

## 10 QA Test Cases
1. Contractor can create a Draft MOC.
2. Contractor cannot edit a Submitted MOC.
3. HSE can view all items.
4. HSE can approve or reject MOC items.
5. PTW can only be issued after MOC is Approved by HSE.
6. Unauthorized user cannot access API.
7. Search filter returns correct items by title.
8. Type filter shows only MOC or PTW items.
9. Status filter returns items matching status.
10. Saved message shows after HSE updates status.

```
