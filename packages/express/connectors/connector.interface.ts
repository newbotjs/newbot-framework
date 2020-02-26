export interface PlatformConnector {
    handler(context: any)
    registerRoutes(platformName?: string)
    proactive(obj: any)
}