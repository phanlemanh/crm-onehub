import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

const TAI_LIEU = {
	tep: {
		context: join(GOC, "CONTEXT.md"),
		api: process.env.TAI_LIEU_API ?? join(GOC, "docs", "api.md"),
		agent: process.env.TAI_LIEU_AGENT ?? join(GOC, "docs", "agent.md"),
		router:
			process.env.TAI_LIEU_ROUTER ??
			join(GOC, "apps", "api", "src", "okr", "okr.router.ts"),
	},
	ref: {
		onehub: process.env.TAI_LIEU_REF_ONEHUB ?? "origin/onehub",
		release: process.env.TAI_LIEU_REF_RELEASE ?? "origin/release",
		cay: process.env.TAI_LIEU_REF_CAY ?? "HEAD",
		gop9b:
			process.env.TAI_LIEU_GOP_9B ?? "2e3280474f472b9853ed9a66bb0f4524ede6ff7d",
	},
	muc: {
		cheDoAn: "**Chế độ ẩn**",
		choRe9b: "## Chỗ rẽ: Trợ lý OKR (lượt 9b)",
		okr: "## OKR",
	},
	thuTuc: /^\t(troLy[A-Za-z]+|xuHuongKr)\(/,
	trangTri: /^\t@(Query|Mutation)\(/,
	thanTrangTri: /^\t\t|^\t\}\)/,
	thongDiep: {
		routerRong: "tai lieu: router khong rut duoc thu tuc nao",
		thieuRef: (ten) => `tai lieu: khong do duoc cho re 9b — thieu ref ${ten}`,
	},
};

class KhongDo extends Error {}

function doc(tep) {
	return readFileSync(tep, "utf8");
}

function git(...thamSo) {
	return execFileSync("git", ["-C", GOC, ...thamSo], {
		encoding: "utf8",
		stdio: ["ignore", "pipe", "pipe"],
	});
}

function coRef(ten) {
	try {
		git("rev-parse", "--verify", "--quiet", `${ten}^{commit}`);
		return true;
	} catch {
		return false;
	}
}

function muc(noiDung, tieuDe, ranhGioi) {
	const batDau = noiDung.indexOf(tieuDe);
	if (batDau === -1) return null;
	const ket = noiDung.indexOf(ranhGioi, batDau + tieuDe.length);
	return noiDung.slice(batDau, ket === -1 ? undefined : ket);
}

function mucH2(noiDung, tieuDe) {
	const dong = noiDung.split("\n");
	const batDau = dong.findIndex((d) => d.startsWith(tieuDe));
	if (batDau === -1) return null;
	const sau = dong.slice(batDau + 1).findIndex((d) => /^## /.test(d));
	const ket = sau === -1 ? dong.length : batDau + 1 + sau;
	return dong.slice(batDau, ket).join("\n");
}

function kiemContext() {
	const doan = muc(doc(TAI_LIEU.tep.context), TAI_LIEU.muc.cheDoAn, "\n\n**");
	if (doan === null) return ["CONTEXT.md thieu muc «Che do an»"];
	if (!doan.includes("_Avoid_"))
		return ["CONTEXT.md muc «Che do an» thieu dong _Avoid_"];
	return [];
}

function duoiTrangTri(dong, i) {
	let j = i - 1;
	while (j >= 0 && TAI_LIEU.thanTrangTri.test(dong[j])) j -= 1;
	return j >= 0 && TAI_LIEU.trangTri.test(dong[j]);
}

function thuTucTuRouter() {
	const dong = doc(TAI_LIEU.tep.router).split("\n");
	const thay = dong
		.map((d, i) => ({ ten: TAI_LIEU.thuTuc.exec(d)?.[1], i }))
		.filter((t) => t.ten);
	return {
		ten: new Set(thay.map((t) => t.ten)),
		lac: thay.filter((t) => !duoiTrangTri(dong, t.i)).map((t) => t.ten),
	};
}

function kiemApiMd(thuTuc) {
	const lac = thuTuc.lac.map(
		(ten) =>
			`tai lieu: ${ten} khong dung ngay duoi @Query/@Mutation trong router`,
	);
	const okr = mucH2(doc(TAI_LIEU.tep.api), TAI_LIEU.muc.okr);
	if (okr === null) return [...lac, "docs/api.md thieu muc «## OKR»"];
	const thieu = [...thuTuc.ten]
		.filter((ten) => !okr.includes(ten))
		.sort()
		.map((ten) => `tai lieu thieu thu tuc: ${ten}`);
	return [...lac, ...thieu];
}

function tepTrongCay(ref) {
	return new Set(
		git("ls-tree", "-r", "--name-only", ref).split("\n").filter(Boolean),
	);
}

function tapTepHangTrongDiff() {
	const thieuRef = [
		...Object.values(TAI_LIEU.ref),
		`${TAI_LIEU.ref.gop9b}^1`,
	].filter((ten) => !coRef(ten));
	if (thieuRef.length > 0) {
		if (process.env.CI) {
			console.warn(
				`tai-lieu: CI thieu ref ${thieuRef.join(", ")} (checkout nong) — bo qua kiem cho re 9b`,
			);
			return null;
		}
		throw new KhongDo(TAI_LIEU.thongDiep.thieuRef(thieuRef.join(", ")));
	}
	const doi = git(
		"diff",
		"--name-only",
		`${TAI_LIEU.ref.gop9b}^1`,
		TAI_LIEU.ref.gop9b,
	)
		.split("\n")
		.filter(Boolean);
	const coORelease = tepTrongCay(TAI_LIEU.ref.release);
	const conTrongCay = tepTrongCay(TAI_LIEU.ref.cay);
	return new Set(
		doi.filter((tep) => coORelease.has(tep) && conTrongCay.has(tep)),
	);
}

function tapTepTrongMucChoRe(noiDung) {
	const doan = mucH2(noiDung, TAI_LIEU.muc.choRe9b);
	if (doan === null) return null;
	return new Set([...doan.matchAll(/^- `([^`]+)`/gm)].map((m) => m[1]));
}

function kiemAgentMd() {
	const tapDoc = tapTepTrongMucChoRe(doc(TAI_LIEU.tep.agent));
	if (tapDoc === null)
		return [`docs/agent.md thieu muc «${TAI_LIEU.muc.choRe9b}»`];
	const tapDiff = tapTepHangTrongDiff();
	if (tapDiff === null) return [];
	const thieu = [...tapDiff].filter((t) => !tapDoc.has(t));
	const thua = [...tapDoc].filter((t) => !tapDiff.has(t));
	return [
		...thieu.map((t) => `tai lieu thieu tep hang: ${t}`),
		...thua.map(
			(t) =>
				`tai lieu thua tep hang (khong con trong diff giao release va cay): ${t}`,
		),
	];
}

function main() {
	const thuTuc = thuTucTuRouter();
	if (thuTuc.ten.size === 0) {
		console.error(TAI_LIEU.thongDiep.routerRong);
		return 1;
	}
	let loi;
	try {
		loi = [...kiemContext(), ...kiemApiMd(thuTuc), ...kiemAgentMd()];
	} catch (e) {
		const cau = String(e?.message ?? e).split("\n")[0];
		console.error(
			e instanceof KhongDo
				? cau
				: `tai lieu: khong do duoc cho re 9b — git loi: ${cau}`,
		);
		return 2;
	}
	if (loi.length > 0) {
		for (const dong of loi) console.error(dong);
		return 1;
	}
	console.log(
		`tai-lieu: CONTEXT.md, docs/api.md (${thuTuc.ten.size} thu tuc), docs/agent.md deu du.`,
	);
	return 0;
}

process.exit(main());
