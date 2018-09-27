
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

/**
 * This file shows how the current FDC3 API DesktopAgent interface can be implemented in terms of the 
 * interface proposed here. 
 */
import { fdc3Access, ApplicationInstance } from "../src/interface"
import { Context as ContextV2 } from '../src/interface'

class MultiPlatformAgent implements DesktopAgent {
  platforms: fdc3Access;  // Our connection to the Platforms that represent 
  defaultPlatformName: string;  // Default Platform name

  open(name: String, context?: Context): Promise<void> {
    return new Promise((resolve, reject) => {

      this.platforms.open(name as string, context as ContextV2)
        .then(() => { resolve() })
        .catch(() => { reject() });
    }
    );
  }

  resolve(intent: IntentName, context: Context): Promise<Array<AppMetadata>> {
    //TODO: I'm not sure how this is meant to work. What is in the AppMetadata ?

    return new Promise((resolve, reject) => {
      this.platforms.resolveByIntent(intent as string, context as ContextV2)
        .then((instances)=>{
           const mapped : AppMetadata[] = undefined;
           /*
             TODO Not sure of structure of the AppMetadata IntentResolution. 
             In the API proposed here, resolve returns a list of Applications which can opened and running
             applications on which the Intent could be raised using Interop.

             it is important to realise that not all applications will be defined in an App Directory
           */
           resolve(mapped);
        })
        .catch(reject);
      });
  }

  broadcast(context: Context): void {
    this.platforms.broadcast(context as ContextV2);
  }

  raiseIntent(intent: IntentName, context: Context, target?: String): Promise<IntentResolution> {

    return new Promise((resolve, reject) => {
      this.platforms.raiseIntentPrompt(intent as string, context as ContextV2)
        .then((result)=>{
           var resultV1 : IntentResolution;
           resultV1.data=result.result;
           resultV1.source = result.app.app.appId;  // TODO What kind of representation is used for an application instance 
           resultV1.version = ""; //TODO What kind of value is here

           resolve(resultV1);
        })
        .catch(reject);
      });

  }

  intentListener(intent: IntentName, handler: (context: Context) => void): Listener {
    //TODO map handler types
    return this.platforms.intentListener(intent as string, "*", (context:ContextV2, caller?: ApplicationInstance):object=>{
      return null;
    });
  }

  contextListener(handler: (context: Context) => void): Listener {
    return this.platforms.contextListener(handler);
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