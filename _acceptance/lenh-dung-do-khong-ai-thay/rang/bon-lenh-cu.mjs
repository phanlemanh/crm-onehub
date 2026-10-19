import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

const LENH = [
	["test", ["bun", ["run", "test"]]],
	["check-types", ["bunx", ["turbo", "run", "check-types", "--force"]]],
	["lint", ["bunx", ["turbo", "run", "lint", "--force"]]],
	["lint:slop", ["bun", ["run", "lint:slop"]]],
];

export function danhGia(ketQua) {
	const ds = JSON.parse(String(ketQua));
	const hong = ds.filter((k) => k.ma !== 0);
	if (ds.length !== LENH.length) return { dat: false, chu: `chay ${ds.length} lenh, ky vong ${LENH.length}` };
	return hong.length
		? { dat: false, chu: `${hong.length} lenh chung cu khong ma 0: ${hong.map((k) => `${k.ten}=${k.ma}`).join(", ")}` }
		: { dat: true, chu: "bon lenh chung cu deu ma 0" };
}

if (import.meta.main) {
	const ketQua = [];
	for (const [ten, [lenh, doi]] of LENH) {
		const ra = spawnSync(lenh, doi, { cwd: GOC, encoding: "utf8", maxBuffer: 512 * 1024 * 1024 });
		if (ra.error) {
			console.error(`MA 2: khong chay duoc \`${ten}\` — ${ra.error.message}`);
			process.exit(2);
		}
		console.log(`${ten}: ma ${ra.status}`);
		ketQua.push({ ten, ma: ra.status });
	}
	const kq = danhGia(JSON.stringify(ketQua));
	if (!kq.dat) {
		console.error(`DO: ${kq.chu}.`);
		process.exit(1);
	}
	console.log(`XANH: ${kq.chu}.`);
}
