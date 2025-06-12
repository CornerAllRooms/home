import React from 'react';
    import ReactDOM from 'react-dom';
    import { Auth0Provider } from '@auth0/auth0-react';
    import App from './App';
    ReactDOM.render(
      <Auth0Provider
        domain="dev-mi2biixmcyz4wpxg.us.auth0.com"
        clientId="u76cWojzUyD135BnNgDIg3I3rTNhsfMg"
        authorizationParams={{
          redirect_uri: window.location.origin
        }}
    >
      <App />
    </Auth0Provider>,
    document.getElementById('app')
 );