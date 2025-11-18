import { Card } from '@/components/ui/card';

export function WhyAccessibility() {
  const benefits = [
    {
      title: 'Cumplimiento Legal',
      description:
        'Cumple con regulaciones como la ADA y la Ley Federal de Accesibilidad. Evita demandas y multas por discriminación.',
      icon: (
        <svg
          className="h-10 w-10"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
          />
        </svg>
      ),
      color: 'text-chart-4',
    },
    {
      title: 'Mejor SEO',
      description:
        'Google favorece sitios accesibles en sus rankings. Un sitio accesible es más fácil de indexar y rankear.',
      icon: (
        <svg
          className="h-10 w-10"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          />
        </svg>
      ),
      color: 'text-chart-1',
    },
    {
      title: 'Audiencia Más Amplia',
      description:
        'El 15% de la población mundial tiene alguna discapacidad. No pierdas estos clientes potenciales.',
      icon: (
        <svg
          className="h-10 w-10"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      color: 'text-chart-2',
    },
    {
      title: 'Mejor UX Para Todos',
      description:
        'Los principios de accesibilidad mejoran la experiencia para todos los usuarios, no solo para personas con discapacidades.',
      icon: (
        <svg
          className="h-10 w-10"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      color: 'text-chart-3',
    },
  ];

  return (
    <section className="bg-background py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          {/* Heading */}
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Por Qué Importa la Accesibilidad
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              La accesibilidad web no es solo lo correcto, también es bueno para
              tu negocio
            </p>
          </div>

          {/* Benefits grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit, index) => (
              <Card
                key={index}
                className="group relative overflow-hidden border-2 p-6 transition-all hover:border-primary/50 hover:shadow-lg"
              >
                {/* Icon */}
                <div className={`mb-4 ${benefit.color} transition-transform group-hover:scale-110`}>
                  {benefit.icon}
                </div>

                {/* Content */}
                <h3 className="mb-3 text-lg font-semibold text-foreground">
                  {benefit.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {benefit.description}
                </p>
              </Card>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-12 grid gap-6 rounded-lg border-2 bg-muted/30 p-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-primary">15%</div>
              <div className="text-sm text-muted-foreground">
                De la población mundial tiene alguna discapacidad
              </div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-primary">71%</div>
              <div className="text-sm text-muted-foreground">
                De usuarios con discapacidad abandonan sitios inaccesibles
              </div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-primary">+3.5x</div>
              <div className="text-sm text-muted-foreground">
                Mejora en SEO promedio con accesibilidad óptima
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
