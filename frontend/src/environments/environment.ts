import { Environment } from './environment.model';

/** Production build, deployed as a static site on Render. */
export const environment: Environment = {
  production: true,
  apiUrl: 'https://nikkura-api.onrender.com',
  jikanUrl: 'https://api.jikan.moe/v4',
  firebase: {
    apiKey: 'AIzaSyCPuHZW9xAThPjsW1lZdjuid8gVXMSdkK8',
    authDomain: 'nikkura-d36d0.firebaseapp.com',
    projectId: 'nikkura-d36d0',
    appId: '1:1053767257090:web:f2ff37daa529875d5cab1b',
  },
};
