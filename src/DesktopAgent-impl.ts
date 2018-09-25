class MultiPlatformAgent implements DesktopAgent {
  platforms: fdc3Access;  // Our connection to the Platforms that represent 
  defaultPlatformName: string;  // Default Platform name

  open(name: String, context?: Context): Promise<void>
  {
      return this.platforms.openApplication(name, context);
  }

  resolve(intent: IntentName, context: Context): Promise<Array<AppMetadata>>
  {
      //TODO: I'm not sure how this works, is this returning an array of app instances?
      // in which case
      instances = this.platforms.resolveByIntent(intent, context);
      // Map to return type, also needs to stay a promise

      return null;
  }

  broadcast(context: Context): void
  {
      this.platforms.broadcast(context);
  }

  raiseIntent(intent: IntentName, context: Context, target?: String): Promise<IntentResolution>
  {
      this.platforms.raiseIntent(intent, context);
  }

  intentListener(intent: IntentName, handler: (context: Context) => void): Listener
  {
      // Not sure how to implement this.
      return this.platforms.intentListener(intent, "", this.defaultPlatformName, handler);
  }

  contextListener(handler: (context: Context) => void): Listener
  {
      return this.contextListener(defaultPlatformName, handler );
  }
  
}

// Currenty desktop agent - master branch  --------------------------
type Context = Object;
type IntentName = String;
type AppIdentifier = String;

enum OpenError {
  AppNotFound = "AppNotFound",
  ErrorOnLaunch = "ErrorOnLaunch",
  AppTimeout = "AppTimeout",
  ResolverUnavailable = "ResolverUnavailable"
}

enum ResolveError {
  NoAppsFound = "NoAppsFound",
  ResolverUnavailable = "ResolverUnavailable",
  ResolverTimeout = "ResolverTimeout"
}


/**
 * App metadata is Desktop Agent specific - but should support a name property.
 */
interface AppMetadata {
  name: AppIdentifier;
}

/**
 * IntentResolution provides a standard format for data returned upon resolving an intent.
 */
interface IntentResolution {
  source: String;
  data?: Object; 
  version: String;
}

interface Listener {
  /**
   * Unsubscribe the listener object.
   */
  unsubscribe();
}

/**
 * A Desktop Agent is a desktop component (or aggregate of components) that serves as a
 * launcher and message router (broker) for applications in its domain.
 * 
 * A Desktop Agent can be connected to one or more App Directories and will use directories for application
 * identity and discovery. Typically, a Desktop Agent will contain the proprietary logic of
 * a given platform, handling functionality like explicit application interop workflows where
 * security, consistency, and implementation requirements are proprietary.
 */
interface DesktopAgent {
  /**
   * Launches/links to an app by name.
   * 
   * If a Context object is passed in, this object will be provided to the opened application via a contextListener.
   * The Context argument is functionally equivalent to opening the target app with no context and broadcasting the context directly to it.
   *
   * If opening errors, it returns an `Error` with a string from the `OpenError` enumeration.
   */
  open(name: String, context?: Context): Promise<void>;

  /**
   * Resolves a intent & context pair to a list of App names/metadata.
   *
   * Resolve is effectively granting programmatic access to the Desktop Agent's resolver. 
   * Returns a promise that resolves to an Array. The resolved dataset & metadata is Desktop Agent-specific.
   * If the resolution errors, it returns an `Error` with a string from the `ResolveError` enumeration.
   */
  resolve(intent: IntentName, context: Context): Promise<Array<AppMetadata>>;

  /**
   * Publishes context to other apps on the desktop.
   */
  broadcast(context: Context): void;

  /**
   * Raises an intent to the desktop agent to resolve.
   */
  raiseIntent(intent: IntentName, context: Context, target?: String): Promise<IntentResolution>;

  /**
   * Listens to incoming Intents from the Agent.
   */
  intentListener(intent: IntentName, handler: (context: Context) => void): Listener;

  /**
   * Listens to incoming context broadcast from the Desktop Agent.
   */
  contextListener(handler: (context: Context) => void): Listener;
}