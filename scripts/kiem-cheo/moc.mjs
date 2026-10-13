import {
	existsSync,
	mkdirSync,
	readFileSync,
	renameSync,
	writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { KIEM_CHEO } from "./cau-hinh.mjs";

export function duongMoc(goc) {
	return join(goc, KIEM_CHEO.thuMuc, KIEM_CHEO.tep.moc);
}

export function lanGop(git, tu, den) {
	const ra = git(
		"rev-list",
		"--first-parent",
		"--merges",
		"--reverse",
		`${tu}..${den}`,
	);
	return ra ? ra.split("\n").filter(Boolean) : [];
}

export function tepDoi(git, tu, den) {
	const ra = git("diff", "--name-only", `${tu}..${den}`);
	return ra ? ra.split("\n").filter(Boolean) : [];
}

function trenFirstParent(git, sha, ref) {
	const ds = git("rev-list", "--first-parent", ref);
	return ds.split("\n").includes(sha);
}

export function docMoc({ goc, git, ref }) {
	const tep = duongMoc(goc);
	if (!existsSync(tep))
		return {
			loi: `moc vang: khong co ${KIEM_CHEO.thuMuc}/${KIEM_CHEO.tep.moc}`,
		};
	let moc;
	try {
		moc = JSON.parse(readFileSync(tep, "utf8"));
	} catch {
		return { loi: `moc hong: ${KIEM_CHEO.tep.moc} khong phai JSON` };
	}
	if (typeof moc?.sha !== "string" || typeof moc?.luc !== "string") {
		return { loi: `moc hong: thieu sha hoac luc` };
	}
	if (!trenFirstParent(git, moc.sha, ref)) {
		return {
			loi: `moc ${moc.sha.slice(0, 9)} khong con tren first-parent cua ${ref}`,
		};
	}
	return { sha: moc.sha, luc: moc.luc };
}

export function ghiMoc(goc, moc) {
	const tep = duongMoc(goc);
	mkdirSync(join(goc, KIEM_CHEO.thuMuc), { recursive: true });
	const tam = `${tep}.tam-${process.pid}`;
	writeFileSync(tam, `${JSON.stringify(moc)}\n`);
	renameSync(tam, tep);
}
