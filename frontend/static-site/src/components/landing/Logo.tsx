import { Link } from "react-router-dom";
import { useState } from "react";

interface LogoProps {
  className?: string;
  showTagline?: boolean;
}

const Logo = ({ className = "", showTagline = false }: LogoProps) => {
  const [imageError, setImageError] = useState(false);

  return (
    <Link to="/" className={`flex items-center gap-3 ${className}`}>
      {/* Logo Image - Place logo.png in public/logo.png */}
      <div className="flex-shrink-0 h-24 md:h-32 lg:h-36 flex items-center justify-center">
        {!imageError && (
          <img 
            src="/logo.png"
            alt="House Tour Guide Logo" 
            className="h-full w-auto object-contain max-w-[300px] md:max-w-[400px] lg:max-w-[500px]"
            onError={() => {
              // Hide image if it fails to load, but keep text visible
              setImageError(true);
            }}
          />
        )}
      </div>
      
      {/* Text - matching PDF design exactly - always visible */}
      {/* <div className="flex flex-col">
        <span className="font-heading text-xl font-bold text-slate-800 leading-tight whitespace-nowrap">
          House Tour Guide
        </span>
        {showTagline && (
          <span className="text-xs text-slate-600 leading-tight">
            Find Your Home
          </span>
        )}
      </div> */}
    </Link>
  );
};

export default Logo;
