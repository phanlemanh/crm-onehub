import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";

const THU_MUC = "test";
const DUOI = ".dom.tsx";

const tep = readdirSync(THU_MUC)
	.filter((ten) => ten.endsWith(DUOI))
	.sort();

if (tep.length === 0) {
	console.error(
		`chay-dom: không có tệp *${DUOI} nào trong ${process.cwd()}/${THU_MUC}`,
	);
	process.exit(1);
}

const co = process.argv.slice(2);

for (const ten of tep) {
	const duong = `${THU_MUC}/${ten}`;
	console.log(`chay-dom: ${duong}`);
	const kq = spawnSync("bun", ["test", ...co, `./${duong}`], {
		stdio: "inherit",
	});
	const ma = kq.status ?? 1;
	if (ma !== 0) {
		console.error(`chay-dom: ${duong} đỏ (mã ${ma})`);
		process.exit(ma);
	}
}
