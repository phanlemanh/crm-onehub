import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { toNodeHandler } from "better-auth/node";
import { auth, xuLyXacThuc } from "../../src/auth";

const mayChu = createServer(toNodeHandler({ ...auth, handler: xuLyXacThuc }));

mayChu.listen(0, "127.0.0.1", () => {
	const { port } = mayChu.address() as AddressInfo;
	process.stdout.write(`CONG ${port}\n`);
});
