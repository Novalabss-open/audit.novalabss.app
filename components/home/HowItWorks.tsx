import { Card } from '@/components/ui/card';

export function HowItWorks() {
  const steps = [
    {
      number: '1',
      title: 'Ingresa tu URL',
      description:
        'Simplemente pega la dirección de tu sitio web en el campo de arriba.',
      icon: (
        <svg
          className="h-8 w-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
          />
        </svg>
      ),
    },
    {
      number: '2',
      title: 'Escaneamos con axe-core',
      description:
        'Nuestro motor analiza tu sitio usando axe-core, la herramienta líder en análisis WCAG 2.1 AA/AAA.',
      icon: (
        <svg
          className="h-8 w-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
      ),
    },
    {
      number: '3',
      title: 'Recibes reporte detallado',
      description:
        'Obtén un reporte completo con score, problemas encontrados y guías paso a paso de cómo arreglarlos.',
      icon: (
        <svg
          className="h-8 w-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
  ];

  return (
    <section className="border-b bg-muted/30 py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl">
          {/* Heading */}
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Cómo Funciona
            </h2>
            <p className="text-lg text-muted-foreground">
              Analiza la accesibilidad de tu sitio en 3 simples pasos
            </p>
          </div>

          {/* Steps */}
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <Card
                key={step.number}
                className="relative overflow-hidden border-2 p-6 transition-all hover:border-primary/50 hover:shadow-lg"
              >
                {/* Step number badge */}
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                  {step.number}
                </div>

                {/* Icon */}
                <div className="mb-4 text-primary">{step.icon}</div>

                {/* Content */}
                <h3 className="mb-2 text-xl font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">{step.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
