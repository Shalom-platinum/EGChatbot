import { useMsal } from '@azure/msal-react';

const AppLauncher = () => {
    const { instance } = useMsal();

    const apps = [
        { name: 'App B', url: 'https://appb.yourcompany.com', icon: '📱' },
        { name: 'App C', url: 'https://appc.yourcompany.com', icon: '💼' },
        { name: 'App D', url: 'https://appd.yourcompany.com', icon: '📊' }
    ];

    const handleAppClick = async (appUrl) => {
        try {
            // Check if user is authenticated
            const accounts = instance.getAllAccounts();
            
            if (accounts.length > 0) {
                // User is authenticated, just navigate
                // The other app will handle SSO automatically
                window.location.href = appUrl;
            } else {
                // User not authenticated (shouldn't happen, but safety check)
                await instance.loginRedirect();
            }
        } catch (error) {
            console.error('Navigation error:', error);
        }
    };

    return (
        <div className="app-launcher">
            <h3>My Apps</h3>
            <div className="app-grid">
                {apps.map((app) => (
                    <div 
                        key={app.name}
                        className="app-card"
                        onClick={() => handleAppClick(app.url)}
                    >
                        <div className="app-icon">{app.icon}</div>
                        <div className="app-name">{app.name}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AppLauncher;