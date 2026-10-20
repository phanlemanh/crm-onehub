import { execFileSync } from "node:child_process";
import { mkdtempSync, realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
	bat,
	docBan,
	dungBan,
	GOC,
	git,
	inBan,
	Ket,
	khongDoDuoc,
	kiemBan,
	moiTruongSach,
	moTaNguon,
	shaHead,
	shaMergeBase,
} from "./nen.mjs";

const NGUON = process.argv.includes("--nguon");
const ket = new Ket();
const sha = { head: shaHead(), mb: shaMergeBase() };
const goc = moTaNguon(GOC);

function doBan(nhan, s, nguon, ky, { nen }) {
	const b = dungBan(s, `f26-${nhan}`, nguon, { nen });
	try {
		const d = docBan(b.goc);
		inBan(nhan, d);
		return kiemBan(d, { ...ky, sha: s });
	} finally {
		b.don();
	}
}

function nguonTach() {
	const thu = mkdtempSync(join(realpathSync(tmpdir()), "f26-nguon-tach-"));
	rmSync(thu, { recursive: true, force: true });
	git(GOC, "worktree", "add", "--detach", "--no-checkout", "-q", thu, sha.head);
	return {
		goc: thu,
		nhanh: "HEAD",
		don: () => {
			git(GOC, "worktree", "remove", "--force", thu);
		},
	};
}

function nguonOnehub() {
	const tam = mkdtempSync(join(realpathSync(tmpdir()), "f26-nguon-onehub-"));
	const thu = join(tam, "kho");
	execFileSync("git", ["clone", "-q", "--no-checkout", GOC, thu], {
		env: moiTruongSach(),
		stdio: ["ignore", "pipe", "pipe"],
	});
	git(thu, "remote", "set-url", "origin", goc.url);
	git(thu, "update-ref", "refs/heads/onehub", sha.head);
	git(thu, "symbolic-ref", "HEAD", "refs/heads/onehub");
	return {
		goc: thu,
		nhanh: "onehub",
		don: () => rmSync(tam, { recursive: true, force: true }),
	};
}

if (!NGUON) {
	if (goc.nhanh === "HEAD" || goc.nhanh === "onehub")
		khongDoDuoc(`nguon khong dung tren nhanh tinh nang (${goc.nhanh})`);
	console.log(
		`nguon goc: origin=${goc.url} repo=${goc.repo} nhanh=${goc.nhanh}`,
	);
	for (const [nhan, s] of Object.entries(sha)) {
		const sai = doBan(nhan, s, GOC, goc, { nen: true });
		ket.kiem(sai.length === 0, `ban ${nhan}`, `lech ${sai.join(",")}`);
		const saiTran = doBan(`tran-${nhan}`, s, GOC, goc, { nen: false });
		bat(
			ket,
			`ban-tran-${nhan}`,
			saiTran.includes("repo") && saiTran.includes("nhanh"),
			`lech ${saiTran.join(",")}`,
		);
	}
} else {
	const nguon = { tach: nguonTach(), onehub: nguonOnehub() };
	try {
		let dat = 0;
		for (const [tenNguon, n] of Object.entries(nguon)) {
			const ky = { url: goc.url, repo: goc.repo, nhanh: n.nhanh };
			for (const [nhan, s] of Object.entries(sha)) {
				const sai = doBan(`${tenNguon}-${nhan}`, s, n.goc, ky, { nen: true });
				if (
					ket.kiem(
						sai.length === 0,
						`ban ${tenNguon}-${nhan}`,
						`lech ${sai.join(",")}`,
					)
				)
					dat += 1;
			}
		}
		ket.kiem(dat === 4, `ma tran 4 o: dat ${dat}/4`, `chi dat ${dat}/4`);
		const lechTach = doBan(
			"lech-tach",
			sha.mb,
			GOC,
			{ url: goc.url, repo: goc.repo, nhanh: "HEAD" },
			{ nen: true },
		);
		bat(
			ket,
			"nguon-lech-tach",
			lechTach.includes("nhanh"),
			`lech ${lechTach.join(",")}`,
		);
		const lechOnehub = doBan(
			"lech-onehub",
			sha.mb,
			nguon.tach.goc,
			{ url: goc.url, repo: goc.repo, nhanh: "onehub" },
			{ nen: true },
		);
		bat(
			ket,
			"nguon-lech-onehub",
			lechOnehub.includes("nhanh"),
			`lech ${lechOnehub.join(",")}`,
		);
	} finally {
		nguon.tach.don();
		nguon.onehub.don();
	}
}
ket.ket();
