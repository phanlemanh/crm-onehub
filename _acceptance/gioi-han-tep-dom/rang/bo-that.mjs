import { spawnSync } from "node:child_process";
import { mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const HO_SO = "gioi-han-tep-dom";
const RA = join(GOC, ".acceptance-runs", HO_SO);
const BO_DEM_RA = 256 * 1024 * 1024;
const GOI = [
	{ thuMuc: "apps/app", lenh: ["run", "test:dom"] },
	{ thuMuc: "packages/ui", lenh: ["run", "test"] },
];

function docCauHinh() {
	const kq = spawnSync(
		"bun",
		[
			"-e",
			'import { CHAY_DOM } from "./packages/ui/test/chay-dom-config.ts"; console.log(JSON.stringify(CHAY_DOM));',
		],
		{ cwd: GOC, encoding: "utf8" },
	);
	if (kq.status !== 0) {
		console.error(`E4 đỏ: không đọc được module cấu hình\n${kq.stderr}`);
		process.exit(2);
	}
	return JSON.parse(kq.stdout);
}

function giay(ms, cauHinh) {
	return (ms / cauHinh.hienThi.msMoiGiay).toFixed(cauHinh.hienThi.soLe);
}

function doGoi({ thuMuc, lenh }, cauHinh) {
	const loi = [];
	const tep = readdirSync(join(GOC, thuMuc, cauHinh.tep.thuMuc), {
		recursive: true,
	})
		.map(String)
		.filter((ten) => ten.endsWith(cauHinh.tep.duoi))
		.sort();
	const kq = spawnSync("bun", lenh, {
		cwd: join(GOC, thuMuc),
		encoding: "utf8",
		maxBuffer: BO_DEM_RA,
	});
	const out = kq.stdout ?? "";
	writeFileSync(join(RA, `${thuMuc.replace("/", "-")}.stdout.txt`), out);
	writeFileSync(
		join(RA, `${thuMuc.replace("/", "-")}.stderr.txt`),
		kq.stderr ?? "",
	);

	if (kq.status !== 0) loi.push(`thoát mã ${kq.status}`);

	const xanh = [
		...out.matchAll(/^chay-dom: test\/(.+) xanh sau (\d+\.\d) s$/gm),
	].map((m) => ({ ten: m[1], giay: Number(m[2]) }));
	const tenXanh = xanh.map((d) => d.ten).sort();
	if (xanh.length !== tep.length) {
		loi.push(`${xanh.length} dòng thời lượng cho ${tep.length} tệp`);
	}
	if (JSON.stringify(tenXanh) !== JSON.stringify(tep)) {
		const thieu = tep.filter((t) => !tenXanh.includes(t));
		const thua = tenXanh.filter((t) => !tep.includes(t));
		loi.push(`tập tên lệch — thiếu [${thieu}] · thừa [${thua}]`);
	}

	const tong = [
		...out.matchAll(
			/^chay-dom: (\d+) tệp xanh sau \d+\.\d s \(giới hạn mỗi tệp (\d+\.\d) s\)$/gm,
		),
	];
	if (tong.length !== 1) {
		loi.push(`${tong.length} dòng tổng, cần đúng 1`);
	} else {
		const [, soTep, gioiHan] = tong[0];
		if (Number(soTep) !== tep.length) {
			loi.push(`dòng tổng đếm ${soTep} tệp, thư mục có ${tep.length}`);
		}
		const kyVong = giay(cauHinh.tep.tranMs, cauHinh);
		if (gioiHan !== kyVong) {
			loi.push(
				`giới hạn không đọc từ cấu hình — in ${gioiHan} s, cấu hình ${kyVong} s`,
			);
		}
	}

	const dongCham = [...out.matchAll(/^chay-dom: chậm nhất — (.+)$/gm)];
	if (dongCham.length !== 1) {
		loi.push(`${dongCham.length} dòng chậm nhất, cần đúng 1`);
	} else {
		const cham = dongCham[0][1].split(" · ").map((muc) => {
			const m = muc.match(/^test\/(.+) (\d+\.\d) s$/);
			return { ten: m?.[1] ?? muc, giay: Number(m?.[2]) };
		});
		const soMuc = Math.min(cauHinh.tongKet.soTepChamNhat, tep.length);
		if (cham.length !== soMuc) {
			loi.push(
				`số mục chậm nhất lệch cấu hình — ${cham.length} mục, cần ${soMuc}`,
			);
		}
		for (let i = 1; i < cham.length; i++) {
			if (cham[i].giay > cham[i - 1].giay) {
				loi.push(`chậm nhất không giảm dần ở mục ${i + 1}`);
			}
		}
		const theoTen = new Map(xanh.map((d) => [d.ten, d.giay]));
		for (const muc of cham) {
			if (theoTen.get(muc.ten) !== muc.giay) {
				loi.push(`${muc.ten} ${muc.giay} s không khớp dòng thời lượng của nó`);
			}
		}
		const trongDanhSach = new Set(cham.map((d) => d.ten));
		const thapNhatTrong = Math.min(...cham.map((d) => d.giay));
		const vuot = xanh.filter(
			(d) => !trongDanhSach.has(d.ten) && d.giay > thapNhatTrong,
		);
		if (vuot.length > 0) {
			loi.push(
				`tệp chậm hơn bị bỏ khỏi danh sách: ${vuot.map((d) => `${d.ten} ${d.giay} s`)}`,
			);
		}
	}

	return { tep: tep.length, loi };
}

mkdirSync(RA, { recursive: true });
const cauHinh = docCauHinh();
let dat = true;
for (const goi of GOI) {
	const { tep, loi } = doGoi(goi, cauHinh);
	if (loi.length === 0) {
		console.log(`E4 ${goi.thuMuc}: ${tep} tệp, đạt`);
	} else {
		dat = false;
		console.error(`E4 ${goi.thuMuc}: đỏ\n  - ${loi.join("\n  - ")}`);
	}
}
console.log(dat ? "E4 đạt" : "E4 đỏ");
process.exit(dat ? 0 : 1);
