# Website Accessibility Checker

Herramienta gratuita de análisis de accesibilidad web que genera leads para NovaLabs mediante sistema de "email gate".

## 🚀 Stack Técnico

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS v4 + shadcn/ui (violet-bloom theme)
- **Scanner:** Puppeteer + axe-core (WCAG 2.1 AA/AAA)
- **Database:** SQLite (better-sqlite3)
- **Auth:** Passwordless (email + localStorage)
- **Package Manager:** pnpm

## 📋 Prerequisitos

- Node.js 20+
- pnpm 10+

## 🛠️ Setup

1. **Instalar dependencias:**
   ```bash
   pnpm install
   ```

2. **Configurar variables de entorno:**
   ```bash
   cp .env.example .env.local
   ```

3. **Iniciar servidor de desarrollo:**
   ```bash
   pnpm dev
   ```

4. **Abrir en navegador:**
   ```
   http://localhost:3000
   ```

## 📁 Estructura del Proyecto

```
access-checker/
├── app/                    # Next.js App Router
│   ├── api/               # API endpoints
│   ├── results/           # Results page
│   └── admin/             # Admin panel
├── components/            # React components
│   ├── home/             # Home page components
│   ├── results/          # Results components
│   ├── shared/           # Shared components
│   └── ui/               # shadcn/ui components
├── lib/                   # Core logic
│   ├── accessibility/    # Scanner + scoring
│   ├── db/               # SQLite operations
│   └── email/            # Email templates
├── types/                 # TypeScript types
└── data/                  # SQLite database
```

## 🗄️ Base de Datos

El proyecto usa SQLite con 2 tablas:
- **users**: Registro de usuarios (email, nombre, whatsapp, sitio)
- **scans**: Historial de análisis por usuario

La base de datos se crea automáticamente en `data/app.db` al iniciar.

## 🔧 Scripts Disponibles

- `pnpm dev` - Inicia servidor de desarrollo
- `pnpm build` - Build para producción
- `pnpm start` - Inicia servidor de producción
- `pnpm lint` - Ejecuta ESLint

## 📖 Documentación

Ver [ROADMAP.md](./ROADMAP.md) para plan completo de implementación.

## 🎨 Tema

Usando tema **violet-bloom** customizado:
- Primary color: `#7033ff` (purple)
- Radius: `1.4rem` (rounded)
- Fonts: Plus Jakarta Sans, Lora, IBM Plex Mono

## 📄 Licencia

MIT

---

**Hecho con 💜 por NovaLabs**
