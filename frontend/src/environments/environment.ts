import { Environment } from './environment.model';

/** Production build, deployed as a static site on Render. */
export const environment: Environment = {
  production: true,
  apiUrl: 'https://nikkura-api.onrender.com',
  jikanUrl: 'https://api.jikan.moe/v4',
  firebase: {
    apiKey: '',
    authDomain: '',
    projectId: '',
    appId: '',
  },
};
