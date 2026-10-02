import { execFileSync, spawnSync } from "node:child_process";
import {
	cpSync,
	existsSync,
	mkdirSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	rmSync,
	statSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, posix } from "node:path";
import { fileURLToPath } from "node:url";

const TEP = fileURLToPath(import.meta.url);
const GOC = join(dirname(TEP), "..", "..", "..");

const TAI_LIEU = {
	slug: "soan-okr-cung-tro-ly",
	release: process.env.TAI_LIEU_REF_RELEASE ?? "origin/release",
	tep: {
		context: "CONTEXT.md",
		api: "docs/api.md",
		agent: "docs/agent.md",
		chatUi: "docs/chat-ui.md",
		setup: "docs/setup.md",
		env: "docs/environment.md",
		envViDu: ".env.example",
		turbo: "turbo.json",
		turboApp: "apps/app/turbo.json",
		turboOkr: "apps/agent-okr/turbo.json",
		loTrinh: "docs/plan/lo-trinh-okr.md",
		router: "apps/api/src/okr/okr.router.ts",
	},
	bien: ["OKR_AGENT_URL", "OKR_AGENT_BRIDGE_SECRET"],
	biMat: ["OKR_AGENT_BRIDGE_SECRET"],
	taskApp: ["build", "dev"],
	muc: {
		context: [
			"**Cuộc soạn**",
			"**Bản nháp (OKR)**",
			"**Trang chiến lược**",
			"**Mô tả đơn vị**",
			"**Chức danh**",
		],
		okr: "## OKR",
		appThuHai: "## App eve thứ hai: Trợ lý OKR soạn (apps/agent-okr)",
		choRe: "## Chỗ rẽ: Soạn OKR cùng Trợ lý",
		trongCay: "### What is in the tree today",
		phienDo: "### Screen measurements get a database of their own",
		theoDoi: "## 10. Theo dõi",
	},
	appThuHaiCan: [
		"apps/agent-okr",
		"/eve/agents/okr/eve/v1",
		"crm-okr-agent",
		"OKR_AGENT_BRIDGE_SECRET",
		"nop_ban_nhap",
	],
	soChatUi: {
		thuMuc: "packages/ui/src/components/ai-elements",
		tieuDe: (n) => `— ${n}`,
		cau: (chu) => `exactly ${chu} files`,
		chu: [
			"zero",
			"one",
			"two",
			"three",
			"four",
			"five",
			"six",
			"seven",
			"eight",
			"nine",
			"ten",
			"eleven",
			"twelve",
			"thirteen",
			"fourteen",
			"fifteen",
			"sixteen",
			"seventeen",
			"eighteen",
			"nineteen",
			"twenty",
		],
		hangBang: /^\| `([^`]+)` \|/gm,
		tepThu: "zz-thu.tsx",
		tepBo: "shimmer.tsx",
	},
	chatUi: [
		"Conversation",
		"ConversationEmptyState",
		"Suggestion",
		"PromptInput",
	],
	thuTuc: { mau: /^\t(soan[A-Z][A-Za-z]*)\(/, toiThieu: 9 },
	trangTri: /^\t@(Query|Mutation)\(/,
	thanTrangTri: /^\t\t|^\t\}\)/,
	trangThai: [
		"đang dựng",
		"Cổng Bằng chứng",
		"đã lên `onehub`",
		"Cổng Giá trị",
		"xong",
	],
	tepHang: [
		".env.example",
		"apps/agent/package.json",
		"apps/api/src/generated/server.ts",
		"apps/app/lib/agent-bridge.ts",
		"apps/app/lib/agent-session.ts",
		"apps/app/lib/search-param-keys.ts",
		"apps/app/lib/trpc/cache.ts",
		"apps/app/test/agent-session.spec.ts",
		"apps/app/turbo.json",
		"bun.lock",
		"docs/agent.md",
		"docs/api.md",
		"docs/design.md",
		"docs/environment.md",
		"docs/setup.md",
		"packages/db/package.json",
		"packages/db/prisma/schema.prisma",
		"packages/ui/package.json",
		"packages/ui/src/components/empty.tsx",
		"packages/ui/src/components/sheet.tsx",
		"packages/validation/package.json",
		"turbo.json",
	],
	dongHang: /^- `([^`]+)`/gm,
	vung: {
		moi: [
			"apps/agent-okr",
			"packages/ai-okr",
			"apps/api/src/okr",
			"apps/api/scripts/okr-mau/nap-tai-lieu.ts",
			"apps/app/app/(app)/[slug]/okr",
			"apps/app/app/(app)/[slug]/settings/okr",
			"apps/app/app/(app)/[slug]/settings/organization",
			"apps/app/app/eve/agents/okr",
			"apps/app/lib/cua-okr-config.ts",
			"apps/app/lib/messages/okr-soan.ts",
			"apps/app/lib/okr-soan-record.ts",
			"packages/db/src/okr-cuoc-soan.ts",
			"packages/db/src/okr-goi-soan.ts",
			"packages/db/src/tai-lieu-chien-luoc.ts",
			"packages/ui/src/components/ai-elements/prompt-input.tsx",
			"packages/ui/src/components/ai-elements/suggestion.tsx",
			"packages/ui/src/components/section-heading.tsx",
			"packages/validation/src/okr-cuoc-soan.ts",
			"packages/validation/src/okr-kiem-ban-nhap.ts",
			"packages/validation/src/okr-tom-gon-ky.ts",
			"packages/validation/src/to-chuc.ts",
		],
		api: ["apps/api/src"],
		agentOkr: ["apps/agent-okr"],
	},
	loaiThuMuc: ["node_modules"],
	duoi: /\.(ts|tsx|mjs|js)$/,
	boQua: [
		/\/generated\//,
		/\/test\//,
		/\.spec\.tsx?$/,
		/\.dom\.tsx$/,
		/\/evals\//,
		/\/proto\//,
		/\/fixtures?\//,
	],
	chuThich: /\/\/|\/\*/,
	url: /[a-z][a-z0-9+.-]*:\/\/[^\s"'`)]*/gi,
	gachThoat: /\\\//g,
	chuoi: /"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\\n]|\\.)*`/g,
	kieuLong: /Record<string,\s*unknown>/,
	dungClient: /^\s*["']use client["']/,
	nhapServer:
		/\b(?:import|export)\s+(type\s+)?[^;]*?\bfrom\s*["'](@crm\/(?:db|auth)(?:\/[^"']*)?)["']/g,
	nhap: /(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s+|\brequire\s*\(\s*)["']([^"'\n]+)["']/g,
	agent: { thuMuc: "apps/agent", goi: /^agent(\/|$)/ },
	goiMoHinh:
		/\b(generateText|streamText|generateObject|streamObject)\s*\(|from\s+["'](ai|@ai-sdk\/[^"']+|openai|@anthropic-ai\/[^"']+|@google\/[^"']+)["']/,
	tienToTam: "soan-tai-lieu-",
	suite: {
		config: "_acceptance/config.yaml",
		khoiCha: "feature_loop:",
		khoa: /^\s+suite_keys:\s*\[(.*)\]\s*$/,
		tienTo: "executors.test.",
		khoiLenh: ["executors:", "test:"],
		dongLenh: /^ {4}([A-Za-z0-9_]+):\s*(.*)$/,
		loc: /--filter=(?:"([^"]+)"|'([^']+)'|([^\s'"]+))/g,
		thuMucGoi: ["apps", "packages"],
		goiThu: { thuMuc: "packages/zz", ten: "@crm/zz" },
		lenhLap: { khoa: "suite_app_ui", them: "api" },
	},
};

class KhongDo extends Error {}

const khongDo = (cau) => {
	throw new KhongDo(cau);
};

function doc(goc, tep) {
	const duong = join(goc, tep);
	if (!existsSync(duong)) khongDo(`thieu tep: ${tep}`);
	return readFileSync(duong, "utf8");
}

function lietKe(goc, duong) {
	const tuyet = join(goc, duong);
	if (!existsSync(tuyet)) khongDo(`thieu tep: ${duong}`);
	if (!statSync(tuyet).isDirectory())
		return TAI_LIEU.duoi.test(duong) ? [duong] : [];
	return readdirSync(tuyet, { withFileTypes: true }).flatMap((m) => {
		const con = `${duong}/${m.name}`;
		if (m.isDirectory())
			return m.name.startsWith(".") || TAI_LIEU.loaiThuMuc.includes(m.name)
				? []
				: lietKe(goc, con);
		return TAI_LIEU.duoi.test(m.name) ? [con] : [];
	});
}

const tapTep = (goc, vung) => [...new Set(vung.flatMap((d) => lietKe(goc, d)))];
const tepMa = (goc, vung) =>
	tapTep(goc, vung).filter((t) => !TAI_LIEU.boQua.some((m) => m.test(t)));

const soDong = (chu, viTri) => chu.slice(0, viTri).split("\n").length;

function mucTieuDe(noiDung, tieuDe) {
	const cap = /^#+/.exec(tieuDe)[0].length;
	const dong = noiDung.split("\n");
	const bat = dong.findIndex((d) => d.startsWith(tieuDe));
	if (bat === -1) return null;
	const sau = dong.slice(bat + 1).findIndex((d) => {
		const m = /^(#+) /.exec(d);
		return m !== null && m[1].length <= cap;
	});
	return dong.slice(bat, sau === -1 ? dong.length : bat + 1 + sau).join("\n");
}

function kiemContext(goc) {
	const chu = doc(goc, TAI_LIEU.tep.context);
	const loi = [];
	for (const ten of TAI_LIEU.muc.context) {
		const tenTran = ten.replaceAll("**", "");
		const bat = chu.indexOf(ten);
		if (bat === -1) {
			loi.push(`CONTEXT.md thieu muc «${tenTran}»`);
			continue;
		}
		const ket = chu.indexOf("\n\n**", bat + ten.length);
		const doan = chu.slice(bat, ket === -1 ? undefined : ket);
		if (!doan.includes("_Avoid_"))
			loi.push(`CONTEXT.md muc «${tenTran}» thieu dong _Avoid_`);
		if (!doan.includes("Vì sao:"))
			loi.push(`CONTEXT.md muc «${tenTran}» thieu dong Vì sao`);
		if (!doan.includes(`Cổng Phạm vi của \`${TAI_LIEU.slug}\``))
			loi.push(`CONTEXT.md muc «${tenTran}» thieu cau chot tai Cong Pham vi`);
	}
	return loi;
}

function thuTucTuRouter(goc) {
	const dong = doc(goc, TAI_LIEU.tep.router).split("\n");
	const duoiTrangTri = (i) => {
		let j = i - 1;
		while (j >= 0 && TAI_LIEU.thanTrangTri.test(dong[j])) j -= 1;
		return j >= 0 && TAI_LIEU.trangTri.test(dong[j]);
	};
	const ten = [];
	dong.forEach((d, i) => {
		const m = TAI_LIEU.thuTuc.mau.exec(d);
		if (m && duoiTrangTri(i)) ten.push(m[1]);
	});
	return new Set(ten);
}

function kiemApiMd(goc) {
	const ten = thuTucTuRouter(goc);
	if (ten.size < TAI_LIEU.thuTuc.toiThieu)
		return [
			`router chi co ${ten.size} thu tuc soan* (< ${TAI_LIEU.thuTuc.toiThieu})`,
		];
	const okr = mucTieuDe(doc(goc, TAI_LIEU.tep.api), TAI_LIEU.muc.okr);
	if (okr === null) return [`docs/api.md thieu muc «${TAI_LIEU.muc.okr}»`];
	return [...ten]
		.filter((t) => !okr.includes(`\`${t}\``))
		.sort()
		.map((t) => `tai lieu thieu thu tuc: ${t}`);
}

function kiemAgentMd(goc) {
	const chu = doc(goc, TAI_LIEU.tep.agent);
	const loi = [];
	const app = mucTieuDe(chu, TAI_LIEU.muc.appThuHai);
	if (app === null)
		loi.push(`docs/agent.md thieu muc «${TAI_LIEU.muc.appThuHai}»`);
	else
		for (const can of TAI_LIEU.appThuHaiCan)
			if (!app.includes(can))
				loi.push(`docs/agent.md muc app eve thu hai khong nhac ${can}`);
	const choRe = mucTieuDe(chu, TAI_LIEU.muc.choRe);
	if (choRe === null)
		return [...loi, `docs/agent.md thieu muc «${TAI_LIEU.muc.choRe}»`];
	const tapDoc = new Set(
		[...choRe.matchAll(TAI_LIEU.dongHang)].map((m) => m[1]),
	);
	const tapHang = new Set(TAI_LIEU.tepHang);
	return [
		...loi,
		...[...tapHang]
			.filter((t) => !tapDoc.has(t))
			.map((t) => `tai lieu thieu tep hang: ${t}`),
		...[...tapDoc]
			.filter((t) => !tapHang.has(t))
			.map((t) => `tai lieu thua tep hang: ${t}`),
	];
}

function tepAiElements(goc) {
	const thuMuc = TAI_LIEU.soChatUi.thuMuc;
	const tuyet = join(goc, thuMuc);
	if (!existsSync(tuyet) || !statSync(tuyet).isDirectory())
		khongDo(`thieu thu muc: ${thuMuc}`);
	return readdirSync(tuyet, { withFileTypes: true })
		.filter((m) => m.isFile())
		.map((m) => m.name)
		.sort();
}

function soChuChatUi(n) {
	const chu = TAI_LIEU.soChatUi.chu[n];
	if (chu === undefined)
		khongDo(`${TAI_LIEU.soChatUi.thuMuc} co ${n} tep, ngoai bang so chu`);
	return chu;
}

const tieuDeChatUi = (goc) =>
	TAI_LIEU.soChatUi.tieuDe(tepAiElements(goc).length);
const cauChatUi = (goc) =>
	TAI_LIEU.soChatUi.cau(soChuChatUi(tepAiElements(goc).length));

function kiemChatUi(goc) {
	const doan = mucTieuDe(doc(goc, TAI_LIEU.tep.chatUi), TAI_LIEU.muc.trongCay);
	if (doan === null)
		return [`docs/chat-ui.md thieu muc «${TAI_LIEU.muc.trongCay}»`];
	const tep = tepAiElements(goc);
	const tieuDe = tieuDeChatUi(goc);
	const cau = cauChatUi(goc);
	const dauMuc = doan.split("\n")[0];
	const loi = [];
	if (!dauMuc.endsWith(tieuDe))
		loi.push(
			`docs/chat-ui.md tieu de «What is in the tree today» khong ghi «${tieuDe}»: ${dauMuc}`,
		);
	if (!doan.includes(cau))
		loi.push(`docs/chat-ui.md muc so khong ghi «${cau}»`);
	if (!doan.includes(`\`${TAI_LIEU.soChatUi.thuMuc}/\``))
		loi.push(
			`docs/chat-ui.md muc so khong nhac thu muc ${TAI_LIEU.soChatUi.thuMuc}/`,
		);
	const bang = new Set(
		[...doan.matchAll(TAI_LIEU.soChatUi.hangBang)].map((m) => m[1]),
	);
	loi.push(
		...tep
			.filter((t) => !bang.has(t))
			.map(
				(t) =>
					`docs/chat-ui.md bang «What is in the tree today» thieu tep: ${t}`,
			),
		...[...bang]
			.filter((t) => !tep.includes(t))
			.sort()
			.map(
				(t) =>
					`docs/chat-ui.md bang «What is in the tree today» thua tep: ${t}`,
			),
	);
	return [
		...loi,
		...TAI_LIEU.chatUi
			.filter((t) => !doan.includes(`\`${t}\``))
			.map(
				(t) => `docs/chat-ui.md so thieu ${t} o «What is in the tree today»`,
			),
	];
}

function mangEnv(turbo) {
	const ra = [...(turbo.globalEnv ?? [])];
	for (const nv of Object.values(turbo.tasks ?? {})) ra.push(...(nv.env ?? []));
	return ra;
}

function docJson(goc, tep) {
	try {
		return JSON.parse(doc(goc, tep));
	} catch (e) {
		if (e instanceof KhongDo) throw e;
		return khongDo(`${tep} khong phai JSON: ${e.message}`);
	}
}

function kiemBonNha(goc) {
	const envViDu = doc(goc, TAI_LIEU.tep.envViDu);
	const turbo = docJson(goc, TAI_LIEU.tep.turbo);
	const turboApp = docJson(goc, TAI_LIEU.tep.turboApp);
	const turboOkr = docJson(goc, TAI_LIEU.tep.turboOkr);
	const envMd = doc(goc, TAI_LIEU.tep.env);
	const loi = [];
	for (const b of TAI_LIEU.bien) {
		if (!new RegExp(`^#?\\s*${b}=`, "m").test(envViDu))
			loi.push(`thieu nha: .env.example ${b}`);
		if (!(turbo.globalPassThroughEnv ?? []).includes(b))
			loi.push(`thieu nha: turbo globalPassThroughEnv ${b}`);
		for (const task of TAI_LIEU.taskApp)
			if (!(turboApp.tasks?.[task]?.passThroughEnv ?? []).includes(b))
				loi.push(`thieu nha: apps/app/turbo.json ${task}.passThroughEnv ${b}`);
		if (!envMd.includes(`\`${b}\``)) loi.push(`docs/environment.md thieu ${b}`);
	}
	for (const b of TAI_LIEU.biMat)
		if ([turbo, turboApp, turboOkr].some((t) => mangEnv(t).includes(b)))
			loi.push(`bi mat nam trong env: ${b}`);
	return loi;
}

function kiemSetup(goc) {
	const doan = mucTieuDe(doc(goc, TAI_LIEU.tep.setup), TAI_LIEU.muc.phienDo);
	if (doan === null)
		return [`docs/setup.md thieu muc «${TAI_LIEU.muc.phienDo}»`];
	return doan.includes(TAI_LIEU.vung.agentOkr[0])
		? []
		: ["docs/setup.md muc phien do khong nhac apps/agent-okr"];
}

const hangLoTrinh = () =>
	new RegExp(`^\\| [0-9a-z]+ \\| \`${TAI_LIEU.slug}\` \\|`);

function kiemLoTrinh(goc) {
	const doan = mucTieuDe(doc(goc, TAI_LIEU.tep.loTrinh), TAI_LIEU.muc.theoDoi);
	if (doan === null) return ["lo-trinh-okr.md thieu muc 10"];
	const hang = doan.split("\n").find((d) => hangLoTrinh().test(d));
	if (!hang) return [`lo-trinh-okr.md muc 10 thieu dong ${TAI_LIEU.slug}`];
	const o = hang.split("|").map((c) => c.trim());
	return TAI_LIEU.trangThai.includes(o[3])
		? []
		: [`lo-trinh-okr.md trang thai la: ${o[3]}`];
}

const boChuoi = (d) =>
	d
		.replace(TAI_LIEU.url, "")
		.replace(TAI_LIEU.gachThoat, "_")
		.replace(TAI_LIEU.chuoi, '""');

function quetDong(goc, tep, thu, nhan) {
	const loi = [];
	for (const t of tep)
		doc(goc, t)
			.split("\n")
			.forEach((d, i) => {
				if (thu(d)) loi.push(`${nhan}: ${t}:${i + 1}`);
			});
	return loi;
}

function kiemChuThich(goc) {
	return quetDong(
		goc,
		tepMa(goc, TAI_LIEU.vung.moi),
		(d) => TAI_LIEU.chuThich.test(boChuoi(d)),
		"chu thich moi",
	);
}

function kiemKieuLong(goc) {
	return quetDong(
		goc,
		tepMa(goc, TAI_LIEU.vung.moi),
		(d) => TAI_LIEU.kieuLong.test(d),
		"kieu long Record<string, unknown>",
	);
}

function kiemClient(goc) {
	const loi = [];
	for (const t of tepMa(goc, TAI_LIEU.vung.moi)) {
		const chu = doc(goc, t);
		const dauTien = chu.split("\n").find((d) => d.trim() !== "") ?? "";
		if (!TAI_LIEU.dungClient.test(dauTien)) continue;
		for (const m of chu.matchAll(TAI_LIEU.nhapServer))
			if (!m[1])
				loi.push(
					`client nhap goi may chu: ${t}:${soDong(chu, m.index)} ${m[2]}`,
				);
	}
	return loi;
}

function kiemApi(goc) {
	return quetDong(
		goc,
		tepMa(goc, TAI_LIEU.vung.api),
		(d) => TAI_LIEU.goiMoHinh.test(d),
		"api goi model",
	);
}

function trongAgent(duong) {
	const thuMuc = TAI_LIEU.agent.thuMuc;
	return duong === thuMuc || duong.startsWith(`${thuMuc}/`);
}

function vaoAgent(t, dich) {
	if (dich.startsWith("."))
		return trongAgent(posix.normalize(posix.join(posix.dirname(t), dich)));
	return TAI_LIEU.agent.goi.test(dich) || trongAgent(dich);
}

function kiemNhapCheo(goc) {
	const tep = tapTep(goc, TAI_LIEU.vung.agentOkr);
	if (tep.length === 0)
		khongDo(`${TAI_LIEU.vung.agentOkr[0]} khong co tep ma nao`);
	const loi = [];
	for (const t of tep) {
		const chu = doc(goc, t);
		for (const m of chu.matchAll(TAI_LIEU.nhap))
			if (vaoAgent(t, m[1]))
				loi.push(`nhap cheo apps/agent: ${t}:${soDong(chu, m.index)}`);
	}
	return loi;
}

function boNhay(gia) {
	const t = gia.trim();
	const m = /^'(.*)'$|^"(.*)"$/.exec(t);
	return m ? (m[1] ?? m[2]) : t;
}

function khoiCon(dong, tu, ten, thut) {
	const dau = " ".repeat(thut);
	const bat = dong.findIndex((d, i) => i >= tu && d === `${dau}${ten}`);
	if (bat === -1) return null;
	const ket = dong.findIndex(
		(d, i) => i > bat && d.trim() !== "" && !d.startsWith(`${dau} `),
	);
	return { bat, ket: ket === -1 ? dong.length : ket };
}

function lenhSuite(goc) {
	const S = TAI_LIEU.suite;
	const dong = doc(goc, S.config).split("\n");
	const cha = khoiCon(dong, 0, S.khoiCha, 0);
	if (cha === null) khongDo(`${S.config} thieu ${S.khoiCha}`);
	const dongKhoa = dong
		.slice(cha.bat + 1, cha.ket)
		.map((d) => S.khoa.exec(d))
		.find(Boolean);
	if (!dongKhoa) khongDo(`${S.config} feature_loop.suite_keys khong doc duoc`);
	const khoa = dongKhoa[1]
		.split(",")
		.map((k) => boNhay(k))
		.filter((k) => k.startsWith(S.tienTo))
		.map((k) => k.slice(S.tienTo.length));
	if (khoa.length === 0)
		khongDo(`${S.config} suite_keys khong co lenh ${S.tienTo}*`);
	const ex = khoiCon(dong, 0, S.khoiLenh[0], 0);
	const test = ex && khoiCon(dong, ex.bat + 1, S.khoiLenh[1], 2);
	if (!test) khongDo(`${S.config} thieu executors.test`);
	const lenh = new Map();
	for (const d of dong.slice(test.bat + 1, test.ket)) {
		const m = S.dongLenh.exec(d);
		if (m) lenh.set(m[1], boNhay(m[2]));
	}
	return khoa.map((k) => ({ khoa: k, lenh: lenh.get(k) }));
}

function goiCoTest(goc) {
	const ra = [];
	for (const cha of TAI_LIEU.suite.thuMucGoi) {
		const tuyet = join(goc, cha);
		if (!existsSync(tuyet)) khongDo(`thieu thu muc: ${cha}`);
		for (const m of readdirSync(tuyet, { withFileTypes: true })) {
			const tep = `${cha}/${m.name}/package.json`;
			if (!m.isDirectory() || !existsSync(join(goc, tep))) continue;
			const goi = docJson(goc, tep);
			if (goi.scripts?.test) ra.push(goi.name);
		}
	}
	return ra.sort();
}

function tepGoi(goc) {
	return TAI_LIEU.suite.thuMucGoi.flatMap((cha) =>
		readdirSync(join(goc, cha), { withFileTypes: true })
			.filter((m) => m.isDirectory())
			.map((m) => `${cha}/${m.name}/package.json`)
			.filter((t) => existsSync(join(goc, t))),
	);
}

function kiemSuite(goc) {
	const loi = [];
	const dem = new Map();
	for (const { khoa, lenh } of lenhSuite(goc)) {
		if (lenh === undefined) {
			loi.push(`khoa suite khong co lenh: executors.test.${khoa}`);
			continue;
		}
		for (const m of lenh.matchAll(TAI_LIEU.suite.loc)) {
			const ten = m[1] ?? m[2] ?? m[3];
			dem.set(ten, (dem.get(ten) ?? 0) + 1);
		}
	}
	const goi = goiCoTest(goc);
	return [
		...loi,
		...goi.filter((t) => !dem.has(t)).map((t) => `goi thieu trong suite: ${t}`),
		...[...dem]
			.filter(([, n]) => n > 1)
			.map(([t]) => t)
			.sort()
			.map((t) => `goi lap trong suite: ${t}`),
		...[...dem.keys()]
			.filter((t) => !goi.includes(t))
			.sort()
			.map((t) => `loc suite khong khop goi co test: ${t}`),
	];
}

function kiemTinh(goc) {
	return [
		...kiemContext(goc),
		...kiemApiMd(goc),
		...kiemAgentMd(goc),
		...kiemChatUi(goc),
		...kiemBonNha(goc),
		...kiemSetup(goc),
		...kiemLoTrinh(goc),
		...kiemChuThich(goc),
		...kiemKieuLong(goc),
		...kiemClient(goc),
		...kiemApi(goc),
		...kiemNhapCheo(goc),
		...kiemSuite(goc),
	];
}

function git(...thamSo) {
	return execFileSync("git", ["-C", GOC, ...thamSo], {
		encoding: "utf8",
		maxBuffer: 64 * 1024 * 1024,
		stdio: ["ignore", "pipe", "pipe"],
	});
}

function coGit(...thamSo) {
	try {
		git(...thamSo);
		return true;
	} catch {
		return false;
	}
}

function kiemRelease() {
	const ref = TAI_LIEU.release;
	if (!coGit("rev-parse", "--verify", "--quiet", `${ref}^{commit}`)) {
		if (process.env.CI) {
			console.log(
				`tai-lieu: CI thieu ref ${ref} — bo qua kiem tep hang o release`,
			);
			return [];
		}
		khongDo(`thieu ref ${ref}`);
	}
	const loi = [];
	for (const t of TAI_LIEU.tepHang) {
		if (!coGit("cat-file", "-e", `${ref}:${t}`)) {
			loi.push(`tep hang khong co o release: ${t}`);
			continue;
		}
		if (coGit("diff", "--quiet", ref, "HEAD", "--", t))
			loi.push(`tep hang khong con re khoi release: ${t}`);
	}
	return loi;
}

const ghi = (goc, tep, doi) => {
	const cu = doc(goc, tep);
	const moi = doi(cu);
	if (moi === cu) khongDo(`pha khong doi duoc ${tep}`);
	writeFileSync(join(goc, tep), moi);
};

const ghiJson = (goc, tep, doi) =>
	ghi(goc, tep, (cu) => {
		const t = JSON.parse(cu);
		doi(t);
		return JSON.stringify(t, null, "\t");
	});

const chenSau = (moc, them) => (cu) => cu.replace(moc, `${moc}${them}`);

const doiTrongMucContext = (ten, tu, thanh) => (c) => {
	const bat = c.indexOf(ten);
	const ket = c.indexOf("\n\n**", bat + ten.length);
	return `${c.slice(0, bat)}${c.slice(bat, ket).replaceAll(tu, thanh)}${c.slice(ket)}`;
};

const doiTieuDe = (tep, tu, thanh) => ({
	lam: (g) => ghi(g, tep, (c) => c.replace(tu, thanh)),
});

const PHA = [
	{
		ten: "context-thieu-muc",
		ghim: "CONTEXT.md thieu muc «Chức danh»",
		lam: (g) =>
			ghi(g, TAI_LIEU.tep.context, (c) =>
				c.replace("**Chức danh**", "**Chức-danh**"),
			),
	},
	{
		ten: "context-thieu-avoid",
		ghim: "CONTEXT.md muc «Cuộc soạn» thieu dong _Avoid_",
		lam: (g) =>
			ghi(
				g,
				TAI_LIEU.tep.context,
				doiTrongMucContext("**Cuộc soạn**", "_Avoid_", "_Tranh_"),
			),
	},
	{
		ten: "context-thieu-vi-sao",
		ghim: "CONTEXT.md muc «Cuộc soạn» thieu dong Vì sao",
		lam: (g) =>
			ghi(
				g,
				TAI_LIEU.tep.context,
				doiTrongMucContext("**Cuộc soạn**", "Vì sao:", "Vi sao -"),
			),
	},
	{
		ten: "context-thieu-cau-chot",
		ghim: "CONTEXT.md muc «Cuộc soạn» thieu cau chot tai Cong Pham vi",
		lam: (g) =>
			ghi(
				g,
				TAI_LIEU.tep.context,
				doiTrongMucContext(
					"**Cuộc soạn**",
					`Cổng Phạm vi của \`${TAI_LIEU.slug}\``,
					`Cổng Phạm vi (${TAI_LIEU.slug})`,
				),
			),
	},
	{
		ten: "router-thieu-thu-tuc",
		ghim: `router chi co ${TAI_LIEU.thuTuc.toiThieu - 1} thu tuc soan* (< ${TAI_LIEU.thuTuc.toiThieu})`,
		lam: (g) =>
			ghi(g, TAI_LIEU.tep.router, (c) => c.replace("\tsoanAn(", "\tanSoan(")),
	},
	{
		ten: "api-thieu-h2",
		ghim: `docs/api.md thieu muc «${TAI_LIEU.muc.okr}»`,
		...doiTieuDe(
			TAI_LIEU.tep.api,
			`\n${TAI_LIEU.muc.okr}\n`,
			"\n## Muc tieu\n",
		),
	},
	{
		ten: "agent-thieu-h2-app",
		ghim: `docs/agent.md thieu muc «${TAI_LIEU.muc.appThuHai}»`,
		...doiTieuDe(
			TAI_LIEU.tep.agent,
			TAI_LIEU.muc.appThuHai,
			"## App eve thu hai",
		),
	},
	{
		ten: "agent-thieu-h2-cho-re",
		ghim: `docs/agent.md thieu muc «${TAI_LIEU.muc.choRe}»`,
		...doiTieuDe(TAI_LIEU.tep.agent, TAI_LIEU.muc.choRe, "## Cho re: Soan OKR"),
	},
	{
		ten: "chat-ui-thieu-h3",
		ghim: `docs/chat-ui.md thieu muc «${TAI_LIEU.muc.trongCay}»`,
		...doiTieuDe(
			TAI_LIEU.tep.chatUi,
			TAI_LIEU.muc.trongCay,
			"### What is in the tree now",
		),
	},
	{
		ten: "chat-ui-so-tieu-de",
		ghimTheo: (g) =>
			`docs/chat-ui.md tieu de «What is in the tree today» khong ghi «${tieuDeChatUi(g)}»`,
		lam: (g) =>
			ghi(g, TAI_LIEU.tep.chatUi, (c) =>
				c.replace(
					`${TAI_LIEU.muc.trongCay} ${tieuDeChatUi(g)}`,
					`${TAI_LIEU.muc.trongCay} ${TAI_LIEU.soChatUi.tieuDe(tepAiElements(g).length + 1)}`,
				),
			),
	},
	{
		ten: "chat-ui-so-cau",
		ghimTheo: (g) => `docs/chat-ui.md muc so khong ghi «${cauChatUi(g)}»`,
		lam: (g) =>
			ghi(g, TAI_LIEU.tep.chatUi, (c) =>
				c.replace(
					cauChatUi(g),
					TAI_LIEU.soChatUi.cau(soChuChatUi(tepAiElements(g).length + 1)),
				),
			),
	},
	{
		ten: "chat-ui-them-tep",
		ghim: `docs/chat-ui.md bang «What is in the tree today» thieu tep: ${TAI_LIEU.soChatUi.tepThu}`,
		lam: (g) =>
			writeFileSync(
				join(g, TAI_LIEU.soChatUi.thuMuc, TAI_LIEU.soChatUi.tepThu),
				"export const thu = 1;\n",
			),
	},
	{
		ten: "chat-ui-bo-tep",
		ghim: `docs/chat-ui.md bang «What is in the tree today» thua tep: ${TAI_LIEU.soChatUi.tepBo}`,
		lam: (g) =>
			rmSync(join(g, TAI_LIEU.soChatUi.thuMuc, TAI_LIEU.soChatUi.tepBo)),
	},
	{
		ten: "setup-thieu-h3",
		ghim: `docs/setup.md thieu muc «${TAI_LIEU.muc.phienDo}»`,
		...doiTieuDe(
			TAI_LIEU.tep.setup,
			TAI_LIEU.muc.phienDo,
			"### Screen measurements",
		),
	},
	{
		ten: "lo-trinh-thieu-muc",
		ghim: "lo-trinh-okr.md thieu muc 10",
		...doiTieuDe(TAI_LIEU.tep.loTrinh, TAI_LIEU.muc.theoDoi, "## 10. Theo doi"),
	},
	{
		ten: "api-thieu-thu-tuc",
		ghim: "tai lieu thieu thu tuc: soanTangLuot",
		lam: (g) =>
			ghi(g, TAI_LIEU.tep.api, (c) =>
				c.replaceAll("`soanTangLuot`", "`soan-tang-luot`"),
			),
	},
	{
		ten: "agent-app-thu-hai",
		ghim: "docs/agent.md muc app eve thu hai khong nhac nop_ban_nhap",
		lam: (g) =>
			ghi(g, TAI_LIEU.tep.agent, (c) => {
				const doan = mucTieuDe(c, TAI_LIEU.muc.appThuHai);
				return c.replace(doan, doan.replaceAll("nop_ban_nhap", "nop-ban"));
			}),
	},
	{
		ten: "agent-cho-re-thieu",
		ghim: "tai lieu thieu tep hang: turbo.json",
		lam: (g) =>
			ghi(g, TAI_LIEU.tep.agent, (c) => {
				const doan = mucTieuDe(c, TAI_LIEU.muc.choRe);
				return c.replace(
					doan,
					doan.replace("\n- `turbo.json`", "\n* `turbo.json`"),
				);
			}),
	},
	{
		ten: "agent-cho-re-thua",
		ghim: "tai lieu thua tep hang: apps/app/next.config.ts",
		lam: (g) =>
			ghi(g, TAI_LIEU.tep.agent, (c) =>
				c.replace(
					`${TAI_LIEU.muc.choRe}\n`,
					`${TAI_LIEU.muc.choRe}\n\n- \`apps/app/next.config.ts\` — thu\n`,
				),
			),
	},
	{
		ten: "chat-ui-so",
		ghim: "docs/chat-ui.md so thieu PromptInput o «What is in the tree today»",
		lam: (g) =>
			ghi(g, TAI_LIEU.tep.chatUi, (c) =>
				c.replaceAll("`PromptInput`", "`Prompt-Input`"),
			),
	},
	{
		ten: "env-vi-du",
		ghim: "thieu nha: .env.example OKR_AGENT_URL",
		lam: (g) =>
			ghi(g, TAI_LIEU.tep.envViDu, (c) =>
				c.replace(/^#?\s*OKR_AGENT_URL=.*$/m, ""),
			),
	},
	{
		ten: "turbo-goc",
		ghim: "thieu nha: turbo globalPassThroughEnv OKR_AGENT_URL",
		lam: (g) =>
			ghiJson(g, TAI_LIEU.tep.turbo, (t) => {
				t.globalPassThroughEnv = t.globalPassThroughEnv.filter(
					(b) => b !== "OKR_AGENT_URL",
				);
			}),
	},
	{
		ten: "turbo-app",
		ghim: "thieu nha: apps/app/turbo.json dev.passThroughEnv OKR_AGENT_BRIDGE_SECRET",
		lam: (g) =>
			ghiJson(g, TAI_LIEU.tep.turboApp, (t) => {
				t.tasks.dev.passThroughEnv = t.tasks.dev.passThroughEnv.filter(
					(b) => b !== "OKR_AGENT_BRIDGE_SECRET",
				);
			}),
	},
	{
		ten: "bi-mat-trong-env",
		ghim: "bi mat nam trong env: OKR_AGENT_BRIDGE_SECRET",
		lam: (g) =>
			ghiJson(g, TAI_LIEU.tep.turboOkr, (t) => {
				t.tasks.build.env = [
					...(t.tasks.build.env ?? []),
					"OKR_AGENT_BRIDGE_SECRET",
				];
			}),
	},
	{
		ten: "environment-md",
		ghim: "docs/environment.md thieu OKR_AGENT_BRIDGE_SECRET",
		lam: (g) =>
			ghi(g, TAI_LIEU.tep.env, (c) =>
				c.replaceAll("`OKR_AGENT_BRIDGE_SECRET`", "OKR_AGENT_BRIDGE_SECRET"),
			),
	},
	{
		ten: "setup-phien-do",
		ghim: "docs/setup.md muc phien do khong nhac apps/agent-okr",
		lam: (g) =>
			ghi(g, TAI_LIEU.tep.setup, (c) => {
				const doan = mucTieuDe(c, TAI_LIEU.muc.phienDo);
				return c.replace(doan, doan.replaceAll("apps/agent-okr", "apps/agent"));
			}),
	},
	{
		ten: "lo-trinh-thieu-dong",
		ghim: `lo-trinh-okr.md muc 10 thieu dong ${TAI_LIEU.slug}`,
		lam: (g) =>
			ghi(g, TAI_LIEU.tep.loTrinh, (c) => {
				const doan = mucTieuDe(c, TAI_LIEU.muc.theoDoi);
				const moi = doan
					.split("\n")
					.map((d) =>
						hangLoTrinh().test(d)
							? d.replace(`\`${TAI_LIEU.slug}\``, `\`${TAI_LIEU.slug}-x\``)
							: d,
					)
					.join("\n");
				return c.replace(doan, moi);
			}),
	},
	{
		ten: "lo-trinh-trang-thai",
		ghim: "lo-trinh-okr.md trang thai la: đang làm dở",
		lam: (g) =>
			ghi(g, TAI_LIEU.tep.loTrinh, (c) => {
				const doan = mucTieuDe(c, TAI_LIEU.muc.theoDoi);
				const moi = doan.replace(
					/^\| --- \|.*$/m,
					(d) =>
						`${d}\n| 99 | \`${TAI_LIEU.slug}\` | đang làm dở | 2026-10-01 | — | thu |`,
				);
				return c.replace(doan, moi);
			}),
	},
	{
		ten: "chu-thich",
		ghim: "chu thich moi: apps/agent-okr/agent/agent.ts:",
		lam: (g) =>
			ghi(
				g,
				"apps/agent-okr/agent/agent.ts",
				(c) => `${c}const thu = 1; // thu\n`,
			),
	},
	{
		ten: "kieu-long",
		ghim: "kieu long Record<string, unknown>: packages/validation/src/okr-cuoc-soan.ts:",
		lam: (g) =>
			ghi(
				g,
				"packages/validation/src/okr-cuoc-soan.ts",
				(c) => `${c}export type Thu = Record<string, unknown>;\n`,
			),
	},
	{
		ten: "client-nhap-db",
		ghim: "client nhap goi may chu: apps/app/app/(app)/[slug]/okr/soan/bang-nhap.tsx:",
		lam: (g) =>
			ghi(
				g,
				"apps/app/app/(app)/[slug]/okr/soan/bang-nhap.tsx",
				chenSau('"use client";\n', 'import { db } from "@crm/db";\n'),
			),
	},
	{
		ten: "api-goi-model",
		ghim: "api goi model: apps/api/src/okr/soan.service.ts:",
		lam: (g) =>
			ghi(
				g,
				"apps/api/src/okr/soan.service.ts",
				(c) => `import { generateText } from "ai";\n${c}`,
			),
	},
	{
		ten: "nhap-cheo",
		ghim: "nhap cheo apps/agent: apps/agent-okr/agent/lib/config.ts:",
		lam: (g) =>
			ghi(
				g,
				"apps/agent-okr/agent/lib/config.ts",
				(c) => `import { x } from "../../../agent/agent/lib/okr/config";\n${c}`,
			),
	},
	{
		ten: "nhap-cheo-thu-muc-tran",
		ghim: "nhap cheo apps/agent: apps/agent-okr/agent/lib/config.ts:1",
		lam: (g) =>
			ghi(
				g,
				"apps/agent-okr/agent/lib/config.ts",
				(c) => `import agent from "../../../agent";\n${c}`,
			),
	},
	{
		ten: "suite-thieu-goi",
		ghim: `goi thieu trong suite: ${TAI_LIEU.suite.goiThu.ten}`,
		lam: (g) => {
			const { thuMuc, ten } = TAI_LIEU.suite.goiThu;
			mkdirSync(join(g, thuMuc), { recursive: true });
			writeFileSync(
				join(g, thuMuc, "package.json"),
				JSON.stringify({ name: ten, scripts: { test: "bun test" } }),
			);
		},
	},
	{
		ten: "suite-lap-goi",
		ghim: `goi lap trong suite: ${TAI_LIEU.suite.lenhLap.them}`,
		lam: (g) =>
			ghi(g, TAI_LIEU.suite.config, (c) =>
				c.replace(
					new RegExp(`^( {4}${TAI_LIEU.suite.lenhLap.khoa}: '[^'\\n]*)'$`, "m"),
					`$1 --filter=${TAI_LIEU.suite.lenhLap.them}'`,
				),
			),
	},
	{
		ten: "thieu-tep",
		ghim: `KHONG DO DUOC: thieu tep: ${TAI_LIEU.tep.setup}`,
		ma: 2,
		lam: (g) => rmSync(join(g, TAI_LIEU.tep.setup)),
	},
];

function tepNguon() {
	const tep = [
		...Object.values(TAI_LIEU.tep),
		...tepAiElements(GOC).map((t) => `${TAI_LIEU.soChatUi.thuMuc}/${t}`),
		TAI_LIEU.suite.config,
		...tepGoi(GOC),
		...tapTep(GOC, [
			...TAI_LIEU.vung.moi,
			...TAI_LIEU.vung.api,
			...TAI_LIEU.vung.agentOkr,
		]),
	];
	for (const t of tep)
		if (!existsSync(join(GOC, t))) khongDo(`thieu tep: ${t}`);
	return [...new Set(tep)];
}

function banSao(tep) {
	const tam = mkdtempSync(join(tmpdir(), TAI_LIEU.tienToTam));
	try {
		for (const t of tep) {
			mkdirSync(dirname(join(tam, t)), { recursive: true });
			cpSync(join(GOC, t), join(tam, t));
		}
	} catch (e) {
		rmSync(tam, { recursive: true, force: true });
		throw e;
	}
	return tam;
}

function chieuDo(inRa) {
	const tep = tepNguon();
	let bat = 0;
	for (const ca of PHA) {
		let tam;
		try {
			tam = banSao(tep);
			try {
				ca.lam(tam);
			} catch (e) {
				if (!(e instanceof KhongDo)) throw e;
				inRa(`SAI pha-${ca.ten}: ${e.message}`);
				continue;
			}
			const r = spawnSync(process.execPath, [TEP, "--goc", tam], {
				encoding: "utf8",
			});
			const dong = (r.stdout ?? "").split("\n");
			const ghim = ca.ghimTheo ? ca.ghimTheo(GOC) : ca.ghim;
			const trung = dong.find((d) => d.startsWith(ghim));
			const dung = r.status === (ca.ma ?? 1) && trung !== undefined;
			if (dung) bat += 1;
			inRa(
				dung
					? `DUNG pha-${ca.ten}: exit ${r.status} · ${trung}`
					: `SAI pha-${ca.ten}: exit ${r.status} · KHONG BAT «${ghim}» (${dong.filter(Boolean).slice(-3).join(" | ")})`,
			);
		} finally {
			if (tam) rmSync(tam, { recursive: true, force: true });
		}
	}
	return bat;
}

function chayGoc(duong) {
	const loi = kiemTinh(duong);
	for (const l of loi) console.log(l);
	return loi.length === 0 ? 0 : 1;
}

function chayThat() {
	const loi = [...kiemTinh(GOC), ...kiemRelease()];
	for (const l of loi) console.log(l);
	if (loi.length > 0) {
		console.log(`tai-lieu: ${loi.length} loi`);
		return 1;
	}
	console.log(
		`tai-lieu: du ${TAI_LIEU.muc.context.length} muc tu dien, ${thuTucTuRouter(GOC).size} thu tuc soan*, 4 nha cho ${TAI_LIEU.bien.length} bien, so AI Elements ${tepAiElements(GOC).length} tep, phien do, lo trinh, ${TAI_LIEU.tepHang.length} tep hang; ${tepMa(GOC, TAI_LIEU.vung.moi).length} tep moi khong chu thich va khong Record<string, unknown>, client khong nhap @crm/db/@crm/auth, apps/api khong goi model, ${tapTep(GOC, TAI_LIEU.vung.agentOkr).length} tep apps/agent-okr khong nhap cheo, ${goiCoTest(GOC).length} goi co test deu nam dung mot lan trong ${lenhSuite(GOC).length} lenh suite.`,
	);
	return 0;
}

function main() {
	const [, , cheDo, duong] = process.argv;
	try {
		if (cheDo === "--goc") return chayGoc(duong);
		if (cheDo === "--pha") {
			const bat = chieuDo((d) => console.log(d));
			console.log(
				`KET LUAN pha: bat ${bat}/${PHA.length} — ma thoat ${bat === PHA.length ? 0 : 1}`,
			);
			return bat === PHA.length ? 0 : 1;
		}
		const that = chayThat();
		const bat = chieuDo((d) => console.log(`chieu do -> ${d}`));
		const duPha = bat === PHA.length;
		console.log(
			duPha
				? `doi chung: do dung ${bat}/${PHA.length}`
				: `doi chung: SAI — chieu do chi bat ${bat}/${PHA.length}`,
		);
		const ma = that !== 0 || !duPha ? 1 : 0;
		console.log(
			`KET LUAN: that ${that === 0 ? "xanh" : "do"}, chieu do ${bat}/${PHA.length} — ma thoat ${ma}`,
		);
		return ma;
	} catch (e) {
		if (!(e instanceof KhongDo)) throw e;
		console.log(`KHONG DO DUOC: ${e.message}`);
		return 2;
	}
}

process.exit(main());
