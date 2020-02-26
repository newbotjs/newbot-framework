export interface PlatformConnector {
    handler(context: any, input?: string, options?: any)
    registerRoutes(platformName?: string)
    proactive(obj: any)
}