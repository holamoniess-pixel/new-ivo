const LoadingSpinner = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center justify-center py-12 ${className}`}>
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-secondary border-t-primary" />
  </div>
);

export default LoadingSpinner;
