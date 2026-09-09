import { readFileSync } from "node:fs";
import { join } from "node:path";
import { chay, chayRang, coCo, GOC, hong, RANG } from "./chung.mjs";

const GHIM_LECH = "so dong khai lech so vecto";
const DUONG_EVALS = "_acceptance/do-quyen-luot-bang-hanh-vi/evals.yaml";

const boMaNgoac = (chu) => chu.replace(/`[^`]*`/g, "");

function evalsScript() {
	const nguon = readFileSync(join(GOC, DUONG_EVALS), "utf8");
	const khoi = nguon.split(/^  - id: /m).slice(1);
	const ra = [];
	for (const k of khoi) {
		const id = k.split("\n")[0].trim();
		const executor = k.match(/^\s{4}executor:\s*(\S+)/m)?.[1];
		if (executor !== "script") continue;
		const than = k.slice(k.indexOf("expected:"));
		const ten = [...boMaNgoac(than).matchAll(/vecto "([^"]+)"/g)].map(
			(m) => m[1],
		);
		ra.push({ id, ten });
	}
	return ra;
}

function docKhai() {
	const duong = process.env.KHAI_SINH ?? join(RANG, "khai-sinh.json");
	const khai = JSON.parse(readFileSync(duong, "utf8"));
	if (!Array.isArray(khai) || khai.length === 0) {
		hong(`${GHIM_LECH}\n  ban khai sinh rong: ${duong}`);
	}
	for (const dong of khai) {
		for (const truong of ["id", "vecto", "chay", "ghim", "ma"]) {
			if (dong[truong] === undefined) {
				hong(
					`${GHIM_LECH}\n  dong khai thieu truong "${truong}": ${JSON.stringify(dong)}`,
				);
			}
		}
	}
	return khai;
}

function doiChieu(khai) {
	const lech = [];
	for (const { id, ten } of evalsScript()) {
		const dong = khai.filter((d) => d.id === id);
		if (dong.length !== ten.length) {
			lech.push(
				`  ${id}: expected khai ${ten.length} vecto, khai-sinh.json co ${dong.length} dong`,
			);
			continue;
		}
		const a = [...ten].sort().join(" · ");
		const b = dong
			.map((d) => d.vecto)
			.sort()
			.join(" · ");
		if (a !== b) {
			lech.push(
				`  ${id}: ten vecto lech\n      expected: ${a}\n      ban khai: ${b}`,
			);
		}
	}
	const idEval = new Set(evalsScript().map((e) => e.id));
	for (const dong of khai) {
		if (!idEval.has(dong.id)) {
			lech.push(
				`  ${dong.id}: ban khai co dong cho mot eval khong phai executor script`,
			);
		}
	}
	if (lech.length > 0) hong(`${GHIM_LECH}\n${lech.join("\n")}`);
}

function chayBanKhai(khai) {
	const hongDong = [];
	for (const dong of khai) {
		const r = chay(GOC, dong.chay);
		const nhan = dong.ma === 0 ? "doi chung duong" : "chieu do";
		process.stdout.write(
			`${dong.id} · ${dong.vecto} (${nhan}): ma ${r.ma}, mong doi ${dong.ma}\n`,
		);
		if (r.ma !== dong.ma) {
			hongDong.push(
				dong.ma !== 0 && r.ma === 0
					? `  dong khai ra xanh: ${dong.id} · ${dong.vecto}`
					: `  ${dong.id} · ${dong.vecto}: ma ${r.ma}, khai ${dong.ma}`,
			);
			continue;
		}
		if (!r.chu.includes(dong.ghim)) {
			hongDong.push(
				`  ${dong.id} · ${dong.vecto}: thieu thong diep ghim "${dong.ghim}"`,
			);
		}
	}
	if (hongDong.length > 0) {
		hong(`ban khai sinh khong chay dung nhu khai\n${hongDong.join("\n")}`);
	}
	process.stdout.write(
		`khai-sinh: ${khai.length} dong khai deu chay dung nhu khai\n`,
	);
}

chayRang(() => {
	const ten = coCo("--vecto");
	if (ten === "khai-thieu-vecto") {
		const day = docKhai();
		const thieu = day.filter(
			(d, i) =>
				i !== day.findIndex((x) => x.id === "E4" && x.vecto === "quan-he-long"),
		);
		process.stdout.write(
			`vecto: khai-thieu-vecto — bo dong E4 · quan-he-long, con ${thieu.length} dong\n`,
		);
		doiChieu(thieu);
		hong(
			`vecto "khai-thieu-vecto" ra XANH — doi chieu khong bat duoc dong khai bi bo`,
		);
	}
	if (ten) hong(`khong co vecto ten "${ten}" — co: khai-thieu-vecto`);

	const khai = docKhai();
	doiChieu(khai);
	chayBanKhai(khai);
});
