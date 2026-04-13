import { OktaAuth } from '@okta/okta-auth-js';

const domain = (process.env.NEXT_PUBLIC_OKTA_DOMAIN ?? '').replace(/^https?:\/\//, '');

const oktaAuth = new OktaAuth({
  issuer: `https://${domain}/oauth2/default`,
  clientId: process.env.NEXT_PUBLIC_OKTA_CLIENT_ID!,
  redirectUri: `${typeof window !== 'undefined' ? window.location.origin : ''}/callback`,
  scopes: ['openid', 'profile', 'email', 'groups'],
  pkce: true,
});

export default oktaAuth;
