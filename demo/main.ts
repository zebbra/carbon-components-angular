import "./polyfills.ts";

// add typings so we have the definition for json files
import "./demo-app/typings.d";

import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
import { enableProdMode } from "@angular/core";
import { AppModule } from "./demo-app";

if (window.location.hostname === "pages.github.ibm.com") {
	enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule);
