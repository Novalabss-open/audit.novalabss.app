import { Button } from '@/components/ui/button';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/30">
      {/* CTA Section */}
      <div className="border-b bg-gradient-to-br from-primary/10 via-background to-accent/5 py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-2xl font-bold text-foreground sm:text-3xl">
            ¿Necesitas Ayuda Profesional?
          </h2>
          <p className="mb-6 text-lg text-muted-foreground">
            Nuestro equipo puede ayudarte a arreglar todos los problemas de
            accesibilidad de tu sitio
          </p>
          <Button size="lg" className="px-8">
            Agenda una Consultoría Gratis
          </Button>
        </div>
      </div>

      {/* Footer Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <span>Hecho con</span>
            <svg
              className="h-5 w-5 text-primary"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                clipRule="evenodd"
              />
            </svg>
            <span>por</span>
            <span className="font-semibold text-foreground">NovaLabs</span>
          </div>

          {/* Copyright */}
          <div>
            © {currentYear} NovaLabs. Todos los derechos reservados.
          </div>

          {/* Links */}
          <div className="flex gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-foreground"
            >
              GitHub
            </a>
            <a
              href="#"
              className="transition-colors hover:text-foreground"
            >
              Documentación
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
