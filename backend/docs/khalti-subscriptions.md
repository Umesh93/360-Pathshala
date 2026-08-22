# Khalti KPG-2 subscriptions

## Configuration

Set `KHALTI_ENABLED=true`, `KHALTI_SECRET_KEY`, `KHALTI_BASE_URL`, `KHALTI_WEBSITE_URL`, and `KHALTI_RETURN_URL`. Keep the secret in the deployment environment. Sandbox and production use the same server-side contract; change the provider URL and key together.

## API

- `GET /api/admin/subscriptions/plans`
- `GET /api/admin/subscriptions/current`
- `GET /api/admin/subscriptions/payments`
- `POST /api/admin/subscriptions/payment/initiate` with `{ "planId": 1 }`
- `GET /api/admin/subscriptions/payments/{id}`
- `POST /api/admin/subscriptions/payments/{id}/refresh`
- `GET /api/payments/khalti/callback?pidx=...` is public and redirects to the configured website result page.
- Superadmins use `GET /api/saas/payments`, `GET /api/saas/subscriptions`, and the existing `/api/saas/plans` management endpoints.

## Flow

The backend creates a pending subscription and local order before contacting Khalti. Verification always performs a server-side lookup and validates `pidx`, paisa amount, and purchase order ID. Completed payments activate immediately when no paid subscription is current, otherwise they create a scheduled renewal. Repeated callbacks are idempotent.

## Troubleshooting

- HTTP 503 means Khalti is disabled or its key/URLs are not ready.
- Amount or order mismatch means the provider lookup did not match the immutable local transaction.
- A pending payment can be refreshed from the authenticated school-admin endpoint.
- Never log or expose the Khalti secret or authorization header.
