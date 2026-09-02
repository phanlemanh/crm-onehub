import { execFileSync } from "node:child_process";
import { z } from "../../../packages/validation/node_modules/zod/index.js";

const API = process.env.API_URL ?? "http://localhost:3001";

const chuTrong = z.string().trim().min(1);
const dong = z.object({
	name: chuTrong,
	owner: z.object({ name: chuTrong.nullish() }).nullable().default(null),
	lastActivityAt: z.coerce.date().nullable().default(null),
});
const danhSach = z.object({ rows: z.array(dong) });

function phien() {
	const raw = execFileSync(
		"bun",
		["run", "dev:session", "manh.phan@onemount.com"],
		{ cwd: "apps/api", encoding: "utf8" },
	);
	const line = raw.trim().split("\n").pop().trim();
	const eq = line.indexOf("=");
	return `${line.slice(0, eq)}=${line.slice(eq + 1)}`;
}

const url = `${API}/api/trpc/companies.list?input=${encodeURIComponent(
	JSON.stringify({ json: {} }),
)}`;
let res;
try {
	res = await fetch(url, { headers: { Cookie: phien() } });
} catch (loi) {
	console.log(
		`RANG CUN: khong noi duoc toi may chu o ${API} (${loi.cause?.code ?? loi.message}).\n` +
			"Dung may chu dev TU CAY LAM VIEC nay truoc khi tin bat ky con so nao:\n" +
			"  cd apps/api && bun run dev\n" +
			"  cd apps/app && PORT=3100 API_URL=http://localhost:3001 APP_URL=http://localhost:3100 bun run dev",
	);
	process.exit(2);
}
if (!res.ok) {
	console.log(`RANG CUN: may chu tra ${res.status}, khong doc duoc du lieu thu`);
	process.exit(2);
}
const { rows } = danhSach.parse((await res.json()).result.data);

const BA_MUOI_NGAY = 30 * 86_400_000;
const can = [
	{
		ten: "khong nguoi phu trach",
		vi_sao: "khoa facets.unassigned chi hien khi co hang nay",
		loc: (r) => !r.owner,
	},
	{
		ten: "co hoat dong trong 30 ngay",
		vi_sao: "ba chu thoi gian tuong doi chi hien khi co hang nay",
		loc: (r) =>
			r.lastActivityAt !== null &&
			Date.now() - r.lastActivityAt.getTime() < BA_MUOI_NGAY,
	},
	{
		ten: "ten phap nhan 40-60 ky tu",
		vi_sao: "be rong cot chua bao gio gap ten that dai",
		loc: (r) => r.name.length >= 40 && r.name.length <= 60,
	},
];

console.log(`-- du lieu thu: ${rows.length} cong ty`);
let thieu = 0;
for (const c of can) {
	const hit = rows.filter(c.loc);
	if (hit.length === 0) thieu += 1;
	console.log(
		`   ${hit.length === 0 ? "THIEU" : "co   "} ${String(hit.length).padStart(3)} hang · ${c.ten}`,
	);
	if (hit.length === 0) console.log(`         vi sao can: ${c.vi_sao}`);
	else console.log(`         vi du: ${JSON.stringify(hit[0].name)}`);
}
console.log(`ket qua: trang thai thieu=${thieu}/${can.length}`);
process.exit(thieu > 0 ? 1 : 0);
