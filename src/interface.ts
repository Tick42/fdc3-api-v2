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

enum SendError {
  SendOK = "OK",
  UnknownPlatform = "Invalid Platform",
  PlatformNotConnected = "Platform Not connected",
  PlatformError = "Platform Error"
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
export interface fdc3Access {

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
     * @param name   Name or AppId of the application or the Application definition returned from an App Directory.
     * @param platform  Optional, name of the platform hosting the application. THis can help speed up the search if
     *                    - FDC3 App instance hosts multiple Platforms.
     *                    - Using app name rather than Application definition.
     */
    listApplicationInstances(app: string|Application, platform?: string): Promise<ApplicationInstance[]>;

    /**
     * Activate (give focus, bring to front) and application instance/
     * this is optional and may only be available on certain platfomrs and/or Application Types.
     * @param instance 
     */
    activateAppInstance( instance: ApplicationInstance );     
    

    // Intents -----------------
  
    // The Resolve methods listed below are available to allow the Resolver functionality to be implemented
    // This can be implemented, as a DesktopAgent resolver or directly implemented by the client applications
    // using these methods.

  /**
   * Return the set of applications which can 'implement' the given Intent.
   * Optionally restrict the Intent by an actual Context, this might restrict applications
   * For example a Trade application may only be valid for Exchange traded equities
   * @param intent : The name of the Intent
   * @param context : An optional Context that is used to filter the Intents. 
   *                  
   */
    resolveByIntent(intentName: string, context?: Context): Promise<IntentList[]>;

    /**
     * Return the Intents available that can implement an action for the given Context.
     * @param context 
     */
    resolveByContext(context: Context ): Promise<IntentList[]>;
  

    /**
     * Return the Intents available that can implement an action for the given Context.
     * @param contextTypes  A list of contextTypes, independant of a particular context 
     */
    resolveByContextType(contextTypes: string[] ): Promise<IntentList[]>;

   /**
     * Execute/raise/call/fire the Intent using the given application or ApplicationInstance
     */
    raiseIntent(intentName: string, context: Context, app: Application|ApplicationInstance): Promise<IntentResult>;
 
    /**
     * Raises an intent allow the implementation to select an app to implement this.
     */
    raiseIntent(intentName: string, context: Context): Promise<IntentResult>;

    /**
     * Execute/raise/call/fire the Intent using the given application.
     */
    raiseIntent(intentName: string, context: Context, app: Application|ApplicationInstance): Promise<IntentResult>;


    /**
     * Listens to incoming Intents from the Platforms.
     * This potentially can also register a method.
     * TODO: Can a single application provide multiple listents for an Intent ?
     * 
     * @param intent The name of the Intent to implement.
     * @param contextTypes The context types for which this handler is valid. 
     * @param platformName Which Platform should the method be published on, if emptuy or null chose the default platform
     * @param handler The application handler to implement this intent for the listed contextTypes
     */
    intentListener(intentName: string, contextTypes: string[], platformName: string, handler: (context: Context, caller?: ApplicationInstance ) => object): Listener;
  
    // Context --------------------
    /**
     * Publishes context to other apps on the desktop.
     * TODO: Invoke promise to indicate sent or connection failure
     */
    broadcast(context: Context, instance?: ApplicationInstance): Promise<BroadcastResult>;

    /**
     * Listens to incoming context broadcast from the Desktop Agent.
     */
    contextListener(platformName:string, handler: (context: Context) => void): Listener;

    // Platform -----------
    /**
     * Provide a list of 'read only' info on the platforms that this instance of fdc3Access is providing access to.
     */
    listPlatforms(): Promise<Platform[]>;

    // TODO: Implement events to track Platforms going off line.

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
  online: boolean;
  connectionStatus: string; // Error text describing !online state
  config?: string; // Optional read only Platform config (often JSon) for use in debugging.
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

/**
 * Provide a list of applications that can be started that can handle an Intent
 */
interface IntentList {
  intentName; string;

  applications: IntentApplication[];  // List of 0 or more applications that can be opened to handle an Intent
  applicationInstances: IntentApplicationInstance[]; // List of 0 or more applications that are already running that can handle the Intent.
}


interface IntentApplication {
  application: Application;
  contextTypes: string; // Defines the list of context types this application can handle the Intent.
  methodName?: string;  // The method to invoke that implementes the Intent, default is Fdc3RxIntent<IntentName>
}

interface IntentApplicationInstance {
  instance: ApplicationInstance;  // The running Applicastion instance that can handle the Intent
  contextTypes: string; // Defines list of context types.
  methodName?: string;  // The method to invoke that implementes the Intent, default is Fdc3RxIntent<IntentName>
}

/**
 * IntentResolution provides a standard format for data returned upon resolving an intent.
 * TODO: I don't understand what this does, is it about returning results, what does the version do?
 * Is the source, the ApplicationInstance that implemented the Intent?
 */
interface IntentResult {
  app: ApplicationInstance; // The application instance that handled the Intent
  result?: Object; // Optional result data from the Intent.
}

interface Listener {
  /**
   * Unsubscribe the listener object.
   */
  unsubscribe();
}

interface BroadcastResult
{
  success: boolean;
  error: SendError;
  errorMsg?: string;  // Optional detailed error message, esp if error == PlatformError.
}

/**
 * A context consists of one or more data items.
 * A data item e.g, an instrumnent or a c lient could be described using multiple formats.
 */
interface Context {
  items: ContextItem[];
}

/**
 * A single context data item.
 * NB A data items may be presented using multiple formats.
 */
interface ContextItem {
  itemFormat: ContextItemFormat[];  // The data items 

  /**
   * Return a  comma separated list of all the formats used to define this data item.
   */
  getFormats() : string;  
}

interface ContextItemFormat {
  format: string; //The name of the format using FDC3 Context WG format == type.
  data: object;   // The item data in the given format.
}
