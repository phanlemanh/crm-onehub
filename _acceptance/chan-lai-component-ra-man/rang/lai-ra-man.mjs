import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { duongLuot, xoaTaoPhamCu } from "./luot-chay.mjs";
import { GOC as THU_MUC_GOC, docFile, docMacDinh } from "./moi-mac-dinh.mjs";

const GOC = join(import.meta.dirname, "..", "..", "..");

const NEO = { mac_dinh: 129, dong_bang_cu: 9 };

function banVeRong(banVe) {
	return Object.values(banVe)
		.flat()
		.every((b) => b.loi_dong !== null && b.loi_mo !== null);
}

function docGit(goc) {
	let dinh;
	try {
		dinh = execFileSync("git", ["-C", goc, "rev-parse", "--show-toplevel"], {
			encoding: "utf8",
			stdio: ["ignore", "pipe", "pipe"],
		}).trim();
	} catch (loi) {
		return { loi: `khong doc duoc git o ${goc}: ${String(loi?.stderr ?? loi).trim().split("\n")[0]}` };
	}
	if (realpathSync(dinh) !== realpathSync(goc))
		return { loi: `goc git ${dinh} khac goc dang do ${goc}` };
	const ra = execFileSync("git", ["-C", goc, "ls-files", "-z", "--", ...THU_MUC_GOC], {
		encoding: "utf8",
	});
	return {
		tep: ra
			.split("\0")
			.filter((f) => /\.tsx?$/.test(f) && existsSync(join(goc, f))),
	};
}

function ghi(ten, gt) {
	writeFileSync(duongLuot(ten), `${JSON.stringify(gt, null, "\t")}\n`);
}

export function danSo() {
	const file = docFile(GOC);
	const macDinh = docMacDinh(GOC);
	ghi("mac-dinh.json", macDinh);
	const bangCu = JSON.parse(
		readFileSync(
			join(
				GOC,
				"_acceptance/chu-mac-dinh-thu-vien-ngoai/rang/gioi-han-bam-moi-hien.json",
			),
			"utf8",
		),
	);
	const doDuoc = {
		file: file.length,
		mac_dinh: macDinh.length,
		dong_bang_cu: bangCu.dong.length,
	};
	console.log(
		`tap loai tru ghim ten: node_modules · .next · dist · build — ${doDuoc.file} file nguon`,
	);
	console.log(
		`gia tri mac dinh la chuoi co chu: ${doDuoc.mac_dinh} · component so huu: ${new Set(macDinh.map((m) => m.file)).size}`,
	);
	console.log(`dong trong bang gioi han vong truoc: ${doDuoc.dong_bang_cu}`);
	if (doDuoc.file === 0 || doDuoc.mac_dinh === 0) {
		console.error("KHONG DO DUOC: tap nguon rong");
		return 2;
	}
	const phiaGit = docGit(GOC);
	if (phiaGit.loi) {
		console.error(`KHONG DO DUOC: ${phiaGit.loi}`);
		return 2;
	}
	if (phiaGit.tep.length === 0) {
		console.error(
			`KHONG DO DUOC: phia git rong trong khi bo duyet thay ${doDuoc.file} tep — khong doi chieu duoc`,
		);
		return 2;
	}
	console.log(`tep git theo doi duoi goc: ${phiaGit.tep.length}`);
	let ma = 0;
	const thay = new Set(file);
	const sot = phiaGit.tep.filter((f) => !thay.has(f));
	if (sot.length > 0) {
		console.error(
			`BO-SOT: ${sot.length} tep git theo doi ma bo duyet khong thay: ${sot.slice(0, 5).join(", ")}`,
		);
		ma = 1;
	}
	const lech = Object.entries(NEO).filter(([k, v]) => doDuoc[k] !== v);
	for (const [k, v] of lech)
		console.error(`DO: neo ${k} ghim ${v} nhung do duoc ${doDuoc[k]}`);
	if (lech.length > 0) ma = 1;
	if (ma === 0) console.log("XANH: moi neo khop dia, bo duyet thay du tep git theo doi.");
	return ma;
}

function chayBanVe() {
	try {
		execFileSync("bun", ["test", "--preload", "./test/setup-dom.ts", "test/lai-ra-man.spec.tsx"], {
			cwd: join(GOC, "packages/ui"),
			stdio: "pipe",
		});
	} catch (e) {
		const ra = `${e.stdout ?? ""}${e.stderr ?? ""}`;
		console.error(`bo ve khong chay tron:\n${ra.slice(-1200)}`);
	}
}

export function phanNhom() {
	ghi("mac-dinh.json", docMacDinh(GOC));
	xoaTaoPhamCu("ve-that.json");
	chayBanVe();
	const duong = duongLuot("ve-that.json");
	if (!existsSync(duong)) {
		console.error(
			"KHONG DO DUOC: khong co tao pham ve-that.json — bo ve chua chay duoc, khong ket luan gi ve phan nhom.",
		);
		return 2;
	}
	const banVe = JSON.parse(readFileSync(duong, "utf8"));
	const macDinh = docMacDinh(GOC);

	const nguoiDoc = [];
	const kyThuat = [];
	const khongVeDuoc = [];
	for (const m of macDinh) {
		const ban = banVe[m.file] ?? [];
		if (ban.length === 0 || ban.every((b) => b.loi_dong !== null && b.loi_mo !== null)) {
			khongVeDuoc.push({ ...m, ly_do: ban[0]?.loi_dong ?? "khong co xuat nao ve duoc" });
			continue;
		}
		const chu = new Set();
		for (const b of ban) {
			for (const c of b.dong) chu.add(c);
			for (const c of b.mo) chu.add(c);
		}
		if (chu.has(m.gia_tri)) nguoiDoc.push(m);
		else kyThuat.push(m);
	}
	ghi("phan-nhom.json", { nguoi_doc: nguoiDoc, ky_thuat: kyThuat, khong_ve_duoc: khongVeDuoc });

	console.log(`nhom chu-nguoi-doc: ${nguoiDoc.length}`);
	console.log(`nhom ky thuat: ${kyThuat.length}`);
	console.log(`khong ve duoc (da khai kem ly do): ${khongVeDuoc.length}`);
	const tong = nguoiDoc.length + kyThuat.length + khongVeDuoc.length;
	console.log(`tong: ${tong} · neo: ${NEO.mac_dinh}`);
	if (tong !== NEO.mac_dinh) {
		console.error(`DO: tong ba nhom ${tong} khac neo ${NEO.mac_dinh}`);
		return 1;
	}

	if (banVeRong(banVe)) {
		console.error(
			"KHONG DO DUOC: khong component nao ve duoc — tap quan sat rong thi khong ket luan gi.",
		);
		return 2;
	}
	console.log("XANH: phan nhom do BAN VE quyet, khong danh sach ten prop nao.");
	for (const m of nguoiDoc)
		console.log(`  ${m.file}:${m.dong}  ${m.tham_so} = ${JSON.stringify(m.gia_tri)}`);
	return 0;
}

if (process.argv[1]?.endsWith("lai-ra-man.mjs")) {
	const dong_tu = process.argv[2];
	const bang = { "dan-so": danSo, "phan-nhom": phanNhom };
	if (!bang[dong_tu]) {
		console.error(`dong tu khong biet: ${dong_tu} — nhan dan-so | phan-nhom`);
		process.exit(2);
	}
	process.exit(bang[dong_tu]());
}
