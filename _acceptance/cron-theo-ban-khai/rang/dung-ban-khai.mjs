import { readFileSync, writeFileSync } from "node:fs";
import {
	bangNhau,
	DUONG_CONFIG,
	DUONG_KHAI,
	docConfig,
	docKhai,
	dungLai,
} from "./chung.mjs";

const banGoc = readFileSync(DUONG_KHAI, "utf8");
let maRa = 0;

function motThe(ten, doi) {
	if (doi) {
		const k = JSON.parse(banGoc);
		doi(k);
		writeFileSync(DUONG_KHAI, `${JSON.stringify(k, null, "\t")}\n`);
	} else {
		writeFileSync(DUONG_KHAI, banGoc);
	}
	const khai = docKhai().crons;
	if (!Array.isArray(khai) || khai.length === 0) {
		console.error(
			"MA 2: ban khai 0 cron — hai ben cung rong thi 'bang nhau' khong noi len dieu gi",
		);
		process.exit(2);
	}
	const d = dungLai();
	if (d.ma !== 0) {
		console.error(`MA 2: luot dung the '${ten}' tra ma ${d.ma}`);
		console.error(d.chu.slice(-700));
		process.exit(2);
	}
	const cfg = docConfig();
	if (cfg === undefined) {
		console.error(`MA 2: khong thay ${DUONG_CONFIG}`);
		process.exit(2);
	}
	console.log(
		`  the '${ten}': doc ${DUONG_CONFIG} · khai ${khai.length} · ra ${(cfg.crons ?? []).length}`,
	);
	return { khai, ra: cfg.crons ?? [] };
}

try {
	const lanh = motThe("lanh", null);
	if (!bangNhau(lanh.khai, lanh.ra)) {
		console.error(
			"DO: khoi crons cua config.json KHONG bang khoi crons cua ban khai",
		);
		console.error(`  khai: ${JSON.stringify(lanh.khai)}`);
		console.error(`  ra:   ${JSON.stringify(lanh.ra)}`);
		maRa = 1;
		throw new Error("lanh lech");
	}

	const them = motThe("them", (k) =>
		k.crons.push({ path: "/internal/thu/them", schedule: "0 3 * * *" }),
	);
	if (!bangNhau(them.khai, them.ra) || them.ra.length !== lanh.ra.length + 1) {
		console.error(
			"DO: THEM mot dong vao ban khai ma config.json khong theo — no khong doc ban khai, no chi tinh co trung",
		);
		console.error(`  ra: ${JSON.stringify(them.ra)}`);
		maRa = 1;
		throw new Error("them lech");
	}

	const go = motThe("go", (k) => k.crons.pop());
	if (!bangNhau(go.khai, go.ra) || go.ra.length !== lanh.ra.length - 1) {
		console.error("DO: GO mot dong khoi ban khai ma config.json khong theo");
		console.error(`  ra: ${JSON.stringify(go.ra)}`);
		maRa = 1;
		throw new Error("go lech");
	}

	console.log(
		`XANH: config.json theo dung ban khai o ca ba the — lanh ${lanh.ra.length} · them ${them.ra.length} · go ${go.ra.length}`,
	);
} finally {
	writeFileSync(DUONG_KHAI, banGoc);
	if (readFileSync(DUONG_KHAI, "utf8") !== banGoc) {
		console.error("MA 2: khoi phuc ban khai THAT BAI — chan da de lai rac");
		maRa = 2;
	}
}

process.exit(maRa);
