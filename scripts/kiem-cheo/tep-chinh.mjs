import { realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";

export function laTepChinh(url, argv1 = process.argv[1]) {
	if (!argv1) return false;
	try {
		return realpathSync(fileURLToPath(url)) === realpathSync(argv1);
	} catch {
		return false;
	}
}
