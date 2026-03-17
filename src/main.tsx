import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { Provider } from 'react-redux';
import store from '@/app-store/store';
import {msalConfig} from "@/app-config/msalConfig";
import {PublicClientApplication} from "@azure/msal-browser";
// import { msalInstance } from '@/app-config/auth.config.ts';

export const msalInstance = new PublicClientApplication(msalConfig);

// msalInstance.initialize().then(() => {
//     // Account selection logic is app dependent. Adjust as needed for different use cases.
//     const accounts = msalInstance.getAllAccounts();
//     if (accounts.length > 0) {
//         msalInstance.setActiveAccount(accounts[0]);
//     }

//     msalInstance.addEventCallback((event: EventMessage) => {
//         if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
//             const payload = event.payload as AuthenticationResult;
//             const account = payload.account;
//             msalInstance.setActiveAccount(account);
//         }
//     });

const root = ReactDOM.createRoot(
  document.getElementById("root")! as HTMLElement
);
root.render(
  <Provider store={store}>
      <App pca={msalInstance} />
  </Provider>
);

