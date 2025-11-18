'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { ScanResult, ScanError } from '@/lib/accessibility/types';
import { PreviewModal } from '@/components/results/PreviewModal';
import { EmailGateModal, type UserFormData } from '@/components/results/EmailGateModal';

export function CheckerForm() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showEmailGate, setShowEmailGate] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check localStorage for authentication on mount
  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail');
    if (storedEmail) {
      setIsAuthenticated(true);
    }
  }, []);

  const validateUrl = (input: string): { valid: boolean; error?: string } => {
    if (!input.trim()) {
      return { valid: false, error: 'Por favor ingresa una URL' };
    }

    // Add protocol if missing
    let urlToValidate = input.trim();
    if (!urlToValidate.startsWith('http://') && !urlToValidate.startsWith('https://')) {
      urlToValidate = 'https://' + urlToValidate;
    }

    try {
      new URL(urlToValidate);
      return { valid: true };
    } catch {
      return { valid: false, error: 'Por favor ingresa una URL válida' };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate URL
    const validation = validateUrl(url);
    if (!validation.valid) {
      setError(validation.error || 'URL inválida');
      return;
    }

    // Add protocol if missing
    let urlToScan = url.trim();
    if (!urlToScan.startsWith('http://') && !urlToScan.startsWith('https://')) {
      urlToScan = 'https://' + urlToScan;
    }

    setIsLoading(true);
    setLoadingMessage('Escaneando tu sitio...');

    try {
      // Simulate progressive messages
      const messageInterval = setInterval(() => {
        setLoadingMessage((prev) => {
          if (prev === 'Escaneando tu sitio...') return 'Evaluando accesibilidad...';
          if (prev === 'Evaluando accesibilidad...') return 'Generando reporte...';
          return prev;
        });
      }, 3000);

      const response = await fetch('/api/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: urlToScan }),
      });

      clearInterval(messageInterval);

      if (!response.ok) {
        const errorData: ScanError = await response.json();

        // Handle specific error codes
        if (errorData.error === 'RATE_LIMIT_EXCEEDED') {
          setError('⏰ ' + errorData.message);
        } else if (errorData.error === 'TIMEOUT') {
          setError('⏱️ El sitio tardó demasiado en cargar. Intenta de nuevo.');
        } else if (errorData.error === 'UNREACHABLE') {
          setError('🔌 No se pudo acceder al sitio. Verifica que esté online.');
        } else {
          setError('❌ ' + errorData.message);
        }
        return;
      }

      const result: ScanResult = await response.json();

      // Store result and show appropriate modal
      setScanResult(result);

      if (isAuthenticated) {
        // If already authenticated, redirect to full results
        // TODO: Navigate to /results page in FASE 8
        console.log('User is authenticated, showing full results');
        alert(
          `✅ Análisis completado!\n\nScore: ${result.score}/100\nProblemas encontrados: ${result.summary.total}`
        );
      } else {
        // Show preview modal for non-authenticated users
        setShowPreview(true);
      }
    } catch (err) {
      console.error('Error scanning:', err);
      setError('❌ Error al escanear el sitio. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const handleUnlock = () => {
    setShowPreview(false);
    setShowEmailGate(true);
  };

  const handleEmailSubmit = async (formData: UserFormData) => {
    try {
      // Store email in localStorage for passwordless auth
      localStorage.setItem('userEmail', formData.email);
      localStorage.setItem('userName', formData.name);
      if (formData.whatsapp) {
        localStorage.setItem('userWhatsapp', formData.whatsapp);
      }

      setIsAuthenticated(true);
      setShowEmailGate(false);

      // TODO: In FASE 7, call API to save user data to database
      console.log('User data to save:', formData);

      // TODO: In FASE 8, navigate to full results page
      // For now, show alert
      alert(
        `✅ ¡Reporte desbloqueado!\n\nScore: ${scanResult?.score}/100\nProblemas encontrados: ${scanResult?.summary.total}\n\nEn la siguiente fase, esto te redireccionará a la página de resultados completos.`
      );
    } catch (err) {
      console.error('Error saving user data:', err);
      setError('❌ Error al procesar tus datos. Intenta de nuevo.');
    }
  };

  return (
    <section className="container mx-auto -mt-12 px-4 pb-20">
      <Card className="mx-auto max-w-3xl border-2 bg-card p-8 shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* URL Input */}
          <div className="space-y-2">
            <label
              htmlFor="url-input"
              className="block text-sm font-medium text-foreground"
            >
              URL de tu sitio web
            </label>
            <div className="flex gap-2">
              <Input
                id="url-input"
                type="text"
                placeholder="ejemplo.com o https://tusitio.com"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setError(null);
                }}
                disabled={isLoading}
                className="flex-1 text-base"
                autoComplete="url"
              />
              <Button
                type="submit"
                disabled={isLoading}
                size="lg"
                className="px-8"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="h-4 w-4 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Analizando
                  </span>
                ) : (
                  'Analizar Ahora'
                )}
              </Button>
            </div>

            {/* Error message */}
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            {/* Loading message */}
            {isLoading && loadingMessage && (
              <p className="text-sm text-muted-foreground">{loadingMessage}</p>
            )}
          </div>

          {/* Help text */}
          <p className="text-center text-sm text-muted-foreground">
            Ingresa la URL de cualquier sitio web público para analizar su
            accesibilidad según los estándares WCAG 2.1
          </p>
        </form>
      </Card>

      {/* Modals */}
      {scanResult && (
        <>
          <PreviewModal
            isOpen={showPreview}
            onClose={() => setShowPreview(false)}
            onUnlock={handleUnlock}
            result={scanResult}
          />
          <EmailGateModal
            isOpen={showEmailGate}
            onClose={() => setShowEmailGate(false)}
            onSubmit={handleEmailSubmit}
          />
        </>
      )}
    </section>
  );
}
