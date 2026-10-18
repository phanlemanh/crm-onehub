import { spawnSync } from "node:child_process";
import path from "node:path";
import { TIN_HIEU } from "../../packages/validation/src/tin-hieu.ts";
import { chayKeoVe } from "./keo-ve.ts";

export const LICH = {
	nhanhChinh: "onehub",
	nhanhHangCho: "tin-hieu/keo-ve",
	tieuDePr: "TH1 · chore(tin-hieu-keo-ve): Tín hiệu kéo về",
	thanPr:
		"Lịch chạy kéo tín hiệu về kho mở PR này và cập nhật nó mỗi lượt. PR chỉ chạm thư mục nguồn tín hiệu và trang lộ trình máy vẽ lại từ chính các tín hiệu đó; gộp theo lô như mọi PR — lịch chạy không bao giờ tự gộp.",
	tacGia: {
		ten: "github-actions[bot]",
		thu: "41898282+github-actions[bot]@users.noreply.github.com",
	},
	thongDiep: {
		camMoPr:
			"bí mật TIN_HIEU_TOKEN không mở được PR — token thiếu quyền «Pull requests: Read and write» trên kho, hoặc token đã hết hạn; chủ kho cấp lại quyền hoặc tạo token mới rồi đặt lại bí mật; nhánh hàng chờ đã đẩy",
		moPrHong: "mở PR hàng chờ hỏng",
		chamNgoai:
			"commit hàng chờ chạm ngoài thư mục nguồn tín hiệu và trang lộ trình",
		veHong: "vẽ lại trang lộ trình hỏng",
		dayHong: "đẩy nhánh hàng chờ hỏng",
	},
	dauHieuCamMoPr: [
		"not permitted to create",
		"Resource not accessible by personal access token",
	],
	veLoTrinh: {
		lenh: "node",
		thamSo: ["scripts/product-map.mjs", "--root", "."],
		tep: "LO-TRINH.html",
	},
	boHookTruocDay: { CRM_SKIP_HOOKS: "1" },
} as const;

type Lenh = { ma: number; ra: string; loi: string };

function chay(
	lenh: string,
	thamSo: string[],
	cwd: string,
	env?: NodeJS.ProcessEnv,
): Lenh {
	const r = spawnSync(lenh, thamSo, {
		cwd,
		encoding: "utf8",
		env: env ?? process.env,
	});
	return {
		ma: r.status ?? 1,
		ra: r.stdout ?? "",
		loi: r.stderr ?? r.error?.message ?? "",
	};
}

function git(goc: string, ...thamSo: string[]): Lenh {
	return gitVoi(goc, {}, ...thamSo);
}

function gitVoi(
	goc: string,
	them: Record<string, string>,
	...thamSo: string[]
): Lenh {
	return chay("git", thamSo, goc, {
		...process.env,
		...them,
		GIT_AUTHOR_NAME: LICH.tacGia.ten,
		GIT_AUTHOR_EMAIL: LICH.tacGia.thu,
		GIT_COMMITTER_NAME: LICH.tacGia.ten,
		GIT_COMMITTER_EMAIL: LICH.tacGia.thu,
	});
}

function gitPhai(goc: string, ...thamSo: string[]): string {
	const r = git(goc, ...thamSo);
	if (r.ma !== 0)
		throw new Error(`git ${thamSo[0]} hỏng: ${r.loi.trim().split("\n")[0]}`);
	return r.ra.trim();
}

export type KetQuaLich = { ma: 0 | 1 | 2; dong: string[] };

export async function chayLich(o: {
	goc: string;
	env: Record<string, string | undefined>;
	gh: string;
	now: Date;
}): Promise<KetQuaLich> {
	const chinh = `origin/${LICH.nhanhChinh}`;
	const hangCho = `origin/${LICH.nhanhHangCho}`;
	gitPhai(o.goc, "fetch", "--quiet", "origin", LICH.nhanhChinh);
	git(
		o.goc,
		"fetch",
		"--quiet",
		"origin",
		`+${LICH.nhanhHangCho}:refs/remotes/${hangCho}`,
	);
	gitPhai(o.goc, "switch", "--quiet", "--detach", chinh);

	const keo = await chayKeoVe({
		root: o.goc,
		url: o.env.CRM_API_URL,
		key: undefined,
		khoaLich: o.env.CRM_KHOA_KEO_TIN_HIEU,
		now: o.now,
	});
	if (keo.ma !== 0) {
		return { ma: keo.ma, dong: [keo.loi ?? "lượt kéo về hỏng"] };
	}
	const dong = [...keo.tongKet];

	const thayDoi = gitPhai(
		o.goc,
		"status",
		"--porcelain",
		"--",
		TIN_HIEU.thuMucNguon,
	);
	if (!thayDoi) {
		dong.push(
			"không có tín hiệu nào chưa vào nhánh chính — không commit, không đẩy",
		);
		return { ma: 0, dong };
	}

	gitPhai(o.goc, "add", "--", TIN_HIEU.thuMucNguon);
	const ve = chay(LICH.veLoTrinh.lenh, [...LICH.veLoTrinh.thamSo], o.goc);
	if (ve.ma !== 0) {
		return {
			ma: 1,
			dong: [
				...dong,
				`${LICH.thongDiep.veHong}: ${(ve.loi || ve.ra).trim().split("\n")[0]}`,
			],
		};
	}
	gitPhai(o.goc, "add", "--", LICH.veLoTrinh.tep);
	const soTep = gitPhai(o.goc, "diff", "--cached", "--name-only")
		.split("\n")
		.filter(Boolean);
	gitPhai(
		o.goc,
		"commit",
		"--quiet",
		"-m",
		`chore(tin-hieu-keo-ve): kéo ${soTep.length} tín hiệu về hàng chờ`,
	);
	const cham = gitPhai(o.goc, "diff", "--name-only", chinh, "HEAD")
		.split("\n")
		.filter(Boolean);
	const ngoai = cham.filter(
		(t) =>
			t !== LICH.veLoTrinh.tep && !t.startsWith(`${TIN_HIEU.thuMucNguon}/`),
	);
	if (ngoai.length > 0) {
		return {
			ma: 1,
			dong: [...dong, `${LICH.thongDiep.chamNgoai}: ${ngoai.join(", ")}`],
		};
	}

	const cayMoi = gitPhai(o.goc, "rev-parse", "HEAD^{tree}");
	const cayCu = git(
		o.goc,
		"rev-parse",
		"--verify",
		"--quiet",
		`${hangCho}^{tree}`,
	).ra.trim();
	if (cayMoi !== cayCu) {
		const day = gitVoi(
			o.goc,
			LICH.boHookTruocDay,
			"push",
			"--quiet",
			"--force",
			"origin",
			`HEAD:refs/heads/${LICH.nhanhHangCho}`,
		);
		if (day.ma !== 0) {
			return {
				ma: 1,
				dong: [...dong, `${LICH.thongDiep.dayHong}: ${day.loi.trim()}`],
			};
		}
		dong.push(`đã đẩy ${soTep.length} tệp lên ${LICH.nhanhHangCho}`);
	} else {
		dong.push(`${LICH.nhanhHangCho} đã có đúng các tệp này — không đẩy`);
	}

	const ds = chay(
		o.gh,
		[
			"pr",
			"list",
			"--head",
			LICH.nhanhHangCho,
			"--base",
			LICH.nhanhChinh,
			"--state",
			"open",
			"--json",
			"number",
		],
		o.goc,
	);
	if (ds.ma !== 0) {
		return {
			ma: 1,
			dong: [
				...dong,
				`${LICH.thongDiep.moPrHong}: ${ds.loi.trim().split("\n")[0]}`,
			],
		};
	}
	const dangMo = JSON.parse(ds.ra || "[]") as unknown[];
	if (dangMo.length > 0) {
		dong.push("PR hàng chờ đang mở — không mở thêm");
		return { ma: 0, dong };
	}
	const tao = chay(
		o.gh,
		[
			"pr",
			"create",
			"--base",
			LICH.nhanhChinh,
			"--head",
			LICH.nhanhHangCho,
			"--title",
			LICH.tieuDePr,
			"--body",
			LICH.thanPr,
		],
		o.goc,
	);
	if (tao.ma !== 0) {
		const ly = LICH.dauHieuCamMoPr.some((d) => tao.loi.includes(d))
			? LICH.thongDiep.camMoPr
			: `${LICH.thongDiep.moPrHong}: ${tao.loi.trim().split("\n")[0]}`;
		return { ma: 1, dong: [...dong, ly] };
	}
	dong.push(`đã mở PR hàng chờ: ${tao.ra.trim()}`);
	return { ma: 0, dong };
}

if (import.meta.main) {
	const kq = await chayLich({
		goc: path.resolve(import.meta.dir, "..", ".."),
		env: process.env,
		gh: "gh",
		now: new Date(),
	}).catch((loi: unknown) => ({
		ma: 1 as const,
		dong: [loi instanceof Error ? loi.message : "lượt lịch hỏng"],
	}));
	for (const d of kq.dong) (kq.ma === 0 ? console.log : console.error)(d);
	process.exit(kq.ma);
}
