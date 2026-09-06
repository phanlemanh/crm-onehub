import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { isAbsolute, join } from "node:path";
import { GOC } from "./lat.mjs";
import { giuViet } from "./khoa-cay.mjs";

export function sach() {
	return execFileSync("git", ["status", "--porcelain"], {
		cwd: GOC,
		encoding: "utf8",
	});
}

export function chay(HERE, chan) {
	const dau = isAbsolute(chan.lenh[0])
		? chan.lenh[0]
		: join(HERE, chan.lenh[0]);
	try {
		execFileSync("node", [dau, ...chan.lenh.slice(1)], {
			cwd: GOC,
			encoding: "utf8",
			stdio: ["ignore", "pipe", "pipe"],
		});
		return 0;
	} catch (e) {
		return e.status ?? 1;
	}
}

export function chayHet(HERE, bo) {
	return bo.map((c) => ({ chan: c.ten, ma: chay(HERE, c) }));
}

export async function chayDotBien({ HERE, CHAN, VET }) {
	await giuViet();
	const gocTruoc = sach();
	const nen = chayHet(HERE, CHAN);
	const chuaXanh = nen.filter((x) => x.ma !== 0 && x.ma !== 2);

	if (chuaXanh.length > 0) {
		console.log(
			`KHONG DO DUOC: chua pha gi ma ${chuaXanh.length} chan da khong xanh: ${chuaXanh
				.map((x) => `${x.chan}(${x.ma})`)
				.join(" · ")}. Chieu xanh gay thi chieu do khong noi len dieu gi.`,
		);
		process.exit(2);
	}

	const nenMa = new Map(nen.map((x) => [x.chan, x.ma]));
	for (const x of nen)
		if (x.ma === 2)
			console.log(
				`nen: ${x.chan} = ma 2 — tien de thieu tren cay lanh, do chinh chan do noi ra; voi chan nay chi ma 1 moi tinh la bat duoc.`,
			);

	const soXanh = nen.filter((x) => x.ma === 0).length;
	if (soXanh === CHAN.length)
		console.log(`chieu xanh: ca ${CHAN.length} chan xanh tren cay lanh.`);
	else
		console.log(
			`chieu xanh: ${soXanh}/${CHAN.length} chan xanh tren cay lanh; ${CHAN.length - soXanh} chan tu khai tien de thieu (ma 2).`,
		);

	const mu = [];
	const chuaDo = [];
	const khongCam = [];

	for (const v of VET) {
		const duong = join(GOC, v.file);
		const truoc = readFileSync(duong, "utf8");
		const sau = v.cam(truoc);

		if (sau === truoc) {
			khongCam.push(`${v.ten} (${v.file})`);
			continue;
		}

		const bo =
			v.chan === undefined ? CHAN : CHAN.filter((c) => v.chan.includes(c.ten));

		let ket;
		try {
			writeFileSync(duong, sau);
			if (v.cho_ms !== undefined) {
				console.log(
					`   (cho ${v.cho_ms}ms cho may chu nap lai truoc khi do — vet nay nam trong ma may chu chay)`,
				);
				execFileSync("sleep", [String(v.cho_ms / 1000)]);
			}
			ket = chayHet(HERE, bo);
		} finally {
			writeFileSync(duong, truoc);
		}

		const doDuoc = ket
			.filter((x) => x.ma === 1 && nenMa.get(x.chan) !== 1)
			.map((x) => x.chan);
		const khongDo = ket.filter((x) => x.ma === 2).map((x) => x.chan);
		if (khongDo.length > 0)
			console.log(
				`   (ma 2, KHONG tinh la bat duoc — tien de thieu: ${khongDo.join(", ")})`,
			);
		if (doDuoc.length === 0 && khongDo.length > 0) {
			chuaDo.push(`${v.ten} (${khongDo.join(", ")})`);
			console.log(
				`KHONG DO DUOC: cam "${v.ten}" vao ${v.file} ma moi chan deu tra ma 2 — tien de thieu, KHONG duoc ket luan la thuoc mu.`,
			);
		} else if (doDuoc.length === 0) {
			mu.push(v.ten);
			console.log(
				`THUOC MU: cam "${v.ten}" vao ${v.file} ma KHONG chan nao do.`,
			);
		} else {
			console.log(`vet "${v.ten}" -> do boi: ${doDuoc.join(", ")}`);
		}
	}

	const gocSau = sach();
	if (gocSau !== gocTruoc) {
		console.log(
			"KHONG DO DUOC: cay lam viec khac truoc khi chay — vet chua duoc tra nguyen trang",
		);
		process.exit(2);
	}
	console.log("cay lam viec da tro ve dung trang thai truoc khi chay.");

	if (khongCam.length > 0) {
		console.log(
			`\nKHONG DO DUOC: ${khongCam.length} vet khong cam duoc vao ma — vet da lac hau: ${khongCam.join(" · ")}`,
		);
		process.exit(2);
	}

	if (chuaDo.length > 0) {
		console.log(
			`\nKHONG DO DUOC: ${chuaDo.length}/${VET.length} vet khong chan nao do duoc (tien de thieu): ${chuaDo.join(" · ")}`,
		);
		process.exit(2);
	}

	if (mu.length > 0) {
		console.log(
			`\nDO: ${mu.length}/${VET.length} vet khong bi chan nao bat: ${mu.join(" · ")}`,
		);
		process.exit(1);
	}

	if (soXanh === CHAN.length)
		console.log(
			`\nXANH: ca ${VET.length} vet deu bi it nhat mot chan bat, va cay lanh thi ca ${CHAN.length} chan deu xanh.`,
		);
	else
		console.log(
			`\nXANH: ca ${VET.length} vet deu bi it nhat mot chan bat, va ${soXanh}/${CHAN.length} chan xanh tren cay lanh.`,
		);
}
