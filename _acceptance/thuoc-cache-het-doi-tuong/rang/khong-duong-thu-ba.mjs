import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { GOC, docCauHinhCong, docTask, epChayLai, taskCuaLenh } from "./cau-hinh-turbo.mjs";

export function bang(cong, task) {
	const ra = [];
	for (const o of cong.oCam) {
		if (o.lenh === null) {
			ra.push({ o: o.khoa, goi: "-", task: "-", dem: null, ep: null, thoa: false, ly_do: "o cam khong ton tai" });
			continue;
		}
		const ten = taskCuaLenh(o.lenh, cong.script);
		const ep = epChayLai(o.lenh, cong.script);
		if (ten.length === 0) {
			ra.push({ o: o.khoa, goi: "-", task: "(khong qua turbo)", dem: false, ep, thoa: true });
			continue;
		}
		for (const t of ten)
			for (const c of task.filter((x) => x.task === t))
				ra.push({ o: o.khoa, goi: c.goi, task: t, dem: c.dem, ep, thoa: c.dem === false || ep });
	}
	return ra;
}

if (process.argv[1]?.endsWith("khong-duong-thu-ba.mjs")) {
	const cong = docCauHinhCong();
	const d = docTask();
	if (cong.oCam.length === 0 || d === null) {
		console.error("KHONG DO DUOC: khong o cam nao trong suite_keys, hoac khong doc duoc cau hinh turbo.");
		process.exit(2);
	}
	const b = bang(cong, d.task);
	console.log(`o cam: ${cong.oCam.length} · goi: ${d.so_goi} · dong bang: ${b.length}`);
	for (const r of b)
		console.log(`  ${r.thoa ? "thoa " : "HONG "} ${r.o} · ${r.goi}#${r.task} · dem=${r.dem} · ep=${r.ep}`);
	if (b.length === 0) {
		console.error("KHONG DO DUOC: bang rong — dan so hep thi bat bien khong noi gi.");
		process.exit(2);
	}
	const hong = b.filter((r) => !r.thoa);
	if (hong.length > 0) {
		for (const r of hong)
			console.error(
				`DO: ${r.goi}#${r.task} chay boi o cam ${r.o} — con dem (${r.dem}) VA khong bi ep --force. Duong thu ba khong duoc phep: mot mau xanh o day co the la ban phat lai.`,
			);
		process.exit(1);
	}
	console.log(`chieu xanh: ca ${b.length} dong deu HOAC tat dem HOAC bi ep chay lai.`);

	const pTurbo = join(GOC, "turbo.json");
	const pCfg = join(GOC, "_acceptance", "config.yaml");
	const gocTurbo = readFileSync(pTurbo, "utf8");
	const gocCfg = readFileSync(pCfg, "utf8");
	let ma = 0;
	try {
		writeFileSync(pTurbo, gocTurbo.replace(/\n\s*"cache": false,?/, ""));
		writeFileSync(
			pCfg,
			gocCfg.replace(
				/^    api: .+$/m,
				'    api: "bunx turbo run test"',
			),
		);
		const bDo = bang(docCauHinhCong(), docTask().task);
		const batDuoc = bDo.filter((r) => !r.thoa);
		if (batDuoc.length === 0) {
			console.error(
				"DO: cay bat lai dem cho task test VA bo --force khoi o cam test ma chan VAN XANH — bat bien nay khong bao gio do duoc.",
			);
			ma = 1;
		} else {
			console.log(
				`chieu do: bat lai dem cho test + bo --force -> chan bat ${batDuoc.length} dong, vd ${batDuoc[0].goi}#${batDuoc[0].task}`,
			);
		}
	} finally {
		writeFileSync(pTurbo, gocTurbo);
		writeFileSync(pCfg, gocCfg);
	}
	if (ma !== 0) process.exit(ma);
	console.log("XANH: cap hai chieu tren cung mot vat — khong duong thu ba.");
}
