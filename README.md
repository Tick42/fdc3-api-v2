# fdc3-api-v2
Proposed FDC3 Application API

src\interface.ts contains the proposed FDC3 client API to work with starting applications, Intents and Contexts.
This API has explicit definitions for Applications, Context and Intent based on the current discussions of the relevant Working Groups. 
This interface also allows client applications to deal with applications than can be started and applications that are already running.

Finally this interface is designed to work with Applications and Intents that are supported by multiple Platforms using a single configuration driven implementation.
New Platforms can supported if they implement a small number of methods that could be invoked using the Plexus interop procedure using any architecture that is appropriate to that Platform,

examples\DesktopAgent-impl.ts shows how the current API maps to new API.  
 
