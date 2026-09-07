import { docTask } from "./cau-hinh-turbo.mjs";

const NEO = { test: false, "check-types": true, lint: true, build: true };

const d = docTask();
if (d === null) {
	console.error("KHONG DO DUOC: khong doc duoc workspaces hay turbo.json nao.");
	process.exit(2);
}
if (d.task.length === 0) {
	console.error("KHONG DO DUOC: khong task nao giai duoc tu cau hinh.");
	process.exit(2);
}

console.log(`workspaces: ${JSON.stringify(d.mau)} · goi: ${d.so_goi}`);
console.log(`cap (goi, task) giai duoc: ${d.task.length}`);
const conDem = d.task.filter((t) => t.dem);
console.log(`  con dem: ${conDem.length} · tat dem: ${d.task.length - conDem.length}`);

const lech = [];
for (const [task, mong] of Object.entries(NEO)) {
	const cua = d.task.filter((t) => t.task === task);
	if (cua.length === 0) {
		console.error(`KHONG DO DUOC: khong goi nao khai task ${task}`);
		process.exit(2);
	}
	const that = cua.every((t) => t.dem === mong);
	console.log(
		`  ${task.padEnd(12)} ${cua.length} goi · dem=${cua.every((t) => t.dem) ? "co" : cua.some((t) => t.dem) ? "lan lon" : "khong"} · neo=${mong ? "co" : "khong"}`,
	);
	if (!that)
		lech.push(
			`task ${task}: neo ghim dem=${mong} ma do duoc ${cua.filter((t) => t.dem !== mong).map((t) => `${t.goi}=${t.dem}`).join(" · ")}`,
		);
}

if (lech.length > 0) {
	for (const l of lech) console.error(`DO: ${l}`);
	process.exit(1);
}
console.log(
	"XANH: trang thai dem giai tu cau hinh (goi de goc), khop neo — khong danh sach task nao go tay.",
);
