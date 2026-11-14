# FbPitch

**A football-jersey e-commerce storefront built with Next.js, TypeScript, and MongoDB.**

FbPitch is a full-stack storefront project with customer-facing product and cart pages, account flows, an admin area, and API routes for product and order management. The repository also contains integrations for image storage, PayPal, email notifications, and Google Sheets order export.

## Features

- Browse the product catalogue and view individual product pages.
- Configure product options supported by the storefront, including size and other item customisations.
- Use the shopping cart and the PayPal client integration.
- Register and sign in through the account API routes.
- Manage products through the admin interface and product API.
- Create and retrieve orders through the order API.
- Upload product images through Cloudinary.
- Send admin order notifications through Nodemailer.
- Append order information to a Google Sheets workbook.
- Use supporting API routes for users, notifications, statistics, and admin verification.

> **Project status:** Student-built application. Configure and test each external service in your own development environment before relying on it for live orders. This README documents the checked-in implementation; it is not a claim of a production security or payment audit.

## Technology

| Area | Technologies |
|---|---|
| Application | Next.js 14, React 18, TypeScript |
| UI | Tailwind CSS, Radix UI, shadcn-style components, Framer Motion |
| Data | MongoDB, Mongoose, MongoDB Node.js driver |
| Authentication | JSON Web Tokens |
| Payments | PayPal React integration |
| Media | Cloudinary |
| Order operations | Google Sheets API, Nodemailer |
| Tooling | npm, ESLint/Next lint, TypeScript |

## Application structure

```text
app/
├── page.tsx                 # Storefront
├── products/[id]/           # Product details
├── cart/                    # Cart and payment flow
├── login/                   # Sign-in
├── signup/                  # Account creation
├── admin/                   # Admin product management
└── api/
    ├── admin-login/
    ├── login/
    ├── signup/
    ├── products/
    ├── orders/
    ├── users/
    ├── notifications/
    ├── stats/
    ├── upload/
    └── verify-admin/
components/                  # Shared UI and application components
contexts/                    # React contexts
lib/
├── models/                  # MongoDB/Mongoose models
├── dbConnect.ts             # Database connection
├── mongodb.ts               # MongoDB client
├── cloudinary.ts            # Server-side media integration
├── googleSheets.ts          # Order export integration
└── mailer.ts                # Admin email notification
styles/                      # Global styles
public/                      # Static assets and product imagery
```

## Run locally

### Requirements

- Node.js and npm
- A MongoDB connection string
- Service credentials for any integrations you intend to enable

### 1. Clone the repository

```bash
git clone https://github.com/i803/Fbpitch.git
cd Fbpitch
npm install
```

### 2. Configure environment variables

Create a local environment file from the template:

```bash
cp .env.example .env.local
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Replace the example values with credentials from your own services. See the environment-variable reference below.

### 3. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Check a production build

```bash
npm run lint
npm run build
```

The current `package.json` does not define a dedicated automated test script yet.

## Environment variables

The repository reads the following configuration values. Keep secret values in your local environment or deployment secret manager; never commit `.env.local`.

| Variable | Purpose | Exposure |
|---|---|---|
| `MONGODB_URI` | MongoDB connection string | Server secret |
| `JWT_SECRET` | Signs and verifies authentication tokens | Server secret |
| `ADMIN_USERNAME` | Admin login username, where configured | Server-side configuration |
| `ADMIN_PASSWORD` | Admin login password, where configured | Server secret |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account name for server integration | Server configuration |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Server secret |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Server secret |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name used by the browser upload flow | Public |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Cloudinary upload preset used by the browser upload flow | Public; configure the preset with appropriate restrictions |
| `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | PayPal client identifier used by the cart | Public |
| `ADMIN_NOTIFICATION_EMAIL` | Recipient for new-order admin notifications | Server configuration |
| `CONTACT_EMAIL` | Sender account for notification email | Server configuration |
| `CONTACT_EMAIL_PASSWORD` | Email account password or Gmail app password | Server secret |
| `GS_PROJECT_ID` | Google Cloud project ID for Sheets API access | Server configuration |
| `GS_PRIVATE_KEY` | Google service-account private key | Server secret |
| `GS_CLIENT_EMAIL` | Google service-account email | Server configuration |
| `GS_SHEET_ID` | Target Google spreadsheet ID | Server configuration |

For `GS_PRIVATE_KEY`, preserve newline characters. If your deployment stores the key as a single line, use escaped `\\n` sequences as handled by the integration.

Values prefixed with `NEXT_PUBLIC_` are exposed to the browser bundle. Do not put passwords, private keys, database credentials, or API secrets in those variables.

## Integration behaviour

- MongoDB is used for application data and order persistence.
- Cloudinary handles product-image uploads.
- PayPal is integrated into the cart interface; configure the appropriate PayPal client ID for the environment you are testing.
- The order route attempts to send an admin email and append order rows to Google Sheets after creating the order. Those notification/export failures are logged separately and do not roll back the created order.

## Security notes

- Never commit `.env.local`, service-account JSON, private keys, or production credentials.
- Use a strong, unique `JWT_SECRET`.
- Use a restricted Cloudinary upload preset for browser-based uploads.
- Configure admin credentials only in server-side environment variables.
- Test authentication, admin authorisation, order validation, and payment behaviour before deploying.

## Current engineering gaps

- Add automated tests for authentication, product management, order creation, and admin authorisation.
- Add a CI workflow for linting, type checking, tests, and production builds.
- Add a deployment guide with environment-specific configuration.
- Document the database schema and order lifecycle in more detail.

---

Built as a full-stack e-commerce engineering project. See the source tree and API routes for the current implementation.
