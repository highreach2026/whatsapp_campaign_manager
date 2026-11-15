# Complete Meta Setup Checklist for High Reach WhatsApp Campaign Manager   

Follow this master checklist to complete the setup process outlined in `docs/META_SETUP.md`.

---

## Status Overview

- [x] **1. Codebase & Dependencies**: Next.js project structure, Meta API library (`lib/whatsapp.ts`), and Supabase client (`lib/supabase.ts`) ready.
- [x] **2. Supabase SQL Execution**: Executed `supabase/schema.sql` (Tables: `contacts`, `campaigns`, `message_logs` created).
- [x] **3. Local `.env.local` Initialized**: File `.env.local` created from `.env.example`.
- [ ] **4. Credentials Population**: Fill Meta & Supabase secrets into `.env.local`.
- [ ] **5. Meta Message Template**: Template `high_reach_services_intro` created and submitted for approval in WhatsApp Manager.
- [ ] **6. Webhook Setup**: Webhook URL configured in Meta Developer Console.
- [ ] **7. Production Deployment**: Deploy to Vercel and set production environment variables.

---

## Step-by-Step Instructions

### Step 1: Fill Credentials in `.env.local`

Open `g:\highreach-whatsapp-campaign-manager\highreach-whatsapp-campaign-manager\.env.local` and replace the placeholder values:

1. **`SUPABASE_URL`** & **`SUPABASE_SERVICE_ROLE_KEY`**:
   - Go to **Supabase Dashboard > Settings > API**.
   - Copy **URL** -> `SUPABASE_URL`.
   - Copy **service_role secret key** -> `SUPABASE_SERVICE_ROLE_KEY`.

2. **`WHATSAPP_ACCESS_TOKEN`**, **`WHATSAPP_PHONE_NUMBER_ID`**, **`WHATSAPP_WABA_ID`**:
   - Go to **Meta for Developers > My Apps > [Your App] > WhatsApp > API Setup**.
   - Copy **Temporary Access Token** (or System User Token for Production) -> `WHATSAPP_ACCESS_TOKEN`.
   - Copy **Phone number ID** -> `WHATSAPP_PHONE_NUMBER_ID`.
   - Copy **WhatsApp Business Account ID** -> `WHATSAPP_WABA_ID`.

3. **`META_APP_SECRET`**:
   - Go to **Meta for Developers > App Settings > Basic**.
   - Click **Show** next to **App secret** and copy -> `META_APP_SECRET`.

4. **`WHATSAPP_VERIFY_TOKEN`**:
   - Set a long random string of your choice (e.g., `highreach_secret_webhook_verify_2026`).

---

### Step 2: Create Meta Marketing Message Template

1. Go to **WhatsApp Manager > Message Templates** (or click **Create template** under **WhatsApp > API Setup**).
2. Category: **Marketing** | Name: `high_reach_services_intro` | Language: **English**.
3. Copy exact template text from `docs/TEMPLATE_COPY.md`:
   - Header: **Image**
   - Body:
     ```text
     Hi {{1}}, looking for the right creative and growth partner for {{2}}?

     High Reach brings Branding, Marketing, Content, Web, Technology and AI together to help businesses reach higher.

     Reply INTERESTED and we’ll understand what your business needs and suggest the right next step.

     Reply STOP anytime to opt out.
     ```
4. Provide sample values (e.g., `{{1}}` = `John`, `{{2}}` = `Acme Corp`).
5. Submit for approval.

---

### Step 3: Run & Test Locally

```powershell
npm run dev
```

1. Open `http://localhost:3000`.
2. Login with `ADMIN_USERNAME` (`highreach`) and `ADMIN_PASSWORD`.
3. Check the status badge in top right (should display **Connected** when all `.env.local` variables are present).
4. Upload campaign image media and test sending to your opted-in number.

---

### Step 4: Webhook Configuration (Production)

Once deployed to Vercel (or when using ngrok for local testing):

1. **Callback URL**: `https://your-domain.vercel.app/api/webhooks/whatsapp`
2. **Verify token**: Value of `WHATSAPP_VERIFY_TOKEN` from `.env.local`.
3. **Webhook Subscriptions**: Subscribe to **`messages`**.

---

### Step 5: Production Deployment on Vercel

1. Push code to private GitHub repository.
2. Import project into Vercel.
3. Add all variables from `.env.local` in **Vercel Project Settings > Environment Variables**.
4. Deploy!
