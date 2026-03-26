import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { Provider } from 'react-redux';
import store from '@/app-store/store';
import {msalConfig} from "@/app-config/msalConfig";
import {PublicClientApplication} from "@azure/msal-browser";
// import { msalInstance } from '@/app-config/auth.config.ts';

export const msalInstance = new PublicClientApplication(msalConfig);

const root = ReactDOM.createRoot(
  document.getElementById("root")! as HTMLElement
);
root.render(
  <Provider store={store}>
      <App pca={msalInstance} />
  </Provider>
);

