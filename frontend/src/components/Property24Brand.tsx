import React from 'react';

/**
 * Property24's brand mark rendered as two-tone text: "P" (or
 * "Property") in blue, "24" in red -- per explicit request. Official
 * brand-asset lookups at build time were inconclusive/contradictory
 * (one source showed black + red/orange, no blue), so these are
 * reasonable approximations rather than verified exact hex values --
 * update them here if the real ones become available; every usage in
 * the app flows through this one component.
 */
export const PROPERTY24_BLUE = '#0072BC';
export const PROPERTY24_RED = '#ED1C24';

interface Property24BrandProps {
  className?: string;
  // 'full' renders "Property24", 'short' renders "P24" -- both split
  // the same way, blue up to (and not including) "24", red after.
  variant?: 'full' | 'short';
}

export const Property24Brand: React.FC<Property24BrandProps> = ({
  className = '',
  variant = 'full'
}) => (
  <span className={className}>
    <span style={{ color: PROPERTY24_BLUE }}>{variant === 'full' ? 'Property' : 'P'}</span>
    <span style={{ color: PROPERTY24_RED }}>24</span>
  </span>
);
