# Meta / WhatsApp Business Platform setup for High Reach

This project uses the official WhatsApp Business Platform (Cloud API). Do not connect it through WhatsApp Web automation.

## 1. Prepare the High Reach Meta business account

1. Sign in to Meta Business / Business Portfolio using the account that manages High Reach.
2. Ensure the business information is accurate: High Reach, website, address, business email and legal details.
3. Complete business verification when Meta requests it.
4. Add a valid payment method for WhatsApp Business Platform billing when required.

## 2. Create or open a Meta developer app

1. Go to Meta for Developers.
2. Create a Business app for High Reach, or open the existing High Reach app.
3. Add the **WhatsApp** product.
4. Open **WhatsApp > API Setup**.

For the first test, Meta normally provides a test phone number and temporary access token. Use these first.

## 3. Collect these values

Copy them into `.env.local`:

- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_WABA_ID`
- `META_APP_SECRET` (from the Meta app settings; used to verify webhook signatures)
- `GRAPH_API_VERSION` shown/recommended in the Meta app dashboard

For production, replace the temporary token with the long-lived/system-user token flow provided in Business Settings. Keep the token server-side only.

## 4. Add the High Reach WhatsApp number

Use the phone-number onboarding flow in WhatsApp Manager / the app dashboard.

Important: if the number is already used in the WhatsApp Business app, follow the migration/coexistence options shown for your account. Eligibility and flows can vary. Do not delete or migrate an active business number until you have confirmed the exact flow in your Meta dashboard and backed up anything you need.

## 5. Create the database

1. Create a Supabase project.
2. Open SQL Editor.
3. Paste the contents of `supabase/schema.sql`.
4. Run the SQL.
5. In Supabase Project Settings > API, copy:
   - Project URL -> `SUPABASE_URL`
   - service role key -> `SUPABASE_SERVICE_ROLE_KEY`

Never expose the service-role key in browser code or public repositories.

## 6. Configure the webhook

After deployment, your callback URL is:

`https://YOUR-DOMAIN/api/webhooks/whatsapp`

Set a random webhook verify token in `.env.local` and also add the Meta App Secret:

`WHATSAPP_VERIFY_TOKEN=a-long-random-value`

`META_APP_SECRET=your-meta-app-secret`

In the WhatsApp / Webhooks configuration:

1. Callback URL: the URL above.
2. Verify token: exactly the value in `WHATSAPP_VERIFY_TOKEN`.
3. Subscribe the WhatsApp Business Account to the `messages` webhook field.

The webhook updates sent/delivered/read/failed states and automatically opts a contact out when they send one of these exact replies:

- STOP
- UNSUBSCRIBE
- CANCEL
- OPT OUT
- OPTOUT
- REMOVE

## 7. Create the marketing template

Open WhatsApp Manager > Message Templates and create a **Marketing** template.

Suggested starter:

Template name: `high_reach_services_intro`
Language: English
Header: Image
Body variables: `{{1}}` = name, `{{2}}` = company

Use the copy in `docs/TEMPLATE_COPY.md`.

Submit it for Meta review. Do not try to send the campaign until the template is approved.

If you create the template with no media header, leave media blank in the dashboard. If it has an Image, Video or Document header, upload matching media before sending.

## 8. Local installation

Requirements:

- Node.js 20.9+
- npm

Commands:

```bash
cd highreach-whatsapp-campaign-manager
cp .env.example .env.local
npm install
npm run dev
```

On Windows PowerShell, use:

```powershell
Copy-Item .env.example .env.local
npm install
npm run dev
```

Open:

`http://localhost:3000`

Your browser will ask for the `ADMIN_USERNAME` and `ADMIN_PASSWORD` from `.env.local`.

## 9. First safe test

Do not begin with a large audience.

1. Add your own WhatsApp number as a test recipient / opted-in contact.
2. Put your number in a copy of `sample_contacts.csv`.
3. Keep `opt_in=yes` only because you are explicitly consenting to your own test.
4. Import the CSV.
5. Upload the media that matches the template header.
6. Enter the exact approved template name.
7. Use `name,company` as body variable fields if the approved template uses those two variables.
8. Select your test contact.
9. Send.
10. Confirm that the dashboard receives delivery/read webhook events.
11. Reply `STOP` from the receiving phone and refresh the dashboard. The contact should no longer be campaign-eligible.

## 10. Production deployment

The easiest fit with your existing High Reach stack is Vercel + Supabase.

1. Push this folder to a private GitHub repository.
2. Import the repository into Vercel.
3. Add every `.env.local` value as a Vercel Environment Variable.
4. Deploy.
5. Add the production webhook URL in Meta.
6. Re-run webhook verification.
7. Test with your own number again before sending to real opted-in leads.

## 11. Scale safely

This starter intentionally caps a single campaign send action with `MAX_CAMPAIGN_BATCH` (default 50). This is not an attempt to bypass Meta messaging limits; it is a reliability guard for a simple web request.

Before sending to thousands of recipients, add a durable job queue / worker and pacing based on the official account limits and quality indicators shown in WhatsApp Manager. Do not increase throughput to circumvent platform limits.
