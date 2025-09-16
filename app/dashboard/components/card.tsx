export const Card = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
    <div className={`bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 ${className}`}>
        {children}
    </div>
);
