import { db } from "../../../packages/db/src/index.ts";

const CHE_DO = process.argv[2];
const RUN = process.env.TEST_RUN_ID ?? "";
const LE = `vvc-le-${RUN}`;

const GIEO = {
	caNhan: "Ca nhan-",
	congTy: "Cong ty-",
	nguoi: "Nguoi thu nghiem",
	boPhan: "Bo phan-",
} as const;

function dung(ma: number, dong: string): never {
	console.error(dong);
	process.exit(ma);
}

async function dungCoSo(): Promise<void> {
	const [hang] = await db.$queryRaw<
		{ ten: string }[]
	>`select current_database() as ten`;
	const ten = hang?.ten ?? "";
	if (!RUN || !ten.endsWith("_test") || !ten.includes(RUN)) {
		dung(
			2,
			`dang doc nham co so du lieu: ${ten || "(khong ro)"} khong phai co so du lieu cua luot TEST_RUN_ID=${RUN || "(trong)"}`,
		);
	}
	console.log(`co so du lieu: ${ten}`);
}

async function dieuPhoi(): Promise<void> {
	const [caNhan, congTy, nguoi, boPhan] = await Promise.all([
		db.contact.count({ where: { firstName: { startsWith: GIEO.caNhan } } }),
		db.company.count({ where: { name: { startsWith: GIEO.congTy } } }),
		db.user.count({ where: { name: GIEO.nguoi } }),
		db.department.count({ where: { name: { startsWith: GIEO.boPhan } } }),
	]);
	const dem = `ca nhan=${caNhan} cong ty=${congTy} nguoi=${nguoi} bo phan=${boPhan}`;
	if (caNhan + congTy + nguoi + boPhan > 0) {
		dung(1, `con sot sau dieu-phoi: ${dem}`);
	}
	console.log(`sach sau dieu-phoi: ${dem}`);
}

async function gieoLe(): Promise<void> {
	const le = await db.contact.create({ data: { firstName: LE } });
	console.log(`da gieo lien he le ${le.id}`);
}

async function sauDangNhap(): Promise<void> {
	const le = await db.contact.findFirst({
		where: { firstName: LE },
		select: { id: true, enrichmentStatus: true },
	});
	if (!le || le.enrichmentStatus !== "PENDING") {
		dung(1, "khong thay lien he le — phep do mo");
	}
	const viec = await db.agentTask.findMany({
		where: { contactId: le.id },
		select: { kind: true },
	});
	if (viec.length > 0) {
		dung(
			1,
			`dang nhap trong go-la-cat-quyen van xep viec cho lien he le: ${viec.map((v) => v.kind).join(", ")}`,
		);
	}
	console.log(`lien he le ${le.id} con nguyen, 0 dong viec`);
}

async function caGoi(): Promise<void> {
	const [moc] = await db.$queryRaw<
		{ so: bigint }[]
	>`select count(*) as so from "_prisma_migrations"`;
	if (!moc || moc.so < 1n) dung(1, "phep do mo: khong thay _prisma_migrations");

	const le = await db.contact.findFirst({
		where: { firstName: LE },
		select: { id: true, enrichmentStatus: true },
	});
	if (!le || le.enrichmentStatus !== "PENDING") {
		dung(1, "khong thay lien he le — phep do mo");
	}

	const moiTrangThai = await db.agentTask.groupBy({
		by: ["kind"],
		_count: true,
	});
	console.log(
		`agentTask moi trang thai: ${JSON.stringify(moiTrangThai.map((r) => [r.kind, r._count]))}`,
	);

	const [chuaXong, lienHe, congTy] = await Promise.all([
		db.agentTask.findMany({
			where: { finishedAt: null },
			select: { kind: true, contactId: true, companyId: true },
		}),
		db.contact.findMany({
			where: { id: { not: le.id } },
			select: { firstName: true },
		}),
		db.company.findMany({ select: { name: true } }),
	]);
	const choLe = chuaXong.filter((v) => v.contactId === le.id).length;
	const dem = `agentTask chua xong=${chuaXong.length} (cua lien he le=${choLe}) lien he=${lienHe.length} cong ty=${congTy.length}`;
	if (chuaXong.length + lienHe.length + congTy.length > 0) {
		dung(
			1,
			[
				`goi api de lai hang: ${dem}`,
				`viec: ${JSON.stringify(chuaXong.slice(0, 20))}`,
				`lien he: ${lienHe
					.slice(0, 20)
					.map((c) => c.firstName)
					.join(", ")}`,
				`cong ty: ${congTy
					.slice(0, 20)
					.map((c) => c.name)
					.join(", ")}`,
			].join("\n"),
		);
	}
	console.log(`goi api sach: ${dem}; lien he le ${le.id} con nguyen`);
}

const VIEC = {
	"dieu-phoi": dieuPhoi,
	"gieo-le": gieoLe,
	"sau-dang-nhap": sauDangNhap,
	"ca-goi": caGoi,
} satisfies Record<string, () => Promise<void>>;

function laCheDo(ten: string | undefined): ten is keyof typeof VIEC {
	return ten !== undefined && Object.hasOwn(VIEC, ten);
}

const chay = laCheDo(CHE_DO) ? VIEC[CHE_DO] : undefined;
if (!chay) dung(2, `che do khong biet: ${CHE_DO ?? "(trong)"}`);

await dungCoSo();
await chay();
await db.$disconnect();
