import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { GOC, LUAT_KHO } from "./luat-kho-cau-hinh.mjs";
import { baoNhap, ghiQuaDb, moDun, nguonNhap } from "./luat-kho-lan-theo.mjs";

function git(...thamSo) {
	return execFileSync("git", ["-C", GOC, ...thamSo], {
		encoding: "utf8",
		maxBuffer: 64 * 1024 * 1024,
	});
}

const khop = (tep, ds) => ds.some((m) => m.test(tep));

function tepDoi(nen) {
	return git(
		"diff",
		"--name-only",
		"--diff-filter=AM",
		nen,
		"HEAD",
		"--",
		...LUAT_KHO.vung,
	)
		.split("\n")
		.filter(Boolean)
		.filter((t) => !khop(t, LUAT_KHO.boQua));
}

function dongThem(nen, tep) {
	const ra = [];
	let so = 0;
	for (const d of git("diff", "-U0", nen, "HEAD", "--", tep).split("\n")) {
		const h = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/.exec(d);
		if (h) {
			so = Number(h[1]);
			continue;
		}
		if (d.startsWith("+++")) continue;
		if (d.startsWith("+")) {
			ra.push({ tep, so, chu: d.slice(1) });
			so += 1;
		}
	}
	return ra;
}

const dongIn = (d) => `${d.tep}:${d.so}: ${d.chu.trim()}`;

function khoi(ds) {
	if (ds.length === 0) return "(rỗng)";
	const cat = ds.slice(0, LUAT_KHO.cat);
	const them =
		ds.length > cat.length ? [`… cắt, còn ${ds.length - cat.length} dòng`] : [];
	return [...cat, ...them].join("\n");
}

function muc(tieuDe, lenh, ketQua, ketLuan, them = []) {
	return [
		`## ${tieuDe}`,
		"",
		"Lệnh:",
		"",
		"```",
		...lenh,
		"```",
		"",
		"Kết quả:",
		"",
		"```",
		ketQua,
		"```",
		"",
		`Kết luận: ${ketLuan}`,
		"",
		...them.flatMap((d) => [d, ""]),
	].join("\n");
}

function sh(lenh) {
	const r = spawnSync("bash", ["-c", lenh], {
		cwd: GOC,
		encoding: "utf8",
		maxBuffer: 64 * 1024 * 1024,
	});
	return { ma: r.status, ra: `${r.stdout}` };
}

function kiemCheoChuThich(nen) {
	const k = LUAT_KHO.kiemCheo;
	const tho = `git diff -U0 ${nen} HEAD -- apps packages ${k.loc} | grep -E ${k.mau}`;
	const loc = `${tho} | grep -vE ${k.boUrl}`;
	const doiChung = `printf '%s\\n' '${k.doiChung}' | grep -cE ${k.mau}`;
	const a = sh(tho);
	const b = sh(loc);
	const c = sh(doiChung);
	const soDong = (x) => x.ra.split("\n").filter(Boolean).length;
	return {
		lenh: [tho, loc, doiChung],
		ketQua: [
			`$ ${tho}`,
			a.ra.trim() === ""
				? `(không in dòng nào; grep thoát ${a.ma})`
				: a.ra.trimEnd(),
			`$ ${loc}`,
			b.ra.trim() === ""
				? `(không in dòng nào; grep thoát ${b.ma})`
				: b.ra.trimEnd(),
			`$ ${doiChung}`,
			c.ra.trimEnd(),
		].join("\n"),
		soTho: soDong(a),
		soLoc: soDong(b),
		doiChungBat: c.ra.trim() === "1",
	};
}

function mucChuThich(nen, them) {
	const trung = them.filter((d) =>
		LUAT_KHO.chuThich.test(d.chu.replace(LUAT_KHO.url, "")),
	);
	const kc = kiemCheoChuThich(nen);
	return muc(
		"1. Chú thích trong dòng thêm",
		[
			`git diff -U0 ${nen.slice(0, 12)} HEAD -- apps packages   (bỏ ${LUAT_KHO.boQua.map(String).join(" ")})`,
			"lọc dòng «+» chứa // hoặc /* sau khi bỏ chuỗi URL (scheme://…)",
		],
		trung.length === 0 ? "0 dòng" : khoi(trung.map(dongIn)),
		trung.length === 0
			? "không dòng thêm nào mang chú thích."
			: `${trung.length} dòng khớp mẫu — đọc từng dòng: chuỗi hay regex chứa // không phải chú thích.`,
		[
			"### Kiểm chéo độc lập với bộ lọc của luat-kho.mjs",
			"Ba lệnh shell dưới đây chạy nguyên văn qua `bash -c` (không qua hàm lọc JS ở trên); kết quả dán nguyên văn. Lệnh thứ ba là đối chứng: cùng mẫu grep phải bắt một dòng thêm có chú thích.",
			["```", kc.ketQua, "```"].join("\n"),
			kc.doiChungBat && kc.soLoc === trung.length
				? `Kiểm chéo: ${kc.soTho} dòng trước khi bỏ URL, ${kc.soLoc} sau — khớp ${trung.length} dòng của bộ lọc JS; đối chứng bắt được dòng có chú thích.`
				: `Kiểm chéo LỆCH: grep ${kc.soLoc} dòng, bộ lọc JS ${trung.length} dòng, đối chứng ${kc.doiChungBat ? "bắt" : "KHÔNG bắt"} — đọc tay.`,
		],
	);
}

function tepApi(nen) {
	return git(
		"diff",
		"--name-only",
		"--diff-filter=AM",
		nen,
		"HEAD",
		"--",
		LUAT_KHO.api,
	)
		.split("\n")
		.filter(Boolean)
		.filter((t) => !khop(t, LUAT_KHO.boQua));
}

function mucNest(nen) {
	const ds = tepApi(nen).map((tep) => {
		const noiDung = readFileSync(join(GOC, tep), "utf8");
		const nhap = nguonNhap(noiDung);
		return {
			tep,
			nhap,
			vendor: nhap.filter((n) => LUAT_KHO.nguonVendor.test(n)),
			them: dongThem(nen, tep).filter((d) => LUAT_KHO.goiMoHinh.test(d.chu)),
			toan: noiDung
				.split("\n")
				.map((chu, k) => ({ tep, so: k + 1, chu }))
				.filter((d) => LUAT_KHO.goiMoHinh.test(d.chu)),
		};
	});
	const ketQua = ds.flatMap((d) => [
		`# ${d.tep}`,
		`nguồn nhập: ${d.nhap.join(", ")}`,
		`nguồn SDK AI hay vendor: ${d.vendor.length === 0 ? "0" : d.vendor.join(", ")}`,
		`dòng thêm khớp lời gọi model/vendor: ${d.them.length === 0 ? "0" : d.them.map(dongIn).join(" | ")}`,
		`cả tệp khớp: ${d.toan.length === 0 ? "0" : d.toan.map(dongIn).join(" | ")}`,
	]);
	const soThem = ds.reduce((s, d) => s + d.them.length, 0);
	const soVendor = ds.reduce((s, d) => s + d.vendor.length, 0);
	const cu = ds.flatMap((d) => d.toan.filter((t) => !d.them.includes(t)));
	return muc(
		"2. API không gọi model hay vendor",
		[
			`git diff --name-only --diff-filter=AM ${nen.slice(0, 12)} HEAD -- ${LUAT_KHO.api}   (bỏ tệp sinh) → ${ds.length} tệp`,
			`mỗi tệp: nguồn import, đối chiếu ${LUAT_KHO.nguonVendor}; grep -iE '${LUAT_KHO.goiMoHinh.source}' trên dòng thêm và cả tệp`,
		],
		ketQua.join("\n"),
		soThem === 0 && soVendor === 0
			? `${ds.length} tệp apps/api/src của lượt: 0 nguồn SDK AI hay vendor, 0 dòng thêm gọi model/vendor${cu.length === 0 ? "" : `; ${cu.length} dòng khớp mẫu có sẵn từ trước lượt: ${cu.map((t) => `${t.tep}:${t.so}`).join(", ")}`}.`
			: `${soVendor} nguồn SDK AI hay vendor và ${soThem} dòng thêm gọi model/vendor trong ${ds.length} tệp apps/api/src — đọc từng dòng.`,
	);
}

function moHinhCua(dong, k) {
	for (let t = k; t >= 0 && t >= k - LUAT_KHO.ghiPrisma.nhinLui; t -= 1) {
		const m = LUAT_KHO.ghiPrisma.mo.exec(dong[t].trim());
		const ten = m?.[2] ?? m?.[1];
		if (ten && !["then", "catch", "map"].includes(ten)) return ten;
	}
	return null;
}

function mucGhiPrisma(nen, them) {
	const ra = [];
	for (const tep of LUAT_KHO.ghiPrisma.tep) {
		const dong = readFileSync(join(GOC, tep), "utf8").split("\n");
		for (const d of them.filter((x) => x.tep === tep)) {
			const k = d.so - 1;
			const okr = LUAT_KHO.ghiPrisma.quaOkrService.exec(d.chu);
			if (okr) {
				ra.push({ d, loai: "OkrService", chiTiet: `this.okr.${okr[1]}` });
				continue;
			}
			const ham = LUAT_KHO.ghiPrisma.hamGhiAgentTask.find((h) =>
				new RegExp(`\\b${h}\\s*\\(`).test(d.chu),
			);
			if (ham) {
				ra.push({
					d,
					loai: "agentTask",
					chiTiet: `${ham} (@crm/db/okr-tro-ly)`,
				});
				continue;
			}
			if (!LUAT_KHO.ghiPrisma.lenh.test(d.chu)) continue;
			const mo = moHinhCua(dong, k);
			ra.push({
				d,
				loai:
					mo === "agentTask" || mo === "okrDeXuat" ? mo : `khác (${mo ?? "?"})`,
				chiTiet: d.chu.trim(),
			});
		}
	}
	const khac = ra.filter(
		(r) => !["agentTask", "okrDeXuat", "OkrService"].includes(r.loai),
	);
	const coLoai = (l) => ra.filter((r) => r.loai === l).length;
	const db = ghiQuaDb();
	const theoMo = [...Map.groupBy(db.hang, (h) => h.mo)].map(
		([mo, ds]) => `${mo} (${ds.length})`,
	);
	const moLa = db.hang.filter(
		(h) => !["agentTask", "okrDeXuat"].includes(h.mo),
	);
	const quaDb = [
		"### Lần theo hàm @crm/db mà dịch vụ gọi",
		`Mỗi hàm nhập từ @crm/db mà ${LUAT_KHO.ghiDb.goi.map((g) => `${g.tep} (nguồn ${g.nguon})`).join(", ")} gọi: đọc thân hàm trong packages/db/src, đi tiếp vào hàm cùng tệp và hàm nhập tương đối, in mọi lệnh ghi Prisma (\`db.|tx.<mô hình>.<create|update|upsert|delete…>(\`) hay \`$executeRaw\`. Lệnh khớp chữ \`.update(\` mà không phải trên \`db\`/\`tx\` in riêng ở cuối.`,
		[
			"```",
			"nơi gọi · đường hàm · lệnh ghi · mô hình.lệnh · data",
			...db.hang.map(
				(h) =>
					`${h.noiGoi.join(", ")} · ${h.duong.join(" → ")} · ${h.vitri} · ${h.mo}.${h.lenh} · ${h.duLieu ?? "-"}`,
			),
			`# khớp chữ nhưng không phải ghi Prisma: ${db.khong.length}`,
			...db.khong.map((k) => `${k.duong.join(" → ")} · ${k.vitri} · ${k.chu}`),
			"```",
		].join("\n"),
		moLa.length === 0
			? `Qua hàm @crm/db: ${db.hang.length} lệnh ghi — ${theoMo.join(", ")}; không mô hình nào ngoài AgentTask và OkrDeXuat.`
			: `Qua hàm @crm/db: ${moLa.length} lệnh ghi ngoài AgentTask/OkrDeXuat — đọc từng dòng.`,
		LUAT_KHO.phanQuyet.ghiDeXuat,
	];
	return muc(
		"6. Lệnh ghi của API Trợ lý OKR",
		[
			`git diff -U0 ${nen.slice(0, 12)} HEAD -- ${LUAT_KHO.ghiPrisma.tep.join(" ")} | grep -E '^\\+.*\\.(create|update|updateMany|upsert|delete)\\b|executeRaw'`,
			`cộng lời gọi this.okr.*Trong(…) và hàm @crm/db ghi AgentTask (${LUAT_KHO.ghiPrisma.hamGhiAgentTask.join(", ")}); mô hình Prisma tìm ngược tối đa ${LUAT_KHO.ghiPrisma.nhinLui} dòng`,
		],
		ra.length === 0
			? "0 dòng"
			: [
					"tệp:dòng · loại · chi tiết",
					...ra.map((r) => `${r.d.tep}:${r.d.so} · ${r.loai} · ${r.chiTiet}`),
				].join("\n"),
		khac.length === 0
			? `dòng trực tiếp trong hai tệp dịch vụ chỉ ghi AgentTask (${coLoai("agentTask")}), OkrDeXuat (${coLoai("okrDeXuat")}) và qua OkrService (${coLoai("OkrService")}); lần theo hàm @crm/db ở dưới.`
			: `${khac.length} lệnh ghi ngoài AgentTask, OkrDeXuat, OkrService — đọc từng dòng.`,
		quaDb,
	);
}

function hangCauHinh() {
	const nap = LUAT_KHO.tran.cauHinh
		.map(
			(c) =>
				`[${JSON.stringify(c.tep)}, (await import(${JSON.stringify(join(GOC, c.tep))})).${c.ten}]`,
		)
		.join(",");
	const r = spawnSync(
		"bun",
		[
			"-e",
			`const la=(o,p=[],ra=[])=>{if(typeof o==="number")ra.push([p.join("."),o]);else if(o&&typeof o==="object")for(const[k,v]of Object.entries(o))la(v,[...p,k],ra);return ra};const ds=[${nap}];console.log(JSON.stringify(ds.map(([t,o])=>[t,la(o)])))`,
		],
		{ cwd: GOC, encoding: "utf8" },
	);
	if (r.status !== 0)
		throw new Error(
			`luat-kho: khong doc duoc hang cau hinh: ${`${r.stderr}`.trim()}`,
		);
	return new Map(JSON.parse(r.stdout.trim().split("\n").at(-1)));
}

function phanLoaiSo(d, so, giaTri) {
	const truoc = d.chu.slice(0, d.chu.indexOf(so));
	if (LUAT_KHO.tran.khuonZod.test(truoc)) return "khuôn Zod (min/max)";
	if (/["'`][^"'`]*$/.test(truoc)) return "trong chuỗi";
	if (/^\s*(export\s+)?const\s+[A-Z][A-Z0-9_]*\s*=/.test(d.chu))
		return "hằng UPPER_SNAKE đặt tên tại tệp (đơn vị, độ chính xác, phân vị) — đọc tay";
	return giaTri.has(Number(so.replaceAll("_", "")))
		? "trùng giá trị một hằng cấu hình — đọc tay"
		: "số rời — đọc tay";
}

function mucTran(nen, them) {
	const hang = hangCauHinh();
	const tatCa = [...hang.values()].flat();
	const giaTri = new Set(tatCa.map(([, v]) => v));
	const tenLa = new Map();
	for (const [tep, ds] of hang)
		for (const [duong] of ds) {
			const la = duong.split(".").at(-1);
			tenLa.set(la, [...(tenLa.get(la) ?? []), `${tep}#${duong}`]);
		}
	const trung = [...tenLa].filter(
		([, noi]) => new Set(noi.map((n) => n.split("#")[0])).size > 1,
	);
	const tepCauHinh = LUAT_KHO.tran.cauHinh.map((c) => c.tep);
	const nguon = them.filter(
		(d) =>
			!khop(d.tep, LUAT_KHO.laTep.kiem) &&
			!tepCauHinh.includes(d.tep) &&
			/\.(ts|tsx|mjs)$/.test(d.tep),
	);
	const soRoi = nguon.flatMap((d) =>
		[...d.chu.matchAll(LUAT_KHO.tran.soLiteral)]
			.map((m) => m[0])
			.filter((so) => so.replaceAll("_", "").replace(".", "").length >= 2)
			.map((so) => ({ d, so, loai: phanLoaiSo(d, so, giaTri) })),
	);
	const ketQua = [
		...[...hang].flatMap(([tep, ds]) => [
			`# ${tep}: ${ds.length} hằng số`,
			...ds.map(([duong, v]) => `  ${duong} = ${v}`),
		]),
		"",
		`# tên hằng khai ở hơn một tệp cấu hình: ${trung.length}`,
		...trung.map(([la, noi]) => `  ${la}: ${noi.join(", ")}`),
		"",
		`# literal số ≥ 2 chữ số trên dòng thêm của tệp nguồn (ngoài ba tệp cấu hình, tệp kiểm, evals, proto): ${soRoi.length}`,
		"tệp:dòng · số · loại",
		...soRoi
			.slice(0, LUAT_KHO.cat * 2)
			.map((x) => `${x.d.tep}:${x.d.so} · ${x.so} · ${x.loai}`),
	].join("\n");
	const docTay = soRoi.filter((x) => x.loai.endsWith("đọc tay"));
	const bang = docTay.map((x) => ({
		x,
		phan:
			LUAT_KHO.phanLoaiTay.find(
				(p) => p.tep === x.d.tep && p.khop.test(x.d.chu),
			)?.phan ?? null,
	}));
	const chuaPhan = bang.filter((b) => b.phan === null);
	const dongTrung = bang.filter((b) => /TRÙNG/.test(b.phan ?? ""));
	const tt = LUAT_KHO.tran.trungTen;
	const lichSu = git(
		"log",
		`-S${tt.ten}`,
		"--format=%h %ad %s",
		"--date=short",
		"--",
		...tt.tep,
	).trim();
	const trongNen = lichSu
		.split("\n")
		.filter(Boolean)
		.map((d) => d.split(" ")[0])
		.map((h) => ({
			h,
			nen:
				spawnSync("git", ["-C", GOC, "merge-base", "--is-ancestor", h, nen])
					.status === 0,
		}));
	const phanQuyet = [
		"### Phán quyết tay cho các dòng «đọc tay»",
		[
			"```",
			"tệp:dòng · số · phán quyết",
			...bang.map(
				(b) =>
					`${b.x.d.tep}:${b.x.d.so} · ${b.x.so} · ${b.phan ?? "CHƯA PHÂN LOẠI — đọc tay"}`,
			),
			"```",
		].join("\n"),
		chuaPhan.length === 0
			? `${bang.length} dòng «đọc tay» đều có phán quyết (đọc từng dòng ở bảng trên); ${
					dongTrung.length === 0
						? "không dòng nào mang phán quyết TRÙNG — luật «không viết hai lần một đơn vị» của AGENTS.md đạt trên các dòng này."
						: `${dongTrung.length} dòng mang phán quyết TRÙNG (${dongTrung.map((b) => `${b.x.d.tep}:${b.x.d.so}`).join(", ")}) — luật «không viết hai lần» của AGENTS.md chưa đạt, ghi để chủ kho quyết.`
				}`
			: `${chuaPhan.length} dòng «đọc tay» chưa có phán quyết — đọc tay.`,
		`### ${tt.ten} khai ở hai tệp cấu hình`,
		[
			"```",
			`$ git log -S'${tt.ten}' --format='%h %ad %s' --date=short -- ${tt.tep.join(" ")}`,
			lichSu,
			...trongNen.map(
				(t) =>
					`${t.h}: ${t.nen ? `có trong ${nen.slice(0, 12)} (trước lượt này)` : "thêm trong lượt này"}`,
			),
			"```",
		].join("\n"),
		LUAT_KHO.phanQuyet.viSao,
	];
	return muc(
		"3. Hằng tinh chỉnh ở một tệp cấu hình",
		[
			`bun nạp ${LUAT_KHO.tran.cauHinh.map((c) => `${c.ten} (${c.tep})`).join(", ")} và rút mọi giá trị số`,
			`git diff -U0 ${nen.slice(0, 12)} HEAD -- apps packages   rồi quét ${LUAT_KHO.tran.soLiteral} trên dòng thêm của tệp nguồn`,
		],
		ketQua,
		`${tatCa.length} hằng số trong ba tệp cấu hình, ${trung.length === 0 ? "không tên hằng nào khai ở hai tệp" : `${trung.length} tên hằng khai ở hơn một tệp (${trung.map(([la]) => la).join(", ")})`}; ${soRoi.length} literal số ≥ 2 chữ số ở tệp nguồn của lượt — ${[...Map.groupBy(soRoi, (x) => x.loai)].map(([loai, ds]) => `${ds.length} ${loai}`).join("; ")}.`,
		phanQuyet,
	);
}

function mucKieu(nen, them) {
	const trung = them.filter((d) => LUAT_KHO.kieuLong.test(d.chu));
	const nguon = trung.filter((d) => !khop(d.tep, LUAT_KHO.laTep.kiem));
	return muc(
		"4. Record<string, unknown> và as unknown",
		[
			`git diff -U0 ${nen.slice(0, 12)} HEAD -- apps packages`,
			`grep -E '${LUAT_KHO.kieuLong.source}' trên dòng thêm`,
		],
		trung.length === 0 ? "0 dòng" : khoi(trung.map(dongIn)),
		nguon.length === 0
			? `không tệp nguồn nào của lượt thêm Record<string, unknown> hay ép kiểu qua unknown${trung.length > 0 ? `; ${trung.length} dòng nằm ở tệp kiểm (in ở trên)` : ""}.`
			: `${nguon.length} dòng ở tệp nguồn, ${trung.length - nguon.length} ở tệp kiểm — đọc từng dòng.`,
	);
}

function tenUi(noiDung) {
	const ten = new Set();
	for (const m of noiDung.matchAll(
		/import\s*(?:type\s*)?\{([^}]*)\}\s*from\s+"@crm\/ui[^"]*"/g,
	))
		for (const t of m[1].split(","))
			ten.add(
				t
					.trim()
					.replace(/^type\s+/, "")
					.split(/\s+as\s+/)
					.at(-1),
			);
	return ten;
}

function theMo(dong, i) {
	for (let k = i; k >= 0 && k > i - 12; k -= 1) {
		const d = dong[k];
		const tim = [...d.matchAll(/<([A-Za-z][\w.]*)/g)].at(-1);
		if (tim) return tim[1];
	}
	return null;
}

function phanLoai(c) {
	const goc = { viTri: c.viTri, the: c.the, lop: c.lop };
	if (c.lop === null)
		return {
			...goc,
			loai: "?",
			lyDo: "className là biểu thức, không đọc được lớp tĩnh",
		};
	const lop = c.lop.split(/\s+/).filter(Boolean);
	const hinhDang = LUAT_KHO.ui.thanhPhanHinhDang.has(c.the);
	const la = (l) =>
		LUAT_KHO.ui.lopBoCuc.test(l) ||
		(hinhDang && LUAT_KHO.ui.lopHinhDang.test(l));
	const khac = lop.filter((l) => !la(l));
	return khac.length === 0
		? {
				...goc,
				loai: "a",
				lyDo: hinhDang
					? `hình dạng của ${c.the} (chỉ cao/rộng)`
					: "chỉ lớp bố cục",
			}
		: { ...goc, loai: "b", lyDo: `lớp ngoài bố cục: ${khac.join(" ")}` };
}

function mucUi(nen, them) {
	const tep = [...new Set(them.map((d) => d.tep))].filter(
		(t) => t.startsWith(LUAT_KHO.ui.tienTo) && t.endsWith(".tsx"),
	);
	const cls = [];
	const tay = [];
	for (const t of tep) {
		const noiDung = readFileSync(join(GOC, t), "utf8");
		const dong = noiDung.split("\n");
		const ui = tenUi(noiDung);
		const soThem = new Set(them.filter((d) => d.tep === t).map((d) => d.so));
		dong.forEach((d, i) => {
			if (!soThem.has(i + 1)) return;
			if (LUAT_KHO.ui.mauTay.test(d)) tay.push(`${t}:${i + 1}: ${d.trim()}`);
			if (!d.includes("className=")) return;
			const the = theMo(dong, i);
			cls.push({
				dong: `${t}:${i + 1}: <${the ?? "?"}> ${d.trim()}`,
				viTri: `${t}:${i + 1}`,
				the,
				lop: /className="([^"]*)"/.exec(d)?.[1] ?? null,
				ui: the !== null && ui.has(the.split(".")[0]),
			});
		});
	}
	const tren = cls.filter((c) => c.ui);
	const laProto = (c) => khop(c.dong, [/\/proto\//]);
	const trenSp = tren.filter((c) => !laProto(c));
	const phan = trenSp.map(phanLoai);
	const viPham = phan.filter((p) => p.loai !== "a");
	const ketQua = [
		`# tệp apps/app/**/*.tsx của lượt: ${tep.length}`,
		`# className= trên component nhập từ @crm/ui, màn sản phẩm: ${trenSp.length} — bảng phân loại (a = bố cục hay hình dạng hợp lệ, b = đổi màu/góc/khoảng cách/chữ, ? = biểu thức, đọc tay)`,
		"tệp:dòng · thành phần · lớp · loại · lý do",
		...phan.map(
			(p) =>
				`${p.viTri} · <${p.the}> · ${p.lop ?? "(biểu thức)"} · ${p.loai} · ${p.lyDo}`,
		),
		`# className= trên component nhập từ @crm/ui, bản mẫu /proto: ${tren.length - trenSp.length}`,
		...tren.filter(laProto).map((c) => c.dong),
		`# className= trên thẻ HTML hay component cục bộ: ${cls.length - tren.length}`,
		...cls
			.filter((c) => !c.ui)
			.slice(0, LUAT_KHO.cat)
			.map((c) => c.dong),
		`# <table hay divide-y: ${tay.length}`,
		...tay,
	].join("\n");
	return muc(
		"5. className đè component @crm/ui, bảng và danh sách vẽ tay",
		[
			`git diff -U0 ${nen.slice(0, 12)} HEAD -- apps/app   (tệp .tsx)`,
			"trên dòng thêm: grep className=, tìm thẻ mở gần nhất, đối chiếu với tên nhập từ \"@crm/ui…\"; grep -E '<table|divide-y'",
		],
		ketQua,
		viPham.length === 0 && tay.length === 0
			? `màn sản phẩm: ${trenSp.length} className trên component @crm/ui, cả ${trenSp.length} thuộc loại (a) bố cục hay hình dạng; 0 loại (b); không <table> hay divide-y tự dựng. ${tren.length - trenSp.length} chỗ ở bản mẫu /proto nằm ngoài vật, không phân loại.`
			: `màn sản phẩm: ${viPham.length} className loại (b) hay chưa phân loại được trên component @crm/ui (xem bảng), ${tay.length} dòng bảng/danh sách vẽ tay.`,
	);
}

function mucVeTay(nen, them) {
	const trung = them.filter(
		(d) => khop(d.tep, LUAT_KHO.veTay.tep) && LUAT_KHO.veTay.mau.test(d.chu),
	);
	const tep = [...new Set(them.map((d) => d.tep))].filter((t) =>
		khop(t, LUAT_KHO.veTay.tep),
	);
	return muc(
		"7. Dấu hiệu vẽ tay trên màn Trợ lý OKR",
		[
			`git diff -U0 ${nen.slice(0, 12)} HEAD -- ${tep.join(" ")}`,
			`grep -nE '${LUAT_KHO.veTay.mau.source}' trên dòng thêm`,
		],
		[
			`# ${tep.length} tệp`,
			trung.length === 0 ? "0 dòng" : khoi(trung.map(dongIn)),
		].join("\n"),
		trung.length === 0
			? `${tep.length} tệp màn của lượt: không hộp rounded+border tự dựng, không chấm size-2 rounded-full, không navigator.clipboard, không <h1>/<h2> tự đặt.`
			: `${trung.length} dòng khớp dấu hiệu vẽ tay — đọc từng dòng.`,
	);
}

function mucKiemLai() {
	const k = LUAT_KHO.kiemLai;
	const goi = readFileSync(join(GOC, k.goi), "utf8")
		.split("\n")
		.map((chu, i) => ({ tep: k.goi, so: i + 1, chu }))
		.filter((d) => d.chu.includes(k.ham));
	const bao = baoNhap(k.tep);
	const vendor = bao.ngoai.filter((n) => LUAT_KHO.nguonVendor.test(n));
	const long = bao.tep.flatMap((t) =>
		readFileSync(join(GOC, t), "utf8")
			.split("\n")
			.map((chu, i) => ({ tep: t, so: i + 1, chu }))
			.filter((d) => LUAT_KHO.goiMoHinh.test(d.chu)),
	);
	const moHinh = long.filter((d) => k.goiThat.test(d.chu));
	const md = moDun(k.tep);
	const h = md.ham.get(k.chotTen);
	const than = h
		? md.dong
				.slice(h.bat, h.het + 1)
				.map((chu, i) => `${k.tep}:${h.bat + i + 1}: ${chu}`)
		: [`${k.chotTen}: không thấy trong ${k.tep}`];
	return muc(
		`8. API chạy lại ${k.ham} khi đọc troLyDanhSach`,
		[
			`grep -n '${k.ham}' ${k.goi}`,
			`bao đóng import của ${k.tep} (đi theo ./… và @crm/db|@crm/validation qua exports); đối chiếu ${LUAT_KHO.nguonVendor}; grep -iE '${LUAT_KHO.goiMoHinh.source}' trên mọi tệp trong bao, rồi lọc dòng là lời gọi hay import thật`,
			`in thân ${k.chotTen}`,
		],
		[
			...goi.map(dongIn),
			`# tệp trong bao đóng import: ${bao.tep.length}`,
			...bao.tep,
			`# nguồn ngoài kho: ${bao.ngoai.join(", ") || "(không)"}`,
			`# nguồn SDK AI hay vendor: ${vendor.length === 0 ? "0" : vendor.join(", ")}`,
			`# dòng khớp mẫu lỏng '${LUAT_KHO.goiMoHinh.source}': ${long.length === 0 ? "0" : long.map(dongIn).join(" | ")}`,
			`# trong đó là lời gọi hay import thật (${k.goiThat.source}): ${moHinh.length === 0 ? "0" : moHinh.map(dongIn).join(" | ")}`,
			`# thân ${k.chotTen}`,
			...than,
		].join("\n"),
		vendor.length === 0 && moHinh.length === 0
			? `${k.ham} là hàm thuần trong packages/validation: bao đóng import ${bao.tep.length} tệp, nguồn ngoài kho chỉ ${bao.ngoai.join(", ")}; 0 SDK AI hay vendor, 0 lời gọi model hay mạng${long.length > 0 ? ` (${long.length} dòng khớp mẫu lỏng là chữ, không phải lời gọi — in ở trên)` : ""}.`
			: `${vendor.length} nguồn vendor, ${moHinh.length} dòng gọi model trong bao đóng — đọc tay.`,
		[LUAT_KHO.phanQuyet.kiemLai],
	);
}

function main() {
	const nen = git("merge-base", "HEAD", LUAT_KHO.nen).trim();
	const dau = git("rev-parse", "HEAD").trim();
	const tep = tepDoi(nen);
	const them = tep.flatMap((t) => dongThem(nen, t));
	const noiDung = [
		"# Luật kho trên diff của lượt tro-ly-okr-de-xuat",
		"",
		`Sinh bởi \`node _acceptance/tro-ly-okr-de-xuat/rang/luat-kho.mjs\`. So HEAD \`${dau.slice(0, 12)}\` với \`git merge-base HEAD ${LUAT_KHO.nen}\` = \`${nen.slice(0, 12)}\`. ${tep.length} tệp thêm hay sửa dưới apps/ và packages/ (đã bỏ tệp sinh, *.md, *.json), ${them.length} dòng thêm.`,
		"",
		mucChuThich(nen, them),
		mucNest(nen),
		mucTran(nen, them),
		mucKieu(nen, them),
		mucUi(nen, them),
		mucGhiPrisma(nen, them),
		mucVeTay(nen, them),
		mucKiemLai(),
	].join("\n");
	mkdirSync(dirname(LUAT_KHO.ra), { recursive: true });
	writeFileSync(LUAT_KHO.ra, noiDung);
	console.log(
		`luat-kho: ${tep.length} tep, ${them.length} dong them → ${LUAT_KHO.ra.slice(GOC.length + 1)}`,
	);
}

main();
