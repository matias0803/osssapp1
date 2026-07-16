import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { getAuth } from 'firebase-admin/auth';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // 1. Buscamos el token en los headers de la petición
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No se proporcionó un token de autenticación válido');
    }

    // 2. Extraemos solo la cadena de texto (quitamos la palabra "Bearer ")
    const token = authHeader.split(' ')[1];

    try {
      // 3. Verificamos el token usando el Admin SDK de Firebase
      // Si el token es inventado o expiró, esto lanzará un error y caerá en el catch
      const decodedToken = await getAuth().verifyIdToken(token);
      
      // 4. ¡Éxito! Inyectamos los datos del usuario en la request
      // Así tus controladores sabrán exactamente quién está haciendo la petición
      request.user = decodedToken;
      
      return true; // Dejamos pasar la petición
    } catch (error) {
      throw new UnauthorizedException('Token inválido o expirado. Por favor, inicia sesión de nuevo.');
    }
  }
}