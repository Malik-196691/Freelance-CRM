# Freelance CRM

A comprehensive Customer Relationship Management (CRM) and project management tool designed specifically for freelancers. Manage clients, track projects with a Kanban board, generate professional PDF invoices, and monitor your business analytics—all in one place.

## Features

- **📊 Dashboard & Analytics**: Get a bird's-eye view of your business with revenue tracking, active projects count, and client statistics.
- **👥 Client Management**: Easily add, edit, and simple delete clients. Keep all your client details organized.
- **📁 Project Management**: A dynamic Kanban board to track project progress (Todo, In Progress, Review, Done). Drag and drop support for seamless workflow.
- **🧾 Invoice Generator**: Create and send professional PDF invoices. Download them instantly or send them via email (integration ready).
- **🔐 Secure Authentication**: Built-in authentication using NextAuth with support for Email/Password, Google, and GitHub login.
- **⚙️ Settings**: Customize your profile and application preferences.
- **🎨 Modern UI**: A sleek, dark/light mode supported interface built with Shadcn/UI and Tailwind CSS.

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [Shadcn/UI](https://ui.shadcn.com/)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Authentication**: [NextAuth.js v5](https://authjs.dev/)
- **State Management**: React Query (Likely via Supabase hooks or similar pattern), Local State
- **Drag & Drop**: [dnd-kit](https://dndkit.com/)
- **Charts**: [Recharts](https://recharts.org/)
- **PDF Generation**: [pdf-lib](https://pdf-lib.js.org/)
- **Icons**: [Lucide React](https://lucide.dev/)

## Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- Node.js 18+ installed
- A Supabase account

### Installation

1.  **Clone the repository**

    ```bash
    git clone https://github.com/your-username/freelance-crm.git
    cd freelance-crm
    ```

2.  **Install dependencies**

    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

3.  **Set up Environment Variables**

    Create a `.env.local` file in the root directory and add the following keys:

    ```env
    # Supabase - Get these from your Supabase Project Settings
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

    # NextAuth - Generate a secret with `openssl rand -base64 32`
    AUTH_SECRET=your_auth_secret

    # OAuth Providers (Optional, if you want to use Social Login)
    AUTH_GITHUB_ID=your_github_client_id
    AUTH_GITHUB_SECRET=your_github_client_secret
    AUTH_GOOGLE_ID=your_google_client_id
    AUTH_GOOGLE_SECRET=your_google_client_secret
    ```

4.  **Database Setup**

    Go to your Supabase SQL Editor and run the content of `src/lib/schema.sql`. This will create the necessary tables (`users`, `clients`, `projects`, `invoices`, etc.) and set up Row Level Security (RLS) policies.

5.  **Run the Development Server**

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── src
│   ├── app          # Next.js App Router pages and API routes
│   │   ├── dashboard # Dashboard features (Analytics, CRM, Projects, Invoices)
│   │   ├── login     # Authentication pages
│   │   └── api       # Backend API endpoints
│   ├── components   # Reusable UI components (Shadcn, Custom)
│   ├── lib          # Utilities, Supabase client, Schema
│   └── types        # TypeScript definitions
├── public           # Static assets
└── package.json     # Project dependencies
```

## Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.
