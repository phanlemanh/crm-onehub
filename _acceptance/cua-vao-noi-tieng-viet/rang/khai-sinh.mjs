import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = resolve(HERE, "../../..");

const CHAN = (c) => ({
	muc: `cua-vao.mjs ${c}`,
	chay: () => chayNode([`${HERE}/cua-vao.mjs`, c]),
});

const DANH_SACH = [
	CHAN("dang-nhap"),
	CHAN("khai-bao"),
	CHAN("khong-co-duong"),
	CHAN("trang-thai-tam"),
	CHAN("dang-gui"),
	CHAN("khong-dich"),
	CHAN("ten-sso"),
	CHAN("tieu-de-tai-lieu"),
	CHAN("be-rong"),
	CHAN("chan-trang"),
	CHAN("loi-mang"),
	CHAN("chon-tieng-may-chu"),
	{
		muc: "chu-cung-jsx.mjs --lat lat-cua-vao.json",
		chay: () =>
			chayNode([
				`${GOC}/_acceptance/nhan-ung-dung-noi-tieng-viet/rang/chu-cung-jsx.mjs`,
				"--lat",
				`${HERE}/lat-cua-vao.json`,
			]),
	},
	{
		muc: "test/locale-resolve.spec.ts",
		chay: () =>
			chayBun(["test", "test/locale-resolve.spec.ts"], `${GOC}/apps/app`),
	},
	{
		muc: "test/auth-messages.spec.ts",
		chay: () =>
			chayBun(["test", "test/auth-messages.spec.ts"], `${GOC}/apps/app`),
	},
];

const N = 15;

if (DANH_SACH.length !== N) {
	console.log(
		`KHONG DO DUOC: danh sach khai sinh co ${DANH_SACH.length} muc, ghim la ${N}`,
	);
	process.exit(2);
}

function chay(cmd, args, cwd) {
	try {
		const ra = execFileSync(cmd, args, {
			cwd: cwd ?? GOC,
			encoding: "utf8",
			env: process.env,
			stdio: ["ignore", "pipe", "pipe"],
		});
		return { ma: 0, ra };
	} catch (e) {
		return { ma: e.status ?? 1, ra: `${e.stdout ?? ""}${e.stderr ?? ""}` };
	}
}

const chayNode = (args) => chay("node", args);
const chayBun = (args, cwd) => chay("bun", args, cwd);

const bang = [];
let tuChoi = 0;

for (const muc of DANH_SACH) {
	const lanh = muc.chay();
	if (lanh.ma === 2) {
		bang.push({
			muc: muc.muc,
			lanh: "TU CHOI",
			do: "-",
			ghi: lanh.ra.trim().split("\n").pop()?.slice(0, 140) ?? "",
		});
		tuChoi += 1;
		continue;
	}
	bang.push({
		muc: muc.muc,
		lanh: lanh.ma === 0 ? "im" : "DO KHI LANH",
		do: "chua chung",
		ghi:
			lanh.ma === 0
				? ""
				: (lanh.ra.trim().split("\n").pop()?.slice(0, 140) ?? ""),
	});
}

if (bang.length !== N) {
	console.log(
		`KHONG DO DUOC: bang ket qua co ${bang.length} dong, phai co ${N}`,
	);
	process.exit(2);
}

console.log(
	`so khai sinh — ${N} muc, danh sach dong viet trong chinh file nay\n`,
);
for (const d of bang)
	console.log(
		`  ${d.lanh.padEnd(11)} ${d.muc.padEnd(46)} ${d.ghi ? `· ${d.ghi}` : ""}`,
	);

if (tuChoi > 0) {
	console.log(
		`\nKHONG DO DUOC: ${tuChoi}/${N} muc TU CHOI DO vi ha tang hoac fixture. ` +
			"Mot muc khong chay duoc khong bao gio la mot luot dat.",
	);
	process.exit(2);
}

const hong = bang.filter((d) => d.lanh !== "im");
if (hong.length > 0) {
	console.log(`\nDO KHI LANH: ${hong.map((d) => d.muc).join(" · ")}`);
	process.exit(1);
}

console.log(`\nket qua: ${N}/${N} muc im o chieu lanh`);
