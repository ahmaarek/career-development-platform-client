import { HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { switchMap, take } from 'rxjs';
import { AuthService } from '../../auth/auth.service';


 
export function tokenInterceptor(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
) {
  const authService = inject(AuthService);
 
  return authService.user$.pipe(
    take(1),
    switchMap((user) => {
      if (user) {
        const requestWithToken = request.clone({
          setHeaders: {
            Authorization: `Bearer ${user.token}`,
          },
        });
 
        return next(requestWithToken);
      }
 
      return next(request);
    })
  );
}