# ValueGuides.co E-Commerce System

A complete digital product delivery system with PDF protection, secure checkout, and marketing integration for ValueGuides.co.

## Project Overview

This project is an e-commerce system for selling "The Ultimate Budget Travel Planner" PDF at $17.99 with an upsell product "Secret Travel Technique Bundle" at $77.

### Features

- PDF protection with watermarking and copy protection
- Secure download system with expiry and download limits
- Complete Stripe integration for payments
- Marketing tracking (Google Analytics, Facebook Pixel, TikTok, Pinterest)
- Exit intent popup for email capture
- One-click upsell system

## Project Stack

- **Platform**: Render.com
- **Backend**: Node.js 18+ with Express
- **Frontend**: HTML/CSS/JavaScript (Purple #522888 and Gold #BF9553 theme)
- **Payments**: Stripe with Checkout Session and Webhooks
- **PDF Processing**: pdf-lib for dynamic watermarking
- **Database**: In-memory (with database-ready architecture)
- **Storage**: Local filesystem for PDFs
- **Analytics**: Google Analytics 4, Facebook Pixel, TikTok, Pinterest

## Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/valueguides-app.git
   cd valueguides-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create .env file**
   Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   DOMAIN=localhost:3000
   STRIPE_SECRET_KEY=sk_test_your_test_key
   STRIPE_PUBLISHABLE_KEY=pk_test_your_test_key
   STRIPE_PRICE_ID=price_your_test_price_id
   STRIPE_UPSELL_PRICE_ID=price_your_test_upsell_price_id
   STRIPE_WEBHOOK_SECRET=whsec_your_test_webhook_secret
   PDF_TEMPLATE_PATH=./assets/travel-planner-template.pdf
   DOWNLOAD_EXPIRY_HOURS=24
   MAX_DOWNLOADS=3
   ```

4. **Add the PDF template**
   Add your master PDF file to `assets/travel-planner-template.pdf`

5. **Start the development server**
   ```bash
   npm run dev
   ```

## Deployment to Render.com

1. **Create a new Web Service in Render**
   - Sign up at dashboard.render.com
   - Click "New Web Service"
   - Connect your GitHub repository

2. **Configure the service**
   - Name: valueguides-app
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `node server.js`

3. **Set environment variables**
   - Add all the environment variables from your `.env` file
   - Make sure to use production Stripe keys

4. **Deploy**
   - Click "Create Web Service"
   - Render will automatically deploy your app

5. **Configure custom domain**
   - Go to the "Settings" tab
   - Click "Custom Domains"
   - Add your domain (e.g., valueguides.co)

6. **Set up Stripe Webhook**
   - In your Stripe Dashboard, go to Developers > Webhooks
   - Add a new endpoint: https://yourdomain.com/webhook
   - Select the event: checkout.session.completed
   - Add the webhook secret to your environment variables

## Project Structure

```
valueguides-app/
├── public/                # Static files
│   ├── index.html         # Landing page
│   ├── checkout.html      # Checkout page
│   ├── thank-you.html     # Thank you/download page
│   ├── error.html         # Error page
│   ├── privacy.html       # Legal pages
│   ├── terms.html
│   ├── refund.html
│   ├── report-violation.html
│   └── generated/         # Generated PDFs (created at runtime)
├── src/
│   ├── services/          # Business logic
│   ├── controllers/       # Route handlers
│   ├── middleware/        # Express middleware
│   ├── routes/            # API routes
│   ├── config/            # Configuration
│   └── utils/             # Utilities
├── assets/                # Assets for PDF generation
├── tests/                 # Test files
├── server.js              # Main entry point
├── Dockerfile             # Docker configuration
├── render.yaml            # Render.com configuration
├── .env                   # Environment variables
└── README.md              # Project documentation
```

## Marketing Campaign

To launch the product, the following marketing assets have been prepared:

1. **Email Template** for 30,000 subscribers
2. **Facebook Ad Campaign** targeting travel enthusiasts
3. **Analytics Integration** for tracking conversions

## License

This project is proprietary and confidential. Unauthorized copying or distribution is prohibited.

---

© 2023 ValueGuides. All rights reserved.