import { Environment } from './environment.model';

/** Local development with `npm start` and the backend running on port 8000. */
export const environment: Environment = {
  production: false,
  apiUrl: 'http://localhost:8000',
  jikanUrl: 'https://api.jikan.moe/v4',
  firebase: {
    apiKey: 'AIzaSyCPuHZW9xAThPjsW1lZdjuid8gVXMSdkK8',
    authDomain: 'nikkura-d36d0.firebaseapp.com',
    projectId: 'nikkura-d36d0',
    appId: '1:1053767257090:web:f2ff37daa529875d5cab1b',
  },
};
