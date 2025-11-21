import { NextResponse } from 'next/server';
import { checkUserExists } from '@/lib/db/users';
import type { CheckEmailRequest, CheckEmailResponse, ApiError } from '@/types/api';

// Force dynamic route - don't prerender during build
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/auth/check-email
 *
 * Verifica si un email ya existe en la base de datos
 *
 * @param request - Body: { email: string }
 * @returns { exists: boolean, user?: User }
 */
export async function POST(request: Request) {
  try {
    // Parse request body
    const body: CheckEmailRequest = await request.json();

    // Validate email
    if (!body.email || typeof body.email !== 'string') {
      const error: ApiError = {
        error: 'invalid_email',
        message: 'El email es requerido',
      };
      return NextResponse.json(error, { status: 400 });
    }

    // Sanitize email
    const email = body.email.trim().toLowerCase();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const error: ApiError = {
        error: 'invalid_email_format',
        message: 'Formato de email inválido',
      };
      return NextResponse.json(error, { status: 400 });
    }

    // Check if user exists
    const user = checkUserExists(email);

    if (user) {
      const response: CheckEmailResponse = {
        exists: true,
        user,
      };
      return NextResponse.json(response);
    }

    const response: CheckEmailResponse = {
      exists: false,
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error checking email:', error);

    const apiError: ApiError = {
      error: 'internal_error',
      message: 'Error al verificar el email',
    };
    return NextResponse.json(apiError, { status: 500 });
  }
}
