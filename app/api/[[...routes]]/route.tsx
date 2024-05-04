import fountain from "../../components/fountain";
import { browserLocation } from "@/app/utils";
import { Frog } from "frog";
import { devtools } from "frog/dev";
import { handle } from "frog/next";
import { serveStatic } from "frog/serve-static";

const app = new Frog({
  assetsPath: "/",
  basePath: "/api",
  browserLocation,
});

app.route("/fountain", fountain);

devtools(app, { serveStatic });

export const GET = handle(app);
export const POST = handle(app);
