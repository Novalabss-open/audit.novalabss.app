# Website Accessibility Checker - Roadmap

## 🎯 Objetivo

Crear herramienta **gratuita** de análisis WCAG que genere **5-20 leads/semana** para NovaLabs mediante sistema de **"email gate"**: preview gratis → email para desbloquear reporte completo + historial.

**Estrategia:**
- SEO orgánico: "revisar accesibilidad web gratis"
- Lead capture de baja fricción (solo email, sin password)
- SQLite para registro (soporta 2k+ usuarios fácil)
- No email automation (sin recursos, solo DB local)

## 📊 Resultado Esperado

**App funcional:**
- ✅ Next.js 15 + Tailwind v4 + shadcn/ui (violet-bloom)
- ✅ Scanner: Puppeteer + axe-core (WCAG 2.1 AA/AAA)
- ✅ Score 0-100 + preview (desbloqueado) → email gate → full report
- ✅ SQLite: 2 tablas (users + scans historial)
- ✅ Passwordless auth (solo email en localStorage)
- ✅ PageSpeed 95+, Accessibility 100, SEO optimizado
- ✅ Production-ready en Vercel

**Conversión esperada:**
- Preview → Email Gate: 50-70% (ven valor antes de dar email)
- Email Form → Submit: 80-90% (súper simple, solo 2 campos requeridos)
- Overall: 40-60% (excelente)

---

## 🗺️ Roadmap (13 Fases)

### FASE 1: Foundation Setup
1. `pnpm create next-app@latest access-checker --ts --tailwind --eslint --app`
2. `pnpm add -D tailwindcss@next @tailwindcss/postcss@next`
3. Configurar PostCSS: `export default { plugins: { '@tailwindcss/postcss': {} } }`
4. `app/globals.css`: `@import "tailwindcss"`
5. `pnpm dlx shadcn@latest init` (config: "" para v4)
6. Aplicar tema violet-bloom en globals.css
7. Setup carpetas: `lib/`, `components/`, `types/`, `data/`
8. Git init + .gitignore (agregar `/data/*.db`)

**Entregable:** Proyecto base con Tailwind v4 + shadcn

---

### FASE 2: Core Scanner Engine
1. `pnpm add puppeteer axe-core @sparticuz/chromium`
2. `lib/accessibility/scanner.ts`:
   - Launch browser headless
   - Navigate URL (timeout 30s)
   - Inject axe-core
   - Run WCAG 2.1 AA + AAA
3. `lib/accessibility/score-calculator.ts`:
   - Base: 100
   - Critical: -10, Serious: -5, Moderate: -3, Minor: -1
4. `lib/accessibility/types.ts`: TypeScript interfaces
5. `lib/rate-limit.ts`: 5 requests/min por IP

**Entregable:** Scanner funcional + scoring

---

### FASE 3: API Endpoint
1. `app/api/check/route.ts`:
   ```typescript
   export async function POST(request: Request) {
     // 1. Validate URL
     // 2. Check rate limit
     // 3. Run scanner
     // 4. Calculate score
     // 5. Return JSON
   }
   ```
2. Response: `{ url, score, violations[], summary: { critical, serious, ... } }`
3. Error handling: 400, 408, 429, 500

**Entregable:** API `/api/check` funcional

---

### FASE 4: SQLite Database Setup
1. `pnpm add better-sqlite3 @types/better-sqlite3`
2. Crear `lib/db/schema.sql`:
   ```sql
   CREATE TABLE users (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     email TEXT UNIQUE NOT NULL,
     name TEXT NOT NULL,
     whatsapp TEXT,
     has_website BOOLEAN,
     website_url TEXT,
     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
     last_seen DATETIME,
     total_scans INTEGER DEFAULT 0
   );

   CREATE TABLE scans (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     user_id INTEGER NOT NULL,
     url TEXT NOT NULL,
     score INTEGER NOT NULL,
     violations_count INTEGER NOT NULL,
     critical_count INTEGER DEFAULT 0,
     serious_count INTEGER DEFAULT 0,
     moderate_count INTEGER DEFAULT 0,
     minor_count INTEGER DEFAULT 0,
     violations_json TEXT,
     scanned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
     FOREIGN KEY (user_id) REFERENCES users(id)
   );

   CREATE INDEX idx_users_email ON users(email);
   CREATE INDEX idx_scans_user_id ON scans(user_id);
   ```
3. `lib/db/client.ts`: SQLite connection + schema init
4. `lib/db/users.ts`: CRUD operations
   ```typescript
   checkUserExists(email): User | null
   createUser(data): userId
   updateLastSeen(userId)
   ```
5. `lib/db/scans.ts`: Save scans + get history
   ```typescript
   saveScan(userId, scanData)
   getUserScans(userId, limit)
   ```

**Entregable:** SQLite funcional con 2 tablas

---

### FASE 5: Home Page
1. `app/page.tsx`: Hero + form
2. `components/home/Hero.tsx`:
   - H1: "Analiza la Accesibilidad de Tu Sitio Web Gratis"
   - Subheadline: "Descubre problemas WCAG en 30 segundos"
3. `components/home/CheckerForm.tsx`:
   - Input URL con validación
   - Loading states: "Escaneando..." → "Evaluando..." → "Generando..."
4. `components/home/HowItWorks.tsx`: 3 pasos
5. `components/home/WhyAccessibility.tsx`: Beneficios
6. `components/shared/Footer.tsx`: NovaLabs branding
7. `pnpm dlx shadcn@latest add button input card badge`

**Entregable:** Landing page funcional

---

### FASE 6: Preview Modal + Email Gate
1. `components/results/PreviewModal.tsx`:
   - **DESBLOQUEADO:** Score visual, summary counts, top 3 issues (títulos)
   - **BLOQUEADO:** Full violations list (blur effect)
   - CTA: "🔓 Desbloquea el reporte completo"
2. `components/results/EmailGateModal.tsx`:
   - Formulario minimalista:
     - Email (required)
     - Nombre (required)
     - WhatsApp (optional)
     - ¿Tienes sitio web? [Sí/No] + URL input (optional)
   - Micro-copy: "Solo guardamos tu progreso"
   - Privacy note: "🔒 No spam"
3. localStorage logic:
   ```typescript
   // Después de submit exitoso:
   localStorage.setItem('userEmail', email);

   // Auto-login en próxima visita:
   const cachedEmail = localStorage.getItem('userEmail');
   if (cachedEmail) {
     const user = await checkUserExists(cachedEmail);
     if (user) setCurrentUser(user);
   }
   ```
4. `pnpm dlx shadcn@latest add dialog form label radio-group`

**Entregable:** Email gate + passwordless auth

---

### FASE 7: Auth API Endpoints
1. `app/api/auth/check-email/route.ts`:
   ```typescript
   POST: { email } → { exists: boolean, user?: User }
   ```
2. `app/api/auth/register/route.ts`:
   ```typescript
   POST: { email, name, whatsapp?, hasWebsite?, websiteUrl? }
   → { success: true, user: User }
   ```
3. Validaciones: email formato, nombre no vacío

**Entregable:** Auth endpoints funcionales

---

### FASE 8: Full Results Page
1. `app/results/page.tsx`: Protected route (requiere email)
2. `components/results/ScoreCard.tsx`:
   - Score 0-100 con gauge
   - Color: 90+ verde, 70-89 amarillo, 50-69 naranja, <50 rojo
3. `components/results/ViolationsList.tsx`:
   - Tabs: Todos | Crítico | Serio | Moderado | Menor
4. `components/results/ViolationCard.tsx`:
   - Título, severity badge, WCAG criterion
   - Elementos afectados (expandable)
   - Fix guide inline
   - Código before/after
5. `components/results/ScanHistory.tsx`: Últimos 10 scans del usuario
6. CTA final: "¿Necesitas ayuda profesional?" → NovaLabs
7. `pnpm dlx shadcn@latest add tabs accordion separator`

**Entregable:** Results page completa

---

### FASE 9: Scans API + History
1. `app/api/scans/save/route.ts`:
   ```typescript
   POST: { userId, scanResults } → { success: true, scanId }
   ```
2. `app/api/scans/history/route.ts`:
   ```typescript
   GET: ?userId=X → { scans: Scan[] }
   ```
3. Trigger save después de email gate submit
4. Mostrar history en results page

**Entregable:** Historial funcional

---

### FASE 10: Fix Guides (Español)
`lib/accessibility/fix-guides.ts` con top 10:

1. **color-contrast**: Contraste insuficiente
2. **image-alt**: Imágenes sin alt
3. **label**: Forms sin labels
4. **link-name**: Links sin texto
5. **button-name**: Botones sin nombre
6. **html-has-lang**: Sin atributo lang
7. **heading-order**: Headings desordenados
8. **aria-roles**: ARIA incorrecto
9. **duplicate-id**: IDs duplicados
10. **form-field-multiple-labels**: Labels duplicados

Estructura:
```typescript
{
  title, wcagCriterion, whatIsIt, whyItMatters,
  howToFix: string[], codeExample: { before, after }
}
```

**Entregable:** Guías completas español

---

### FASE 11: SEO Optimization
1. `app/layout.tsx`:
   ```typescript
   metadata: {
     title: 'Revisar Accesibilidad Web Gratis | WCAG 2.1',
     description: 'Analiza accesibilidad de tu sitio...',
     keywords: ['accesibilidad web', 'WCAG', 'revisar gratis']
   }
   ```
2. JSON-LD structured data (SoftwareApplication)
3. `app/sitemap.ts` + `app/robots.ts`
4. Content optimizado keywords español

**Entregable:** SEO completo

---

### FASE 12: Performance + Testing
1. Next.js Image para logos
2. `next/font/google` para Plus Jakarta Sans
3. Dynamic imports: `const Modal = dynamic(() => import('./Modal'))`
4. Server Components donde sea posible
5. Lighthouse: target 95+
6. Manual testing:
   - Happy path: scan → preview → email → results → history
   - Returning user: auto-login
   - Error paths: invalid URL, timeout, rate limit
   - Cross-browser: Chrome, Firefox, Safari, Edge
   - Responsive: 375px, 768px, 1280px

**Entregable:** App optimizada y testeada

---

### FASE 13: Deployment + Admin
1. Vercel deployment
2. Environment variables:
   ```
   RATE_LIMIT_REQUESTS=5
   RATE_LIMIT_WINDOW=60000
   NEXT_PUBLIC_GA_ID=...
   ```
3. `/data/app.db` persiste en Vercel (built into deployment)
4. Admin panel básico: `app/admin/users/page.tsx`
   - Lista de usuarios con filtros
   - Stats: total users, total scans, avg scans/user
   - CSV export:
     ```bash
     sqlite3 data/app.db -csv -header "SELECT * FROM users" > users.csv
     ```
5. Optional: Google Sheets sync (post-MVP)
6. Monitoring: Vercel logs + UptimeRobot

**Entregable:** App live + admin panel

---

## ⭐ Features Clasificadas

### ✅ MUST-HAVE (MVP)
- [ ] URL validation + scanner (Puppeteer + axe-core)
- [ ] Score 0-100 calculation
- [ ] Preview modal (score + top 3, bloqueado resto)
- [ ] Email gate modal (email, nombre, whatsapp opt, sitio opt)
- [ ] SQLite: 2 tablas (users + scans)
- [ ] Passwordless auth (localStorage + email check)
- [ ] Full results con severity tabs
- [ ] Fix guides top 10 español
- [ ] Scan history (últimos 10 del usuario)
- [ ] Responsive mobile/tablet/desktop
- [ ] Error handling completo
- [ ] SEO: meta tags + structured data
- [ ] PageSpeed 95+, Accessibility 100
- [ ] Admin: lista users + CSV export

### 🌟 NICE-TO-HAVE (Post-MVP)
- [ ] Comparación temporal ("mejoró desde último scan")
- [ ] Lead qualification adicional (industria, visitantes/mes)
- [ ] Google Sheets sync automático
- [ ] Multiple page scanning (5 páginas)
- [ ] Lighthouse integration
- [ ] Competitor comparison
- [ ] Admin dashboard con gráficas
- [ ] A/B testing framework
- [ ] Social sharing badges
- [ ] Dark mode toggle
- [ ] Email notifications (si hay recursos después)

### 🚀 FUTURE (Monetización)
- [ ] Freemium: 1 scan/mes gratis, $29/mes unlimited
- [ ] Agency plan: $299/mes whitelabel
- [ ] Enterprise API: $499/mes
- [ ] "Fix it for me" service: $1,500-$5,000
- [ ] Monitoring continuo + alertas
- [ ] Team collaboration
- [ ] GitHub/Slack integrations

---

## 🛠️ Stack Técnico

```yaml
Frontend:
  - Next.js 15.2+ (App Router)
  - React 19
  - TypeScript 5.3+ (strict)
  - Tailwind CSS v4 (CSS-first, @import)
  - shadcn/ui (violet-bloom)
  - Fonts: Plus Jakarta Sans, Lora, IBM Plex Mono
  - Icons: lucide-react

Backend:
  - Puppeteer + @sparticuz/chromium
  - axe-core 4.8+ (WCAG 2.1 AA/AAA)
  - Next.js Route Handlers

Database:
  - better-sqlite3 (local SQLite)
  - 2 tablas: users + scans
  - Soporta 2k+ usuarios fácil
  - CSV export para backup

Auth:
  - Passwordless (solo email)
  - localStorage para session
  - No JWT, no cookies (ultra simple)

Analytics:
  - Google Analytics 4 (opcional)
  - Vercel Analytics

Monitoring:
  - Vercel Dashboard
  - UptimeRobot

Tools:
  - pnpm
  - ESLint
```

---

## 📁 Estructura de Archivos

```
access-checker/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                   # Home
│   ├── globals.css                # Tailwind v4
│   ├── results/page.tsx           # Protected: full results
│   ├── admin/
│   │   └── users/page.tsx         # Admin: lista + export
│   ├── api/
│   │   ├── check/route.ts         # POST: scan URL
│   │   ├── auth/
│   │   │   ├── check-email/route.ts
│   │   │   └── register/route.ts
│   │   └── scans/
│   │       ├── save/route.ts
│   │       └── history/route.ts
│   ├── sitemap.ts
│   └── robots.ts
│
├── components/
│   ├── home/
│   │   ├── Hero.tsx
│   │   ├── CheckerForm.tsx
│   │   ├── HowItWorks.tsx
│   │   └── WhyAccessibility.tsx
│   ├── results/
│   │   ├── PreviewModal.tsx       # 🔑 Preview + unlock
│   │   ├── EmailGateModal.tsx     # 🔑 Email capture
│   │   ├── ScoreCard.tsx
│   │   ├── ViolationsList.tsx
│   │   ├── ViolationCard.tsx
│   │   ├── FixGuide.tsx
│   │   └── ScanHistory.tsx        # Historial usuario
│   ├── shared/
│   │   ├── Footer.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── ErrorMessage.tsx
│   └── ui/                        # shadcn
│
├── lib/
│   ├── accessibility/
│   │   ├── scanner.ts
│   │   ├── score-calculator.ts
│   │   ├── fix-guides.ts
│   │   └── types.ts
│   ├── db/
│   │   ├── schema.sql             # CREATE TABLE
│   │   ├── client.ts              # SQLite connection
│   │   ├── users.ts               # User CRUD
│   │   └── scans.ts               # Scan CRUD
│   ├── analytics.ts
│   ├── rate-limit.ts
│   └── utils.ts
│
├── types/
│   ├── accessibility.ts
│   ├── user.ts
│   └── api.ts
│
├── data/
│   └── app.db                     # SQLite (gitignored)
│
├── public/
│   ├── novalabs-logo.svg
│   ├── og-image.png
│   └── favicon.ico
│
├── .env.local
├── .env.example
├── .gitignore                     # Incluir /data/*.db
├── components.json                # shadcn (config: "")
├── postcss.config.mjs
├── tsconfig.json
├── next.config.ts
├── package.json
├── ROADMAP.md
└── README.md
```

---

## ⚙️ Tailwind v4 Setup

**❌ NO crear `tailwind.config.js`**

### postcss.config.mjs
```javascript
export default {
  plugins: { '@tailwindcss/postcss': {} },
};
```

### app/globals.css
```css
@import "tailwindcss";

@theme {
  --font-sans: Plus Jakarta Sans, sans-serif;
  --radius: 1.4rem;
}

@layer base {
  :root {
    --background: #fdfdfd;
    --foreground: #000000;
    --primary: #7033ff;           /* Violet Bloom */
    --primary-foreground: #ffffff;
    --secondary: #edf0f4;
    --accent: #e2ebff;
    --destructive: #e54b4f;
    --border: #e7e7ee;
  }

  .dark {
    --background: #1a1b1e;
    --primary: #8c5cff;
    --border: #33353a;
  }

  * { @apply border-border; }
  body { @apply bg-background text-foreground; }
}
```

### components.json
```json
{
  "tailwind": {
    "config": "",                  // ← VACÍO para v4
    "css": "app/globals.css",
    "cssVariables": true
  }
}
```

---

## 🎨 UX Flow Detallado

### 1. Primera Visita (Sin email guardado)
```
User ingresa URL → Scan inicia → Loading (15s)
↓
Preview Modal aparece:
  ✅ Score: 67/100 (desbloqueado)
  ✅ Summary: 23 problemas encontrados (desbloqueado)
  ✅ Top 3 críticos: títulos (desbloqueado)
  🔒 Resto bloqueado (blur effect)

  CTA: "🔓 Desbloquea reporte completo"
↓
Email Gate Modal:
  - Email (required)
  - Nombre (required)
  - WhatsApp (optional)
  - ¿Sitio web? (optional)

  Submit → Guardar en SQLite
↓
localStorage.setItem('userEmail', email)
↓
Redirect a /results → Full report desbloqueado
```

### 2. Returning User (Email en localStorage)
```
Page load → Check localStorage
↓
cachedEmail found → API call: /api/auth/check-email
↓
User exists → setCurrentUser(user)
↓
User ingresa nueva URL → Scan
↓
Results directamente (sin email gate)
↓
History sidebar: "Tus últimos scans"
```

### 3. Contenido Desbloqueado vs Bloqueado

**Sin email (Preview):**
- ✅ Score visual (0-100)
- ✅ Gauge con color coding
- ✅ Count por severity (X críticos, Y serios, etc.)
- ✅ Top 3 issues: solo títulos
- 🔒 Lista completa de violations (blur)
- 🔒 Fix guides (blur)
- 🔒 Código ejemplos (blur)

**Con email (Full):**
- ✅ Todo lo anterior
- ✅ Lista completa de violations
- ✅ Detalles por violation
- ✅ Fix guides paso a paso
- ✅ Código before/after
- ✅ Historial de scans
- ✅ Comparación temporal (si re-scan)

---

## 🗄️ Database Schema

```sql
-- Tabla 1: users
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  whatsapp TEXT,
  has_website BOOLEAN,
  website_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
  total_scans INTEGER DEFAULT 0
);

-- Tabla 2: scans
CREATE TABLE scans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  url TEXT NOT NULL,
  score INTEGER NOT NULL,
  violations_count INTEGER NOT NULL,
  critical_count INTEGER DEFAULT 0,
  serious_count INTEGER DEFAULT 0,
  moderate_count INTEGER DEFAULT 0,
  minor_count INTEGER DEFAULT 0,
  violations_json TEXT,
  scanned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Índices
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_scans_user_id ON scans(user_id);
CREATE INDEX idx_scans_scanned_at ON scans(scanned_at DESC);
```

**Queries principales:**
```sql
-- Check email
SELECT * FROM users WHERE email = ?;

-- Nuevo usuario
INSERT INTO users (email, name, whatsapp, has_website, website_url)
VALUES (?, ?, ?, ?, ?);

-- Guardar scan
INSERT INTO scans (user_id, url, score, violations_json, ...)
VALUES (?, ?, ?, ?, ...);

-- Historial
SELECT * FROM scans
WHERE user_id = ?
ORDER BY scanned_at DESC
LIMIT 10;

-- Stats admin
SELECT
  COUNT(*) as total_users,
  SUM(total_scans) as total_scans
FROM users;
```

---

## ✅ Criterios de Éxito

### Performance
- PageSpeed: 95+ (mobile y desktop)
- FCP: < 1.5s, LCP: < 2.5s, TTI: < 3s
- Lighthouse Accessibility: 100/100

### SEO
- Ranking "revisar accesibilidad web gratis": Top 10 (3 meses)
- Organic traffic: 500+/mes (6 meses)

### Conversion (Mejorado con email gate)
- Preview → Email Gate: 50-70%
- Email Gate → Submit: 80-90%
- Overall: 40-60% (vs 15-25% anterior)

### Lead Generation
- Volumen: 5-20 leads/semana
- Email valid: >95%
- Data completa: 60%+ (nombre + whatsapp + sitio)

### Technical
- Uptime: 99.9%
- Scan time: < 15s
- SQLite: < 10MB para 2k usuarios

---

**Versión:** 2.0 | **Fecha:** 2025-11-18 | **Líneas:** 699
