import { inject, PLATFORM_ID } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  
  // Skip auth check on server-side rendering
  if (!isPlatformBrowser(platformId)) {
    return true;
  }
  
  // Check if user is authenticated by checking for access token
  const accessToken = localStorage.getItem('accessToken');
  
  if (accessToken) {
    return true;
  }
  
  // Redirect to login if not authenticated
  router.navigate(['/login']);
  return false;
};
