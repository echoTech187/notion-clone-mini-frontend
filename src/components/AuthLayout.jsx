
export const AuthLayout = ({ children, title = 'NotionCloneMini', showSidebar = true }) => {
    return (
        <div className="min-h-screen flex items-center justify-between">
            {children}
        </div>
    );
}

export default AuthLayout