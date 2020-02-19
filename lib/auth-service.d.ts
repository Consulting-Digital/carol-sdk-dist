declare class AuthService {
    login(email: string, password: string): Promise<any>;
    logout(): Promise<unknown>;
}
export declare const authService: AuthService;
export {};
