export const getSubdomain = (): string | null => {
  const hostname = window.location.hostname;

  // Handle localhost cases
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return null; // Main domain
  }

  const parts = hostname.split('.');

  // If we have more parts than expected for a main domain (e.g. playground.kandidex.com vs kandidex.com)
  // For localhost: playground.localhost -> ['playground', 'localhost'] (length 2)
  // For prod: playground.kandidex.com -> ['playground', 'kandidex', 'com'] (length 3)
  // For prod main: kandidex.com -> ['kandidex', 'com'] (length 2)
  
  // Custom logic for localhost with subdomain
  if (parts.length === 2 && parts[1] === 'localhost') {
      return parts[0];
  }

  // Assuming standard 2-part TLD (like .com, .io) or 3-part (co.uk) - this is a simplification
  // Better approach: check against known main domain or env var
  // For this specific use case:
  
  if (parts.length >= 3) {
      // Return the first part if it's not 'www'
      if (parts[0] !== 'www') {
          return parts[0];
      }
  }

  return null;
};

export const isPlayground = (): boolean => {
    const subdomain = getSubdomain();
    return subdomain === 'playground';
};

export const getMainDomainUrl = (): string => {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port ? `:${window.location.port}` : '';

    if (hostname.includes('localhost') || hostname === '127.0.0.1') {
        const parts = hostname.split('.');
        if (parts.length === 2 && parts[1] === 'localhost') {
             return `${protocol}//localhost${port}`;
        }
        return `${protocol}//localhost${port}`;
    }

    // Production: remove subdomain
    const parts = hostname.split('.');
    if (parts.length >= 3) {
         // simple strip of first part
         return `${protocol}//${parts.slice(1).join('.')}${port}`;
    }
    
    return `${protocol}//${hostname}${port}`;
};

export const getPlaygroundUrl = (): string => {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port ? `:${window.location.port}` : '';

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return `${protocol}//playground.localhost${port}`;
    }
    
    // Check if we are already on playground
    if (hostname.startsWith('playground.')) {
        return `${protocol}//${hostname}${port}`;
    }

    return `${protocol}//playground.${hostname}${port}`;
}
