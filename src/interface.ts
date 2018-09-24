/**
* Copyright © 2014-2018 Tick42 BG OOD
* SPDX-License-Identifier: Apache-2.0
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

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
 * An fdc3Access instance provides an application with access to the FDC3 services provided by one
 * or more platforms.
 * Usage Note. For applications running on a Platform, the Platform may provide a pre-initialised 
 * fdc3Access instance. Applications may also instantiate their own instances which connect directly 
 * to the Platforms.
 * 
 * The current FDC3 services available via fdc3Access are :
 *  - Application management, which covers launching and activating applications. It is expected that the 
 * applictions available will have been read from one or more App Directory services but this is NOT a requirement.
 * NB SHould we include the enumerate apps here or leave that to the AppD REST API (my vote).
 *   - Intents, listing Intents and firing them.
 *   - Contexts, broadcasting 'current context' to interested applications.
 * 
 * The definitions of Applications, Intents and Contexts follow the proposals from the various FDC3 Working groups.
 * At some point in the future this interface can reference approved and (versioned) definitiosn from the WG's
 * in this iteration, the appropriate definitions have been copied in here to enable this to be a self contained
 * proposal.
 * 
 * Usage Note: Identity and Secutiry are key issues to be addressed in a future iteration.
 */
interface fdc3Access {

   // Applications -----------
   /**
    * Usage Note:
    *   Don't provide the 'list all apps type functions here'
    */

    /**
     * Launches/links to an app by name.
     * 
     * If opening errors, it returns an `Error` with a string from the `OpenError` enumeration.
     * 
     * config is optional config that may allow the caller to specify start poisitons etc.
     * 
     * TODO: Retrun a launch object which can provide launch errors and also optional access to 
     * an applicationInstanceId to identify an application instance.
     * TODO: Check on app name vs app id in AppD structure.
     * Default platform ?
     */
    openApplication(app: string|Application, context?: Context, config?: string, platform?: string|Platform): Promise<ApplicationInstance>;
  
    /**
     * List the running instances of an Application.
     * This is an optional method, some Platforms may not be able to track instances 
     * or may not be able to track instances of certain application types.
     * 
     * NB: The insnatnces can be activated or used for Intent activation 
     * @param name   Name or AppId of the application.
     */
    listApplicationInstances(name: string): Promise<ApplicationInstance[]>;

    /**
     * Activate (give focus, bring to front) and application instance/
     * this is optional and may only be available on certain platfomrs and/or Application Types.
     * @param instance 
     */
    activateAppInstance( instance: ApplicationInstance );     
    

    // Intents -----------------
  
  /**
   * Return the set of applications which can 'implement' the given Intent.
   * Optionally restrict the Intent by an actual Context, this might restrict applications
   * For example a Trade application may only be valid for Exchange traded equities
   * @param intent : The name of the Intent
   * @param context : An optional Context that is used to filter the Intents. 
   *                  
   */
    resolveByIntent(intent: IntentName, context?: Context): Promise<Intent[]>;

    /**
     * Return the Intents available that can implement an action for the given Context.
     * @param context 
     */
    resolveByContext(context: Context ): Promise<Array<Intent>>;
  

    /**
     * Return the Intents available that can implement an action for the given Context.
     * @param contextTypes  A list of contextTypes, independant of a particular context 
     */
    resolveByContextType(contextTypes: string[] ): Promise<Array<Intent>>;

    /**
     * Raises an intent to the desktop agent to resolve.
     */
    raiseIntent(intent: IntentName|Intent, context: Context): Promise<IntentResolution>;
  
    /**
     * Listens to incoming Intents from the Platforms.
     * This potentially can also register a method.
     * TODO: Can a single application provide multiple listents for an Intent ?
     * 
     * @param intent The name of the Intent to implement.
     * @param contextTypes The context types for which this handler is valid. 
     * @param handler The application handler to implement this intent for the listed contextTypes
     */
    intentListener(intent: IntentName, contextTypes: string[], handler: (context: Context, caller?: ApplicationInstance ) => void): Listener;
  
    // Context --------------------
    /**
     * Publishes context to other apps on the desktop.
     */
    broadcast(context: Context): void;

    /**
     * Listens to incoming context broadcast from the Desktop Agent.
     */
    contextListener(handler: (context: Context) => void): Listener;

    // Platform -----------
    /**
     * Provide a list of 'read only' info on the platforms that this instance of fdc3Access is providing access to.
     */
    listPlatforms(): Promise<Platform[]>;


    //TODO: Implement listener to report platform status chnages.

    // Capabilities -----------------
    /**
     * List capabilities that are supported by this instance
     * TODO: SHould we allow the user app to switch off a capability in an instance, for example disable the App Directory stuff and 
     * maybe App start to save space. Or defer this to the 'factory' method that an app uses to get an instance ?
     */

  }

/** Describe a platform which the Desktop Agent provides access */
interface Platform {
  name: string;
  version: string;
  platformApi?: object; // optional accessor to the Platform interop API, for example the Platform Agnostic interop API
}

/**
 * An FDC3 Application. 
 * UsageNote: Typically FDC3 applications are defined in an Applicastion Directory and started via FDC3
 * However applications can also be started 'outside' FDC3 and announce themselves. 
 */
interface Application {
  appId: string;  // FDC App D unique id. or missing if empty or null then this is not an App Directory defined application
  name?: string;  // App name
  platformName: string;  // If the application runs on a Platform, the name of the Platform. 
  appType?: string; // FDC3 AppD application type.
}

interface ApplicationInstance {
    app: Application;
    instanceId: string; // some id tbat uniquely indicateds whihc instance of the app where multiple instances are valid. 
                        // Blank if single isntance app.

}

/**
 * A read only description of an Application Directory
 */
interface ApplicationDirectoryServer {
    name: string;
    url: string;
    valid: boolean;    // Is the App Directory available and we have read applications.
    statusMsg: string;  // Status message, usually 'ok' but can hold access error if problem with URL or the data returned.
}

enum fdc3AccessFeature {
    startApplication,
    listApplications,
    getIntents,
    raiseIntent,
    context
}


interface Intent {
  intent: IntentName;
  context: Context;
  /**
   * Name of app to target for the Intent. Use if creating an explicit intent
   * that bypasses resolver and goes directly to an app.
   */
  target?: AppIdentifier;
  
  /**
   * Dispatches the intent with the Desktop Agent.
   * 
   * Accepts context data and target (if an explicit Intent) as optional args.
   * Returns a Promise - resolving if the intent successfully results in launching an App.
   * If the resolution errors, it returns an `Error` with a string from the `ResolveError` enumeration.
   */
  send(context: Context, target?: AppIdentifier): Promise<void>
}

/**
 * IntentResolution provides a standard format for data returned upon resolving an intent.
 * TODO: I don't understand what this does, is it about returning results, what does the version do?
 * Is the source, the ApplicationInstance that implemented the Intent?
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
  raiseIntent(intent: IntentName, context: Context, target: String): Promise<IntentResolution>;

  /**
   * Listens to incoming Intents from the Agent.
   */
  intentListener(intent: IntentName, handler: (context: Context) => void): Listener;

  /**
   * Listens to incoming context broadcast from the Desktop Agent.
   */
  contextListener(handler: (context: Context) => void): Listener;
}