/** Shape shared by every environment file, so all of them define the same keys. */
export interface Environment {
  production: boolean;
  /** Base URL of the Nikkura FastAPI backend (user data only). */
  apiUrl: string;
  /** Base URL of the public Jikan v4 API (anime data). */
  jikanUrl: string;
  /**
   * Firebase web app config. These values are public by design (they identify
   * the project, they do not grant access); access is controlled by the Firebase
   * Auth settings and the backend, which checks every ID token.
   */
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    appId: string;
  };
}
