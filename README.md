# Website Accessibility Checker

> Herramienta gratuita de análisis de accesibilidad web WCAG 2.1 con sistema de lead generation mediante email gate.

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

**🔗 Demo en vivo:** [audit.novalabss.app](https://audit.novalabss.app)

## ✨ Características

- ✅ **Escaneo WCAG 2.1 AA/AAA** completo usando Puppeteer + axe-core
- ✅ **Sistema de email gate** para generación de leads
- ✅ **Vista previa gratuita** con 3 problemas visibles
- ✅ **Reporte completo** después de captura de email
- ✅ **100% gratis y self-hosted** (sin costos de API externa)
- ✅ **Scoring automático** (0-100) basado en severidad de violaciones
- ✅ **Persistencia SQLite** para usuarios y scans
- ✅ **Docker-ready** con Dockerfile multi-stage optimizado

## 🚀 Stack Tecnológico

| Tecnología | Versión | Uso |
|------------|---------|-----|
| **Next.js** | 16.0.3 | Framework React con App Router |
| **TypeScript** | 5.6.3 | Type safety |
| **Tailwind CSS** | 4.0.0 | Styling (CSS-first config) |
| **shadcn/ui** | Latest | Componentes UI (tema violet-bloom) |
| **Puppeteer** | 24.30.0 | Browser automation |
| **axe-core** | 4.11.0 | Motor de análisis WCAG |
| **better-sqlite3** | 12.4.1 | Base de datos SQLite |
| **pnpm** | 10+ | Package manager |

## 📋 Prerequisitos

- **Node.js** 20+ (requerido para Chromium)
- **pnpm** 10+ (`npm install -g pnpm`)
- **Sistema:**
  - Linux: `chromium`, `libasound2`, `libnss3` (instalados automáticamente en Docker)
  - macOS/Windows: Puppeteer instala Chromium automáticamente

## 🛠️ Instalación Local

### 1. Clonar repositorio

```bash
git clone https://github.com/Novalabss-open/audit.novalabss.app.git
cd audit.novalabss.app
```

### 2. Instalar dependencias

```bash
pnpm install
```

### 3. Configurar variables de entorno (opcional)

```bash
cp .env.example .env.local
```

Variables disponibles:
```env
# Aplicación
NODE_ENV=development
NEXT_TELEMETRY_DISABLED=1

# Rate limiting (opcional)
RATE_LIMIT_REQUESTS=10
RATE_LIMIT_WINDOW=60000

# Analytics (opcional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Admin (opcional)
ADMIN_PASSWORD=your-secure-password
```

### 4. Iniciar desarrollo

```bash
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000)

## 🐳 Deploy con Docker (Dokploy/Production)

### Opción 1: Docker Compose

```bash
docker compose up -d
```

### Opción 2: Docker Build Manual

```bash
# Build
docker build -t access-checker .

# Run
docker run -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  access-checker
```

### Dokploy Setup

1. **Crear aplicación** en Dokploy dashboard
2. **Configurar**:
   - Build Type: `Dockerfile`
   - Docker File: `Dockerfile`
   - Docker Context Path: `.`
   - Branch: `dokploy`
3. **Variables de entorno**: Copiar de `.env.production`
4. **Volumen**: Montar `/app/data` para persistencia SQLite
5. **Deploy**: Push a branch `dokploy`

## 📁 Estructura del Proyecto

```
access-checker/
├── app/                          # Next.js App Router
│   ├── api/
│   │   ├── check/route.ts       # POST /api/check - Escaneo de URL
│   │   └── health/route.ts      # GET /api/health - Health check
│   ├── page.tsx                 # Home page
│   └── layout.tsx               # Root layout
├── components/
│   ├── home/
│   │   ├── CheckerForm.tsx      # Formulario principal
│   │   ├── PreviewModal.tsx     # Vista previa de resultados
│   │   ├── EmailModal.tsx       # Captura de email
│   │   ├── HowItWorks.tsx       # Sección "Cómo funciona"
│   │   └── WhyAccessibility.tsx # Sección "Por qué importa"
│   ├── shared/
│   │   ├── Footer.tsx           # Footer global
│   │   └── Navbar.tsx           # Navbar (futuro)
│   └── ui/                      # shadcn/ui components
├── lib/
│   ├── accessibility/
│   │   ├── scanner.ts           # Motor principal de escaneo
│   │   ├── score-calculator.ts  # Cálculo de score 0-100
│   │   ├── types.ts             # TypeScript types
│   │   └── constants.ts         # Constantes WCAG
│   └── db/
│       ├── index.ts             # SQLite operations
│       └── schema.sql           # Database schema
├── public/
│   └── axe.min.js              # axe-core fallback (copiado en build)
├── data/
│   └── app.db                  # SQLite database (auto-created)
├── Dockerfile                   # Multi-stage Docker build
├── docker-compose.yml          # Docker Compose config
└── .dockerignore               # Docker ignore patterns
```

## 🔧 Scripts Disponibles

```bash
# Desarrollo
pnpm dev              # Servidor dev en http://localhost:3000
pnpm dev:turbo        # Dev con Turbopack (experimental)

# Build
pnpm build            # Build producción (Next.js standalone)
pnpm start            # Servidor producción

# Código
pnpm lint             # ESLint check
pnpm lint:fix         # ESLint fix
pnpm type-check       # TypeScript check

# Docker
docker compose up     # Iniciar con Docker Compose
docker compose down   # Detener containers
```

## 🗄️ Base de Datos

### SQLite Schema

**Tabla `users`:**
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  whatsapp TEXT,
  website TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Tabla `scans` (futuro):**
```sql
CREATE TABLE scans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  url TEXT NOT NULL,
  score INTEGER NOT NULL,
  violations_json TEXT NOT NULL,
  scanned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Ubicación

- **Desarrollo**: `./data/app.db`
- **Docker**: Volumen montado en `/app/data`

## 🎯 API Endpoints

### `POST /api/check`

Escanea una URL para análisis de accesibilidad.

**Request:**
```json
{
  "url": "https://example.com"
}
```

**Response (200):**
```json
{
  "url": "https://example.com",
  "score": 85,
  "timestamp": "2025-01-20T10:30:00.000Z",
  "violations": [
    {
      "id": "color-contrast",
      "impact": "serious",
      "description": "Ensures the contrast...",
      "help": "Elements must have sufficient...",
      "helpUrl": "https://deque.com/...",
      "tags": ["wcag2aa", "wcag21aa"],
      "nodes": [
        {
          "html": "<button>Click me</button>",
          "target": ["#main > button"],
          "failureSummary": "Fix any of the following..."
        }
      ]
    }
  ],
  "passes": 45,
  "incomplete": 3,
  "summary": {
    "critical": 0,
    "serious": 5,
    "moderate": 8,
    "minor": 2,
    "total": 15
  }
}
```

**Response (400):**
```json
{
  "error": "invalid_url",
  "message": "URL debe usar protocolo HTTP o HTTPS"
}
```

**Response (500):**
```json
{
  "error": "scan_failed",
  "message": "Timeout: El sitio tardó demasiado en cargar (>30s)"
}
```

### `GET /api/health`

Health check para Docker/monitoring.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-20T10:30:00.000Z",
  "uptime": 3600.5,
  "env": "production"
}
```

## 🎨 Tema y Branding

**Tema violet-bloom:**
- **Color primario**: `#7033ff` (purple vibrante)
- **Radius**: `1.4rem` (bordes muy redondeados)
- **Fonts**:
  - Headings: Plus Jakarta Sans (bold, modern)
  - Body: Plus Jakarta Sans (regular)
  - Code: IBM Plex Mono

**Gradientes:**
```css
/* Gradient principal */
background: linear-gradient(135deg, #7033ff 0%, #a855f7 100%);

/* Gradient hover */
background: linear-gradient(135deg, #5a1fd9 0%, #8b3fd9 100%);
```

## 🔒 Seguridad

### URL Validation

- ✅ Solo HTTP/HTTPS permitidos
- ✅ Bloqueo de localhost/IPs internas (127.0.0.1, 192.168.x, 10.x, 172.x)
- ✅ Límite de longitud de URL (2000 caracteres)
- ✅ Timeout de navegación (30 segundos)
- ✅ User-Agent personalizado identificable

### Rate Limiting (futuro)

Variables `.env`:
```env
RATE_LIMIT_REQUESTS=5
RATE_LIMIT_WINDOW=60000  # 1 minuto
```

## 🚦 Performance

### Métricas típicas

- **Tiempo de escaneo**: 3-10 segundos (dependiendo del sitio)
- **Memoria por scan**: ~200MB (Puppeteer + Chromium)
- **Throughput**: ~6-10 scans/minuto (single instance)

### Optimizaciones aplicadas

- ✅ Next.js standalone output (bundle ~80% más pequeño)
- ✅ Multi-stage Docker build (imagen final ~300MB)
- ✅ CDN para axe-core con fallback local
- ✅ CSP bypass automático para inyección
- ✅ Chromium args optimizados (--single-process, --no-zygote)
- ✅ XDG cache en /tmp para evitar errores crashpad

## 🐛 Troubleshooting

### Error: "Could not load script"

**Causa**: CDN de axe-core bloqueado o timeout.
**Solución**: El sistema usa fallback automático a archivo local en `/public/axe.min.js`.

### Error: "EBADF: bad file descriptor"

**Causa**: Archivo axe.min.js no copiado en Dockerfile.
**Solución**: Verificar que línea 133 del Dockerfile esté presente:
```dockerfile
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/axe-core/axe.min.js ./public/axe.min.js
```

### Error: "chrome_crashpad_handler"

**Causa**: Chromium crashpad handler necesita directorio escribible.
**Solución**: Variables XDG configuradas en Dockerfile:
```dockerfile
ENV XDG_CONFIG_HOME=/tmp/.chromium
ENV XDG_CACHE_HOME=/tmp/.chromium
```

### Error: "Cannot find module 'axe-core'"

**Causa**: Next.js standalone no incluye todos los node_modules.
**Solución**: `axe-core` está en `dependencies` (no devDependencies) y se copia explícitamente en Dockerfile.

## 📖 Documentación Adicional

- **[DOCUMENTATION.md](./DOCUMENTATION.md)**: Documentación técnica profunda
- **[ROADMAP.md](./ROADMAP.md)**: Plan de fases de desarrollo
- **[Dockerfile](./Dockerfile)**: Configuración Docker comentada

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: amazing feature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver [LICENSE](./LICENSE) para más detalles.

## 🙏 Agradecimientos

- [axe-core](https://github.com/dequelabs/axe-core) por Deque Systems
- [Puppeteer](https://pptr.dev/) por Google Chrome team
- [shadcn/ui](https://ui.shadcn.com/) por @shadcn
- [Next.js](https://nextjs.org/) por Vercel

---

**Hecho con 💜 por [NovaLabs](https://novalabss.com)**

**Contacto**: abraham@novalabss.com
