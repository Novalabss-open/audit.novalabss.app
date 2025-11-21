'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { User } from '@/lib/db/users';
import type { CheckEmailResponse, RegisterResponse, ApiError } from '@/types/api';

interface EmailGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export interface UserFormData {
  email: string;
  name: string;
  whatsapp?: string;
  hasWebsite: boolean;
  websiteUrl?: string;
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function EmailGateModal({
  isOpen,
  onClose,
  onSuccess,
}: EmailGateModalProps) {
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    name: '',
    whatsapp: '',
    hasWebsite: false,
    websiteUrl: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof UserFormData, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [existingUser, setExistingUser] = useState<User | null>(null);

  // Debounce email to avoid too many API calls
  const debouncedEmail = useDebounce(formData.email, 500);

  // Check email exists on blur or after debounce
  const checkEmail = useCallback(async (email: string) => {
    if (!email.trim()) {
      setEmailExists(false);
      setExistingUser(null);
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return;
    }

    setIsCheckingEmail(true);

    try {
      const response = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        const data: CheckEmailResponse = await response.json();
        setEmailExists(data.exists);
        setExistingUser(data.user || null);
      }
    } catch (error) {
      console.error('Error checking email:', error);
    } finally {
      setIsCheckingEmail(false);
    }
  }, []);

  // Auto-check email when debounced value changes
  useEffect(() => {
    if (debouncedEmail) {
      checkEmail(debouncedEmail);
    }
  }, [debouncedEmail, checkEmail]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof UserFormData, string>> = {};

    // Email is required
    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Ingresa un email válido';
    }

    // Name is required
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    }

    // Website URL is required if hasWebsite is true
    if (formData.hasWebsite && !formData.websiteUrl?.trim()) {
      newErrors.websiteUrl = 'Por favor ingresa la URL de tu sitio';
    } else if (formData.hasWebsite && formData.websiteUrl) {
      try {
        let url = formData.websiteUrl.trim();
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          url = 'https://' + url;
        }
        new URL(url);
      } catch {
        newErrors.websiteUrl = 'Ingresa una URL válida';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Call register API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          name: formData.name.trim(),
          whatsapp: formData.whatsapp?.trim() || undefined,
          hasWebsite: formData.hasWebsite,
          websiteUrl: formData.websiteUrl?.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();

        // Handle validation errors
        if (errorData.details) {
          setErrors(errorData.details as any);
          return;
        }

        // Generic error
        throw new Error(errorData.message || 'Error al registrar');
      }

      const data: RegisterResponse = await response.json();

      // Save to localStorage for auto-login
      localStorage.setItem('userEmail', data.user.email);
      localStorage.setItem('userId', data.user.id.toString());

      // Call success callback
      onSuccess(data.user);

      // Close modal
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({
        email: 'Error al procesar el registro. Intenta de nuevo.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof UserFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {emailExists ? '¡Bienvenido de vuelta!' : 'Desbloquea tu Reporte Completo'}
          </DialogTitle>
          <DialogDescription>
            {emailExists
              ? 'Te reconocemos. Solo confirma tu información.'
              : 'Ingresa tus datos para acceder a todos los detalles del análisis de accesibilidad'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email field */}
          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                disabled={isLoading}
                className={errors.email ? 'border-destructive' : ''}
                autoComplete="email"
              />
              {isCheckingEmail && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <svg
                    className="h-4 w-4 animate-spin text-muted-foreground"
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
                </div>
              )}
            </div>
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
            {emailExists && existingUser && (
              <p className="text-sm text-primary">
                ¡Hola {existingUser.name}! Te reconocemos.
              </p>
            )}
          </div>

          {/* Name field */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Nombre <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Tu nombre"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              disabled={isLoading}
              className={errors.name ? 'border-destructive' : ''}
              autoComplete="name"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          {/* WhatsApp field (optional) */}
          <div className="space-y-2">
            <Label htmlFor="whatsapp">
              WhatsApp <span className="text-xs text-muted-foreground">(opcional)</span>
            </Label>
            <Input
              id="whatsapp"
              type="tel"
              placeholder="+52 123 456 7890"
              value={formData.whatsapp}
              onChange={(e) => handleChange('whatsapp', e.target.value)}
              disabled={isLoading}
              autoComplete="tel"
            />
            <p className="text-xs text-muted-foreground">
              Para enviarte tips de accesibilidad y ofertas exclusivas
            </p>
          </div>

          {/* Has website checkbox */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="hasWebsite"
                checked={formData.hasWebsite}
                onChange={(e) => handleChange('hasWebsite', e.target.checked)}
                disabled={isLoading}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="hasWebsite" className="cursor-pointer font-normal">
                Tengo un sitio web que necesita auditoría
              </Label>
            </div>

            {/* Website URL field (conditional) */}
            {formData.hasWebsite && (
              <div className="space-y-2 pl-6">
                <Label htmlFor="websiteUrl">
                  URL de tu sitio <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="websiteUrl"
                  type="text"
                  placeholder="tusitio.com o https://tusitio.com"
                  value={formData.websiteUrl}
                  onChange={(e) => handleChange('websiteUrl', e.target.value)}
                  disabled={isLoading}
                  className={errors.websiteUrl ? 'border-destructive' : ''}
                  autoComplete="url"
                />
                {errors.websiteUrl && (
                  <p className="text-sm text-destructive">{errors.websiteUrl}</p>
                )}
              </div>
            )}
          </div>

          {/* Benefits reminder */}
          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="mb-2 text-sm font-medium">Al desbloquear obtendrás:</div>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Reporte completo con todos los problemas encontrados</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Guías detalladas en español para cada problema</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Historial de escaneos guardado</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>100% gratis, sin cargos ocultos</span>
              </div>
            </div>
          </div>

          {/* Submit button */}
          <Button
            type="submit"
            size="lg"
            disabled={isLoading}
            className="w-full"
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
                Procesando...
              </span>
            ) : (
              'Desbloquear Reporte Completo'
            )}
          </Button>

          {/* Privacy note */}
          <p className="text-center text-xs text-muted-foreground">
            🔒 No spam. Solo te enviamos contenido de valor sobre accesibilidad web.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
