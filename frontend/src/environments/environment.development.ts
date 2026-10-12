import { Environment } from './environment.model';

/** Local development with `npm start` and the backend running on port 8000. */
export const environment: Environment = {
  production: false,
  apiUrl: 'http://localhost:8000',
  jikanUrl: 'https://api.jikan.moe/v4',
  firebase: {
    apiKey: '',
    authDomain: '',
    projectId: '',
    appId: '',
  },
};
