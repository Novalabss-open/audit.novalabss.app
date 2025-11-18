'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import type { ScanResult } from '@/lib/accessibility/types';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlock: () => void;
  result: ScanResult;
}

export function PreviewModal({
  isOpen,
  onClose,
  onUnlock,
  result,
}: PreviewModalProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-chart-1';
    if (score >= 70) return 'text-chart-3';
    if (score >= 50) return 'text-yellow-600';
    return 'text-destructive';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excelente';
    if (score >= 70) return 'Bueno';
    if (score >= 50) return 'Regular';
    return 'Necesita Mejoras';
  };

  // Show only first 3 violations as preview
  const previewViolations = result.violations.slice(0, 3);
  const hiddenCount = result.violations.length - 3;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Vista Previa del Análisis
          </DialogTitle>
          <DialogDescription>
            Resultados preliminares para {new URL(result.url).hostname}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Score Section */}
          <Card className="border-2 p-6 text-center">
            <div className="mb-2 text-sm font-medium text-muted-foreground">
              Puntuación de Accesibilidad
            </div>
            <div className={`mb-3 text-6xl font-bold ${getScoreColor(result.score)}`}>
              {result.score}
              <span className="text-2xl text-muted-foreground">/100</span>
            </div>
            <Badge variant="outline" className="text-base">
              {getScoreLabel(result.score)}
            </Badge>
          </Card>

          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="rounded-lg border bg-muted/30 p-4 text-center">
              <div className="mb-1 text-2xl font-bold text-destructive">
                {result.summary.critical}
              </div>
              <div className="text-xs text-muted-foreground">Críticos</div>
            </div>
            <div className="rounded-lg border bg-muted/30 p-4 text-center">
              <div className="mb-1 text-2xl font-bold text-chart-4">
                {result.summary.serious}
              </div>
              <div className="text-xs text-muted-foreground">Serios</div>
            </div>
            <div className="rounded-lg border bg-muted/30 p-4 text-center">
              <div className="mb-1 text-2xl font-bold text-chart-3">
                {result.summary.moderate}
              </div>
              <div className="text-xs text-muted-foreground">Moderados</div>
            </div>
            <div className="rounded-lg border bg-muted/30 p-4 text-center">
              <div className="mb-1 text-2xl font-bold text-chart-1">
                {result.summary.minor}
              </div>
              <div className="text-xs text-muted-foreground">Menores</div>
            </div>
          </div>

          {/* Preview of violations (blurred) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Problemas Encontrados
              </h3>
              <Badge variant="secondary">
                Vista Previa: {previewViolations.length} de {result.violations.length}
              </Badge>
            </div>

            {/* Show first 3 violations */}
            <div className="space-y-3">
              {previewViolations.map((violation, index) => (
                <Card key={violation.id} className="border p-4">
                  <div className="flex items-start gap-3">
                    <Badge
                      variant={
                        violation.impact === 'critical'
                          ? 'destructive'
                          : violation.impact === 'serious'
                            ? 'default'
                            : 'secondary'
                      }
                      className="shrink-0"
                    >
                      {violation.impact === 'critical' && 'Crítico'}
                      {violation.impact === 'serious' && 'Serio'}
                      {violation.impact === 'moderate' && 'Moderado'}
                      {violation.impact === 'minor' && 'Menor'}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">
                        {violation.description}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {violation.nodes.length} elemento(s) afectado(s)
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Blurred section for locked content */}
            {hiddenCount > 0 && (
              <div className="relative">
                {/* Blurred preview items */}
                <div className="pointer-events-none space-y-3 blur-sm">
                  {[1, 2].map((i) => (
                    <Card key={i} className="border p-4">
                      <div className="flex items-start gap-3">
                        <Badge variant="secondary" className="shrink-0">
                          •••
                        </Badge>
                        <div className="flex-1">
                          <div className="h-4 w-3/4 rounded bg-muted"></div>
                          <div className="mt-2 h-3 w-1/2 rounded bg-muted"></div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Lock overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                  <div className="text-center">
                    <div className="mb-2 flex justify-center">
                      <svg
                        className="h-12 w-12 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <div className="mb-2 text-lg font-semibold">
                      +{hiddenCount} problemas más
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Desbloquea el reporte completo
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* CTA Section */}
          <Card className="border-2 border-primary/20 bg-primary/5 p-6">
            <div className="text-center">
              <h3 className="mb-2 text-xl font-bold text-foreground">
                Desbloquea el Reporte Completo
              </h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Obtén acceso a todos los {result.violations.length} problemas
                encontrados, con guías detalladas en español para arreglar cada
                uno.
              </p>
              <div className="mb-4 flex flex-wrap justify-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  ✓ Análisis completo WCAG 2.1
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  ✓ Guías paso a paso
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  ✓ Priorización de fixes
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  ✓ 100% Gratis
                </Badge>
              </div>
              <Button size="lg" onClick={onUnlock} className="w-full sm:w-auto">
                Desbloquear Reporte Completo
              </Button>
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
