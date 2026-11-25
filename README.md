# Cinderella Printing

### Bringing Print Ideas to Life.

Cinderella Printing is a web development project focused on building a modern company profile and digital product catalog for a printing business.

The website is designed to help customers discover printing services, explore available products, understand product specifications, and prepare their consultation requests through an intuitive and accessible digital experience.

## About the Project

This project aims to establish a digital presence for Cinderella Printing by providing an informative platform where customers can learn about the company and explore its printing services.

With a clean interface and structured navigation, customers can browse product categories, view detailed product information, submit their requirements through a consultation form, and continue the discussion directly with the business.

## Key Features

- **Company Profile** — Introduces Cinderella Printing, its identity, and services.
- **Guided Product Discovery** — Helps customers find products based on their needs.
- **Digital Product Catalog** — Displays available printing products in an organized catalog.
- **Product Details** — Provides additional information and specifications for each product.
- **Consultation Form** — Allows customers to communicate their product requirements.
- **Consultation Summary** — Presents a summary of customer requirements before continuing the consultation.
- **Portfolio** — Showcases previous printing projects and completed works.
- **FAQ & Contact** — Provides answers to common questions and contact information.

## User Experience

The website follows a customer-oriented journey:

1. Discover available printing products.
2. Browse product categories and details.
3. Specify requirements through the consultation form.
4. Review the consultation summary.
5. Continue the consultation through WhatsApp.

The website serves as an information and consultation platform. It does not include an online checkout or payment gateway.

## Tech Stack

- **Next.js** — React framework for web application development.
- **React** — Library for building user interfaces.
- **TypeScript** — Provides static typing and improved code reliability.
- **Tailwind CSS** — Utility-first CSS framework for styling.
- **PostgreSQL on Supabase** — Central database for the catalog, customers, orders, payments, and invoices.
- **Supabase Auth and Storage** — Admin authentication and catalog image storage.

## Backend Setup (Windows)

The API runs in this Next.js project at `/api/v1`. Copy `.env.example` to `.env`, then fill in `DATABASE_PASSWORD` from your Supabase project and the server-only secret key. The session-pooler host, project URL, and publishable key are already filled in. Keep `.env` on this device and never add it to Git.

```powershell
npm.cmd ci
Copy-Item .env.example .env
# Fill in .env locally, then:
npm.cmd run db:migrate
npm.cmd run setup:check
npm.cmd run dev
```

The API is available at `http://localhost:3000/api/v1`; its generated OpenAPI document is at `http://localhost:3000/api/v1/openapi.json`. Before the first admin login, create the admin account with `npm.cmd run admin:create -- --email EMAIL --name "Admin Cinderella" --role owner`. The CLI prompts for its password without showing the input.

The public catalog reads active products and categories from Supabase. Manage catalog entries and images in the admin panel. See [docs/BACKEND-SETUP.md](docs/BACKEND-SETUP.md) for setup, catalog publishing, and the order and invoice workflow.

## Getting Started

Follow these steps to run the project locally.

### Prerequisites

Make sure you have the following installed:

- Node.js
- npm
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/arceliaLuneth/cinderella-printing.git
```

### 2. Navigate to the Project Directory

```bash
cd cinderella-printing
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to access the application.

## Project Structure

The project is organized to support a modular and maintainable frontend development workflow.

```text
cinderella-printing/
├── public/
├── src/
│   └── app/
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

## Project Status

**Under Development**

The public site and admin interface are under active development. The PostgreSQL/Supabase API and its SQL migration are included in this repository.

## Project Scope

This project is developed collaboratively with separate frontend and backend responsibilities.

The frontend scope focuses on:

- User interface development.
- Responsive web design.
- Page layouts and reusable components.
- Client-side interactions.
- User experience and navigation.
- Backend API integration.

## Acknowledgements

Developed as part of an academic consulting and web development project for Cinderella Printing, with the goal of improving its digital presence and customer experience.

---

<p align="center">
  <strong>Cinderella Printing</strong><br/>
  <em>Bringing Print Ideas to Life.</em>
</p>
