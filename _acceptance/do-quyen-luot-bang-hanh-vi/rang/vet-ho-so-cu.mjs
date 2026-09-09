import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
	chay,
	chayRang,
	coCo,
	GOC,
	hong,
	RANG,
	voiCaySao,
} from "./chung.mjs";

const GHIM = "chu cua ho so cu da doi";
const TOI = join(RANG, "vet-ho-so-cu.mjs");
const HO_SO = "_acceptance/quyen-luot-mang-theo";
const DUONG_HD = `${HO_SO}/contract.md`;
const DUONG_EV = `${HO_SO}/evals.yaml`;
const SLUG = "do-quyen-luot-bang-hanh-vi";

const SHA_AC5 =
	"e79417b73240adc974964cf24c5de665b2299c12c33244b1b18b5c26d6fdbad4";
const SHA_E5 =
	"eb26d9c7f14f34c148ab5bbbbed0875fd731bdf9134705fca1aa9d743922673c";

const bam = (chu) => createHash("sha256").update(chu).digest("hex");

function khoi(nguon, dau, cuoi, ten) {
	const a = nguon.indexOf(dau);
	const b = nguon.indexOf(cuoi);
	if (a === -1 || b === -1 || b <= a) {
		hong(`${GHIM}\n  khong cat duoc khoi ${ten}: khong tim thay moc "${dau}" hoac "${cuoi}"`);
	}
	return nguon.slice(a, b);
}

function cham(goc) {
	const hd = readFileSync(join(goc, DUONG_HD), "utf8");
	const ev = readFileSync(join(goc, DUONG_EV), "utf8");

	const khoiAc5 = khoi(hd, "**AC-5 —", "**AC-7 —", "AC-5");
	const khoiE5 = khoi(ev, "  - id: E5", "  - id: E7", "E5");
	const bamAc5 = bam(khoiAc5);
	const bamE5 = bam(khoiE5);

	process.stdout.write(
		[
			"vung DONG BANG (giu tung ky tu, kiem bang sha256):",
			`  ${DUONG_HD} :: khoi AC-5   ${bamAc5}`,
			`  ${DUONG_EV} :: khoi eval E5 ${bamE5}`,
			"vung DUOC DONG:",
			`  ${DUONG_HD} :: ## Notes`,
			"",
		].join("\n"),
	);

	const lech = [];
	if (bamAc5 !== SHA_AC5) {
		lech.push(`  khoi AC-5: dang ${bamAc5}\n           da ghim ${SHA_AC5}`);
	}
	if (bamE5 !== SHA_E5) {
		lech.push(`  khoi eval E5: dang ${bamE5}\n              da ghim ${SHA_E5}`);
	}
	if (lech.length > 0) hong(`${GHIM}\n${lech.join("\n")}`);

	const notes = hd.slice(hd.indexOf("## Notes"));
	const dong = notes
		.split("\n")
		.reduce((gom, l) => {
			if (/^- \*\*/.test(l)) gom.push(l);
			else if (gom.length > 0 && l.trim() !== "" && /^\s/.test(l))
				gom[gom.length - 1] += ` ${l.trim()}`;
			else if (l.trim() === "") gom.push("");
			return gom;
		}, [])
		.find((l) => l.includes(SLUG));
	if (!dong) {
		hong(
			`${GHIM}\n  ## Notes cua ho so cu khong co dong nao neu ten slug ${SLUG}`,
		);
	}
	if (!/expected/.test(dong) || !/khong\s+còn mô tả|không\s+còn mô tả/.test(dong)) {
		hong(
			`${GHIM}\n  dong Notes neu slug nhung khong noi ro rang expected da ghim cua E5 khong con mo ta thu lenh cua no chay:\n  ${dong}`,
		);
	}

	process.stdout.write("vet-ho-so-cu: hai vung khong de nhau — sach\n");
}

const VECTO = {
	"sua-mot-ky-tu": (sao) => {
		const duong = join(sao, DUONG_HD);
		const nguon = readFileSync(duong, "utf8");
		const moc = "**AC-5 — Không chỗ nào còn suy quyền từ hình dạng tin nhắn.**";
		if (!nguon.includes(moc)) hong(`khong tim thay moc de dot bien trong ${duong}`);
		writeFileSync(
			duong,
			nguon.replace(
				moc,
				"**AC-5 — Không chỗ nào còn suy quyền từ hình dạng tin nhắn!**",
			),
		);
	},
};

chayRang(() => {
	const ten = coCo("--vecto");
	if (!ten) {
		cham(coCo("--goc") ?? GOC);
		return;
	}
	const dotBien = VECTO[ten];
	if (!dotBien) hong(`khong co vecto ten "${ten}" — co: ${Object.keys(VECTO).join(", ")}`);

	const ma = voiCaySao(({ sao }) => {
		const truoc = chay(GOC, ["node", TOI, "--goc", sao]);
		if (truoc.ma !== 0) {
			hong(`doi chung duong hong: cay sao chua dot bien da do\n${truoc.chu}`);
		}
		dotBien(sao);
		const sau = chay(GOC, ["node", TOI, "--goc", sao]);
		process.stdout.write(`cay sao: ${sao}\nvecto: ${ten}\n${sau.chu}`);
		if (sau.ma === 0) {
			hong(`vecto "${ten}" ra XANH — thuoc khong bat duoc mot ky tu doi`);
		}
		if (!sau.chu.includes(GHIM)) {
			hong(`vecto "${ten}" do nhung thieu thong diep ghim: ${GHIM}`);
		}
		if (!/da ghim [0-9a-f]{64}/.test(sau.chu)) {
			hong(`vecto "${ten}" do nhung khong in ca hai sha`);
		}
		return sau.ma;
	});
	process.exitCode = ma;
});
