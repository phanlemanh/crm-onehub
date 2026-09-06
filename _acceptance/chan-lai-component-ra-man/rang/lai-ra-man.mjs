import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { docFile, docMacDinh } from "./moi-mac-dinh.mjs";

const GOC = join(import.meta.dirname, "..", "..", "..");
const HO_SO = join(GOC, "_acceptance", "chan-lai-component-ra-man");
const EV = join(HO_SO, "evidence");

const NEO = { file: 398, mac_dinh: 107, dong_bang_cu: 9 };

function banVeRong(banVe) {
	return Object.values(banVe)
		.flat()
		.every((b) => b.loi_dong !== null && b.loi_mo !== null);
}

function ghi(ten, gt) {
	const duong = join(EV, ten);
	mkdirSync(dirname(duong), { recursive: true });
	writeFileSync(duong, `${JSON.stringify(gt, null, "\t")}\n`);
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
	const lech = Object.entries(NEO).filter(([k, v]) => doDuoc[k] !== v);
	if (lech.length > 0) {
		for (const [k, v] of lech)
			console.error(`DO: neo ${k} ghim ${v} nhung do duoc ${doDuoc[k]}`);
		return 1;
	}
	if (doDuoc.file === 0 || doDuoc.mac_dinh === 0) {
		console.error("KHONG DO DUOC: tap nguon rong");
		return 2;
	}
	console.log("XANH: moi neo khop dia.");
	return 0;
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
	chayBanVe();
	const duong = join(EV, "ve-that.json");
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
