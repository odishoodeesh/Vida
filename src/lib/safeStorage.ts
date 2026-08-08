export function safeSetLocalStorage(key: string, value: any): void {
  const stringified = typeof value === 'string' ? value : JSON.stringify(value);
  try {
    localStorage.setItem(key, stringified);
  } catch (e: any) {
    if (e.name === 'QuotaExceededError' || e.code === 22 || e.code === 1014) {
      console.warn(`[Storage] Quota exceeded for key "${key}". Cleaning up cached data.`);
      
      // Attempt 1: Sanitize arrays (products, categories, orders) by removing base64 data URLs without injecting fake placeholder URLs
      if (Array.isArray(value)) {
        try {
          const sanitized = value.map((item: any) => {
            if (item && typeof item === 'object') {
              const copy = { ...item };
              if (typeof copy.image === 'string' && copy.image.startsWith('data:image/')) {
                copy.image = '';
              }
              if (Array.isArray(copy.images)) {
                copy.images = copy.images.filter((img: string) => typeof img === 'string' && !img.startsWith('data:image/'));
              }
              if (copy.localizedImages) {
                delete copy.localizedImages;
              }
              return copy;
            }
            return item;
          });
          
          localStorage.setItem(key, JSON.stringify(sanitized));
          return;
        } catch {
          // Continue to attempt 2
        }
      }

      // Attempt 2: Clear old temporary or non-critical cache keys
      try {
        const nonCriticalKeys = ['vida_featured', 'vida_hero_image', 'vida_orders'];
        for (const k of nonCriticalKeys) {
          if (k !== key) {
            localStorage.removeItem(k);
          }
        }
        localStorage.setItem(key, stringified);
        return;
      } catch {
        // Suppress quota exception
      }
    } else {
      console.warn(`[Storage] Could not set "${key}":`, e);
    }
  }
}

export function safeGetLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (!saved || saved === 'undefined') return defaultValue;
    return JSON.parse(saved) as T;
  } catch (e) {
    console.warn(`[Storage] Error reading key "${key}":`, e);
    return defaultValue;
  }
}
