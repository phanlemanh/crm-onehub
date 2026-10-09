const HO_SO = "khung-loi-ban-ghi-dung-ly-do";
const CHIEU_DO = process.argv.includes("--chieu-do");

if (!process.env.PHIEN_DO || !process.env.API_URL) {
	console.log(
		`KHONG DO DUOC: chay qua phien do — bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/${HO_SO}/rang/ma-that.mjs"`,
	);
	process.exit(2);
}

const { MA, moDo } = await import("../../kho-tai-lieu/rang/man-lib.mjs");

const d = await moDo();

function idGia(that) {
	const duoi = MA.replace(/[^a-z0-9]/g, "").padEnd(6, "0");
	return `${that.slice(0, that.length - duoi.length)}${duoi}`;
}

async function maLoi(cookie, duong, vao) {
	const r = await fetch(
		`${d.API}/api/trpc/${duong}?input=${encodeURIComponent(JSON.stringify(vao))}`,
		{ headers: { Cookie: `${cookie.ten}=${cookie.gia}; lang=vi` } },
	);
	const than = await r.json().catch(() => null);
	const loi = than?.error?.json ?? than?.error ?? null;
	return {
		http: r.status,
		ma: loi?.data?.code ?? null,
		coDuLieu: Boolean(than?.result),
	};
}

try {
	const chu = await d.nguoiMoi("klgchu", "owner", "Phan Kiểm Mã");
	const la = await d.nguoiMoi("klgla", "member", "Người Ngoài Kiểm");

	const caNhan = await d.db.contact.create({
		data: { firstName: "Mã", lastName: `Thật ${MA}` },
		select: { id: true },
	});
	const congTy = await d.db.company.create({
		data: { name: `Công ty mã thật ${MA}` },
		select: { id: true },
	});

	const bang = [];
	const ghi = (duong, vao, mong, kq) => {
		bang.push({ duong, mong, ...kq });
		console.log(
			`  ${duong} ${JSON.stringify(vao)} -> http ${kq.http} ma ${kq.ma} (mong ${mong})`,
		);
	};

	await d.chayBuoc(1, async () => {
		const ca = [
			["contacts.byId", { id: CHIEU_DO ? caNhan.id : idGia(caNhan.id) }],
			["companies.byId", { id: idGia(congTy.id) }],
			["deals.byId", { id: idGia(caNhan.id) }],
			["onboarding.planById", { id: idGia(caNhan.id) }],
		];
		const sai = [];
		for (const [duong, vao] of ca) {
			const kq = await maLoi(chu.cookie, duong, vao);
			ghi(duong, vao, "NOT_FOUND", kq);
			if (kq.coDuLieu && kq.ma === null)
				sai.push(`ma-that: khong con nhung tra du lieu (${duong})`);
			else if (kq.ma !== "NOT_FOUND") sai.push(`${duong} tra ${kq.ma}`);
		}
		const keHoach = await maLoi(chu.cookie, "onboarding.plansOfCompany", {
			companyId: idGia(congTy.id),
		});
		console.log(
			`  onboarding.plansOfCompany (cong ty khong ton tai) -> http ${keHoach.http} ma ${keHoach.ma} du lieu ${keHoach.coDuLieu} (ghi lai, AC-4 doc so nay)`,
		);
		if (sai.length > 0) for (const s of sai) console.log(`  SAI ${s}`);
		d.dat(1, sai.length === 0, sai.join(" · "));
	});

	await d.chayBuoc(2, async () => {
		await d.db.member.deleteMany({ where: { userId: la.id } });
		const kq = await maLoi(la.cookie, "contacts.byId", { id: caNhan.id });
		ghi("contacts.byId (nguoi ngoai)", { id: caNhan.id }, "FORBIDDEN", kq);
		d.dat(
			2,
			kq.ma === "FORBIDDEN",
			`nguoi khong thuoc workspace nhan ${kq.ma} (http ${kq.http})`,
		);
	});

	console.log(`  bang ${bang.length} thu tuc da doc ma that`);
	await d.ket(`${HO_SO} ma-that`);
} catch (e) {
	await d.khongDoDuoc(e);
}
