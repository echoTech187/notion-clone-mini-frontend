export default function AuthLayout({ children }) {
    return (
        <div className="min-h-screen flex items-center justify-between">
            {children}
        </div>
    );
}