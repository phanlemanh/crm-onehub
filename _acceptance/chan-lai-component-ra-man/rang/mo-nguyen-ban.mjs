import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { duongLuot, xoaTaoPhamCu } from "./luot-chay.mjs";

const GOC = join(import.meta.dirname, "..", "..", "..");
const TAO_PHAM = duongLuot("mo-nguyen-ban.json");

export const NEO_DONG = 10;

export function chayBoVe() {
	xoaTaoPhamCu("mo-nguyen-ban.json");
	try {
		execFileSync(
			"bun",
			["test", "--preload", "./test/setup-dom.ts", "test/lai-ra-man.spec.tsx"],
			{ cwd: join(GOC, "packages/ui"), stdio: "pipe" },
		);
	} catch (e) {
		const ra = `${e.stdout ?? ""}${e.stderr ?? ""}`;
		console.error(`bo ve khong chay tron:\n${ra.slice(-900)}`);
	}
}

export function docMoNguyenBan() {
	if (!existsSync(TAO_PHAM)) return null;
	return JSON.parse(readFileSync(TAO_PHAM, "utf8"));
}

function chan() {
	chayBoVe();
	const ra = docMoNguyenBan();
	if (ra === null) {
		console.error(
			"KHONG DO DUOC: khong co tao pham mo-nguyen-ban.json — bo ve chua chay duoc.",
		);
		return 2;
	}
	const ten = Object.keys(ra);
	const hong = ten.filter((t) => ra[t].loi !== null);
	for (const t of ten) {
		const c = ra[t];
		const nhan = c.loi !== null ? `HONG: ${c.loi.slice(0, 60)}` : c.chu.length === 0 ? "rong" : `${c.chu.length} chuoi`;
		console.log(`  ${t}  ${nhan}`);
	}
	console.log(`dong doc duoc: ${ten.length} · neo doc lap: ${NEO_DONG}`);
	if (ten.length !== NEO_DONG) {
		const bang = JSON.parse(
			readFileSync(
				join(
					GOC,
					"_acceptance/chu-mac-dinh-thu-vien-ngoai/rang/gioi-han-bam-moi-hien.json",
				),
				"utf8",
			),
		);
		const conLai = new Set(bang.dong.map((d) => d.component));
		console.error(
			`DO: so dong ${ten.length} lech neo doc lap ${NEO_DONG} — bang hien khai: ${[...conLai].join(" · ")}`,
		);
		return 1;
	}
	if (ten.length === 0) {
		console.error("KHONG DO DUOC: khong dong nao mount duoc");
		return 2;
	}
	if (hong.length > 0) {
		for (const t of hong) console.error(`DO: dong ${t} khong mount duoc — ${ra[t].loi}`);
		return 1;
	}
	const rong = ten.filter((t) => ra[t].chu.length === 0);
	console.log(
		`XANH: ca ${ten.length} dong deu mount duoc o trang thai mo. ${rong.length} dong khong sinh chu nao; ${ten.length - rong.length} dong co sinh.`,
	);
	return 0;
}

if (process.argv[1]?.endsWith("mo-nguyen-ban.mjs")) process.exit(chan());
