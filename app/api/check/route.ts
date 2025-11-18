import { NextRequest, NextResponse } from 'next/server';
import { scanUrl } from '@/lib/accessibility/scanner';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import type { ScanResult, ScanError } from '@/lib/accessibility/types';

/**
 * POST /api/check
 * Scan a URL for accessibility violations
 *
 * Body: { url: string }
 * Returns: ScanResult or ScanError
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Get client IP for rate limiting
    const clientIp = getClientIp(request);

    // 2. Check rate limit
    const rateLimit = checkRateLimit(clientIp);
    if (rateLimit.isLimited) {
      const resetIn = Math.ceil((rateLimit.resetAt - Date.now()) / 1000);
      return NextResponse.json(
        {
          error: 'RATE_LIMIT_EXCEEDED',
          message: `Demasiadas solicitudes. Intenta de nuevo en ${resetIn} segundos.`,
        } as ScanError,
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': process.env.RATE_LIMIT_REQUESTS || '5',
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.resetAt.toString(),
            'Retry-After': resetIn.toString(),
          },
        }
      );
    }

    // 3. Parse request body
    let body: { url?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error: 'INVALID_JSON',
          message: 'El cuerpo de la solicitud debe ser JSON válido.',
        } as ScanError,
        { status: 400 }
      );
    }

    // 4. Validate URL parameter
    const { url } = body;
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        {
          error: 'MISSING_URL',
          message: 'El parámetro "url" es requerido y debe ser un string.',
        } as ScanError,
        { status: 400 }
      );
    }

    // Trim whitespace
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      return NextResponse.json(
        {
          error: 'EMPTY_URL',
          message: 'La URL no puede estar vacía.',
        } as ScanError,
        { status: 400 }
      );
    }

    // 5. Run scan
    const result: ScanResult = await scanUrl(trimmedUrl);

    // 6. Return successful result
    return NextResponse.json(result, {
      status: 200,
      headers: {
        'X-RateLimit-Limit': process.env.RATE_LIMIT_REQUESTS || '5',
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': rateLimit.resetAt.toString(),
      },
    });
  } catch (error) {
    // Handle scanner errors
    if (error instanceof Error) {
      // Timeout error
      if (error.message.includes('Timeout')) {
        return NextResponse.json(
          {
            error: 'TIMEOUT',
            message: error.message,
          } as ScanError,
          { status: 408 }
        );
      }

      // URL validation error (from scanner)
      if (
        error.message.includes('URL debe usar') ||
        error.message.includes('No se pueden escanear') ||
        error.message.includes('Formato de URL')
      ) {
        return NextResponse.json(
          {
            error: 'INVALID_URL',
            message: error.message,
          } as ScanError,
          { status: 400 }
        );
      }

      // Site unreachable
      if (error.message.includes('No se pudo acceder')) {
        return NextResponse.json(
          {
            error: 'UNREACHABLE',
            message: error.message,
          } as ScanError,
          { status: 400 }
        );
      }

      // Generic error with message
      return NextResponse.json(
        {
          error: 'SCAN_FAILED',
          message: error.message,
        } as ScanError,
        { status: 500 }
      );
    }

    // Unknown error
    console.error('Unexpected error in /api/check:', error);
    return NextResponse.json(
      {
        error: 'INTERNAL_ERROR',
        message: 'Error interno del servidor. Intenta de nuevo más tarde.',
      } as ScanError,
      { status: 500 }
    );
  }
}

/**
 * GET /api/check
 * Method not allowed - only POST is supported
 */
export async function GET() {
  return NextResponse.json(
    {
      error: 'METHOD_NOT_ALLOWED',
      message: 'Este endpoint solo acepta solicitudes POST.',
    } as ScanError,
    {
      status: 405,
      headers: {
        Allow: 'POST',
      },
    }
  );
}
