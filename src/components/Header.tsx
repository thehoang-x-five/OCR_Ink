import { motion } from 'framer-motion';

const Header = () => {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-50 backdrop-blur-md bg-card/80 border-b border-border/50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-primary-foreground"
                >
                  <path
                    d="M4 5a2 2 0 012-2h8l6 6v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5z"
                    fill="currentColor"
                    fillOpacity="0.3"
                  />
                  <path
                    d="M14 3v6h6M8 13h8M8 17h5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Doc<span className="text-gradient">Text</span>
              </h1>
              <p className="text-xs text-muted-foreground -mt-0.5">OCR & Converter</p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-success-light border border-success/20">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs font-medium text-success">Ready</span>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
