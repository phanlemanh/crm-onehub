import { defineChannel, GET } from "eve/channels";
import { dauMocCay } from "../lib/cay";

export default defineChannel({
	routes: [GET("/health", async () => Response.json({ cay: dauMocCay() }))],
});
