import { join } from "node:path";
import { CAU_HINH } from "./cau-hinh.mjs";
import {
	banSao,
	chayBun,
	doanTruocDongHong,
	docJunit,
	nguonHienTai,
	nguonNeo,
	thuMucRa,
	xoaBanSao,
} from "./chay.mjs";

function cheTre(nguon) {
	const so = nguon.split(CAU_HINH.mocTre).length - 1;
	if (so !== 1) return null;
	return nguon.replace(
		CAU_HINH.mocTre,
		`{ const q = new URLSearchParams(e.searchParams); const tre = (k: number): void => { if (k === 0) { url = q; return; } setTimeout(() => tre(k - 1), 0); }; tre(${CAU_HINH.treNhip}); }`,
	);
}

function luot(nhan, nguon, ra, banSaoDaTao) {
	const tuongDoi = banSao(`tcu-tre-${nhan}`, nguon);
	banSaoDaTao.push(tuongDoi);
	const junit = join(ra, `${nhan}.xml`);
	const r = chayBun(tuongDoi, [
		"--reporter=junit",
		`--reporter-outfile=${junit}`,
	]);
	return { ...r, ca: docJunit(junit) };
}

function chay() {
	const banSaoDaTao = [];
	try {
		let moi;
		let cu;
		try {
			moi = cheTre(nguonHienTai());
			cu = cheTre(nguonNeo());
		} catch (e) {
			console.log(`khong doc duoc tep hoac ban neo: ${e.message}`);
			return 2;
		}
		if (moi === null || cu === null) {
			console.log(`moc che tre khong thay dung mot lan: ${CAU_HINH.mocTre}`);
			return 2;
		}
		const ra = thuMucRa("E3");
		console.log(
			`URL tre ${CAU_HINH.treNhip} nhip setTimeout(0) sau moi lan nuqs ghi; tao pham o ${ra}`,
		);
		const lMoi = luot("moi", moi, ra, banSaoDaTao);
		const lCu = luot("cu", cu, ra, banSaoDaTao);
		if (!lMoi.ca?.length || !lCu.ca?.length) {
			console.log(
				`khong doc duoc junit (moi ${lMoi.ca?.length ?? "vang"}, cu ${lCu.ca?.length ?? "vang"}); ${lMoi.loi ?? lCu.loi ?? ""}`,
			);
			return 2;
		}
		const hongCu = lCu.ca
			.filter((c) => c.hong)
			.map((c) => c.ten)
			.sort();
		const neo = [...CAU_HINH.caDocUrl].sort();
		console.log(
			`doi chung (ban neo ${CAU_HINH.neo.slice(0, 8)}): ${hongCu.length}/${lCu.ca.length} ca do`,
		);
		for (const t of hongCu) console.log(`  do: ${t}`);
		if (hongCu.join("\n") !== neo.join("\n")) {
			console.log(
				"doi chung khong do dung ba ca doc url — thuoc khong phan biet duoc, khong ket luan",
			);
			return 2;
		}
		for (const ten of CAU_HINH.caDocUrl) {
			const nhan = doanTruocDongHong(lCu.ra, ten)
				.flatMap((d) => d.split("\n"))
				.filter((d) => d.startsWith("+ ") && d.includes("don"));
			const la = nhan.filter((d) => !CAU_HINH.giaTriCu[ten].includes(d));
			console.log(
				`  ${ten}: nhan ${nhan.length} gia tri ?don cu${la.length ? `, ${la.length} khong co trong ma tran` : ""}`,
			);
			for (const d of nhan)
				console.log(
					`    ${CAU_HINH.giaTriCu[ten].includes(d) ? "ghim" : "LA"} ${d.replace(/^\+\s*/, "")}`,
				);
			if (nhan.length === 0 || la.length > 0) {
				console.log(
					`  khong ghim duoc loi cua ca la ?don truoc cu bam: ${ten}`,
				);
				return 2;
			}
		}
		const hongMoi = lMoi.ca.filter((c) => c.hong).map((c) => c.ten);
		console.log(
			`ban hien tai: ${lMoi.ca.length - hongMoi.length}/${lMoi.ca.length} ca xanh`,
		);
		for (const t of hongMoi) console.log(`  do: ${t}`);
		if (hongMoi.length > 0) return 1;
		console.log(
			"XANH: URL tre van xanh o ban hien tai, do dung ba ca o ban neo",
		);
		return 0;
	} finally {
		const sot = xoaBanSao(banSaoDaTao);
		if (sot.length > 0) {
			console.log(`ban sao con sot: ${sot.join(", ")}`);
			process.exitCode = 2;
		}
	}
}

const ma = chay();
process.exit(process.exitCode === 2 ? 2 : ma);
