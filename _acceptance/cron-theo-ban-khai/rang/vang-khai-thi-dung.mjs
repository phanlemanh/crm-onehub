import {
	existsSync,
	readFileSync,
	renameSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { DUONG_CONFIG, DUONG_KHAI, docConfig, dungLai } from "./chung.mjs";

const banGoc = readFileSync(DUONG_KHAI, "utf8");
let ma = 0;
const hong = [];

function buoc(ten, viet) {
	viet();
	const d = dungLai();
	const cfg = docConfig();
	const soDong = cfg?.crons?.length;
	console.log(
		`  ${ten}: ma ${d.ma} · config ${existsSync(DUONG_CONFIG) ? `co (${soDong} dong)` : "khong co"} · doc ${DUONG_CONFIG}`,
	);
	return { ma: d.ma, chu: d.chu, cfg };
}

try {
	const duong = buoc("1 doi chung duong", () =>
		writeFileSync(DUONG_KHAI, banGoc),
	);
	if (duong.ma !== 0 || duong.cfg?.crons?.length !== 5) {
		console.error(
			`MA 2: doi chung duong hong — ban khai du ma luot dung tra ${duong.ma}, config ${duong.cfg?.crons?.length} dong`,
		);
		ma = 2;
		throw new Error("doi chung duong hong");
	}

	const vang = buoc("2 vang han file", () => {
		renameSync(DUONG_KHAI, `${DUONG_KHAI}.cat`);
	});
	renameSync(`${DUONG_KHAI}.cat`, DUONG_KHAI);
	if (vang.ma === 0) hong.push("2 vang han file: luot dung van ma 0");
	else if (!vang.chu.includes("vercel.json"))
		hong.push("2 vang han file: thong diep khong neu ten file");
	if (vang.cfg !== undefined && (vang.cfg.crons ?? []).length === 0)
		hong.push("2 vang han file: van ghi config.json voi crons rong");

	const khongKhoa = buoc("3 khong co khoa crons", () =>
		writeFileSync(
			DUONG_KHAI,
			`${JSON.stringify({ $schema: "x" }, null, "\t")}\n`,
		),
	);
	if (khongKhoa.ma === 0)
		hong.push("3 khong co khoa crons: luot dung van ma 0");
	else if (!khongKhoa.chu.includes("vercel.json"))
		hong.push("3 khong co khoa crons: thong diep khong neu ten file");

	const rong = buoc("4 mang crons RONG", () =>
		writeFileSync(DUONG_KHAI, `${JSON.stringify({ crons: [] }, null, "\t")}\n`),
	);
	if (rong.ma === 0) hong.push("4 mang crons RONG: luot dung van ma 0");
	else if (!rong.chu.includes("vercel.json"))
		hong.push("4 mang crons RONG: thong diep khong neu ten file");

	if (hong.length > 0) {
		console.error("DO: mot lich chay nen bien mat lang le:");
		for (const h of hong) console.error(`  ${h}`);
		ma = 1;
	} else {
		console.log(
			"XANH: ca ba hinh dang hong deu lam luot dung DUNG lai va neu ten file; doi chung duong ma 0 voi du 5 dong.",
		);
	}
} finally {
	rmSync(`${DUONG_KHAI}.cat`, { force: true });
	writeFileSync(DUONG_KHAI, banGoc);
	if (readFileSync(DUONG_KHAI, "utf8") !== banGoc) {
		console.error("MA 2: khoi phuc ban khai THAT BAI — chan da de lai rac");
		ma = 2;
	}
}

process.exit(ma);
