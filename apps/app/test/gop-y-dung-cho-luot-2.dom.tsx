import { afterEach, beforeEach, setSystemTime } from "bun:test";
import { datLai, thaoHet } from "./khung-gop-y-dung-cho";

beforeEach(datLai);
afterEach(async () => {
	setSystemTime();
	await thaoHet();
});

await import("./gop-y-dung-cho-luot-2-khung");
await import("./gop-y-dung-cho-luot-2-dong");
