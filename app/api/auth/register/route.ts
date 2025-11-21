import { NextResponse } from 'next/server';
import { checkUserExists, createUser, updateLastSeen } from '@/lib/db/users';
import type { RegisterRequest, RegisterResponse, ApiError } from '@/types/api';

/**
 * POST /api/auth/register
 *
 * Registra un nuevo usuario o actualiza last_seen si ya existe
 *
 * @param request - Body: { email, name, whatsapp?, hasWebsite?, websiteUrl? }
 * @returns { success: true, user: User }
 */
export async function POST(request: Request) {
  try {
    // Parse request body
    const body: RegisterRequest = await request.json();

    // Validation errors
    const validationErrors: Record<string, string> = {};

    // Validate email
    if (!body.email || typeof body.email !== 'string') {
      validationErrors.email = 'El email es requerido';
    } else {
      const email = body.email.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        validationErrors.email = 'Formato de email inválido';
      }
    }

    // Validate name
    if (!body.name || typeof body.name !== 'string') {
      validationErrors.name = 'El nombre es requerido';
    } else if (body.name.trim().length < 2) {
      validationErrors.name = 'El nombre debe tener al menos 2 caracteres';
    }

    // Validate website URL if provided
    if (body.hasWebsite) {
      if (!body.websiteUrl || !body.websiteUrl.trim()) {
        validationErrors.websiteUrl = 'La URL del sitio es requerida';
      } else {
        try {
          let url = body.websiteUrl.trim();
          // Add https:// if no protocol
          if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
          }
          new URL(url);
        } catch {
          validationErrors.websiteUrl = 'URL inválida';
        }
      }
    }

    // Return validation errors if any
    if (Object.keys(validationErrors).length > 0) {
      const error: ApiError = {
        error: 'validation_error',
        message: 'Datos inválidos',
        details: validationErrors,
      };
      return NextResponse.json(error, { status: 400 });
    }

    // Sanitize data
    const email = body.email.trim().toLowerCase();
    const name = body.name.trim();
    const whatsapp = body.whatsapp?.trim() || undefined;
    const hasWebsite = body.hasWebsite || false;
    let websiteUrl = body.websiteUrl?.trim() || undefined;

    // Normalize website URL
    if (hasWebsite && websiteUrl) {
      if (!websiteUrl.startsWith('http://') && !websiteUrl.startsWith('https://')) {
        websiteUrl = 'https://' + websiteUrl;
      }
    }

    // Check if user already exists
    const existingUser = checkUserExists(email);

    if (existingUser) {
      // User exists - just update last_seen
      updateLastSeen(existingUser.id);

      // Get updated user
      const updatedUser = checkUserExists(email);

      const response: RegisterResponse = {
        success: true,
        user: updatedUser!,
      };
      return NextResponse.json(response);
    }

    // Create new user
    const userId = createUser({
      email,
      name,
      whatsapp,
      hasWebsite,
      websiteUrl,
    });

    // Get created user
    const newUser = checkUserExists(email);

    if (!newUser) {
      throw new Error('Failed to retrieve created user');
    }

    const response: RegisterResponse = {
      success: true,
      user: newUser,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error registering user:', error);

    const apiError: ApiError = {
      error: 'internal_error',
      message: 'Error al registrar usuario',
    };
    return NextResponse.json(apiError, { status: 500 });
  }
}
