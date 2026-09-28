import { defineDynamic, defineInstructions } from "eve/instructions";
import { dungLoiDan } from "../../lib/tai-lieu-loi-dan";
import { nguonCuaPhien } from "../../lib/tai-lieu-phien";

export default defineDynamic({
	events: {
		"session.started": async (_event, ctx) => {
			const { loiDan, khoiDuLieu } = await dungLoiDan(await nguonCuaPhien(ctx));
			return defineInstructions({ markdown: `${loiDan}\n\n${khoiDuLieu}` });
		},
	},
});
