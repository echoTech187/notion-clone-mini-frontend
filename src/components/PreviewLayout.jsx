

const PreviewLayout = ({ children, title = 'NotionCloneMini' }) => {

    return (
        <main className={`flex-1 overflow-y-auto `}>
            {children}
        </main>
    );
};

export default PreviewLayout;