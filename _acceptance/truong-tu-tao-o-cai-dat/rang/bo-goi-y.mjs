import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = process.env.GOC_CAY
	? resolve(process.env.GOC_CAY)
	: resolve(HERE, "../../..");

const CO_DAU =
	/[ăâđêôơưàáạảãèéẹẻẽìíịỉĩòóọỏõùúụủũỳýỵỷỹấầậẩẫắằặẳẵếềệểễốồộổỗớờợởỡứừựửữ]/i;

const BO_CU = [
	"AMER",
	"EMEA",
	"APAC",
	"Enterprise",
	"Mid-Market",
	"SMB",
	"Lead",
	"MQL",
	"SQL",
];

const BANG = [
	["COMPANY", "Loại hình", "SELECT", ["Sàn giao dịch", "Công ty môi giới", "Đại lý phân phối", "Tổ chức tín dụng"]],
	["COMPANY", "Phân khúc chính", "SELECT", ["Căn hộ", "Nhà phố", "Đất nền", "Cho thuê", "Dự án"]],
	["COMPANY", "Quy mô môi giới", "SELECT", ["Dưới 10", "10–50", "50–200", "Trên 200"]],
	["COMPANY", "Mức độ hợp tác", "SELECT", ["Chưa tiếp xúc", "Đang thăm dò", "Đang hợp tác", "Tạm dừng"]],
	["COMPANY", "Nguồn quen", "SELECT", ["Giới thiệu", "Hội thảo", "Tự tìm", "Chiến dịch gọi"]],
	["COMPANY", "Người phụ trách", "USER", null],
	["CONTACT", "Phân khúc chuyên", "SELECT", ["Căn hộ", "Nhà phố", "Đất nền", "Cho thuê", "Dự án"]],
	["CONTACT", "Vai trò trong sàn", "SELECT", ["Chủ sàn", "Trưởng nhóm", "Môi giới", "Trợ lý"]],
	["CONTACT", "Kênh liên lạc quen", "SELECT", ["Zalo", "Điện thoại", "Email", "Facebook"]],
	["CONTACT", "Mức độ hợp tác", "SELECT", ["Chưa tiếp xúc", "Đang thăm dò", "Đang hợp tác", "Tạm dừng"]],
	["CONTACT", "Người phụ trách", "USER", null],
	["DEAL", "Hình thức hợp tác", "SELECT", ["Giới thiệu khách", "Phân phối dự án", "Đồng môi giới", "Cung cấp dữ liệu"]],
	["DEAL", "Nguồn thoả thuận", "SELECT", ["Giới thiệu", "Hội thảo", "Chiến dịch gọi", "Tự tìm"]],
	["DEAL", "Tỷ lệ chia hoa hồng", "NUMBER", null],
	["DEAL", "Người phụ trách", "USER", null],
];

const NHOM = ["COMPANY", "CONTACT", "DEAL"];
const SO_CONG_TY = 6;
const SO_KHOA_BO_CAO = 9;

const loi = [];
function doi(dieu, cau) {
	if (!dieu) loi.push(cau);
}

function tuChoi(vi) {
	console.log(`KHONG DO DUOC: ${vi}`);
	process.exit(2);
}

function ketLuan(ten) {
	if (loi.length === 0) {
		console.log(`DAT ${ten}`);
		process.exit(0);
	}
	console.log(`DO ${ten}`);
	for (const c of loi) console.log(`  - ${c}`);
	process.exit(1);
}

async function napGoiY() {
	const duong = resolve(GOC, "packages/validation/src/field-templates.ts");
	const mod = await import(duong);
	console.log(`nap bo goi y: ${duong}`);
	if (!mod.FIELD_TEMPLATES) tuChoi(`module ${duong} khong xuat FIELD_TEMPLATES`);
	return { duong, bo: mod.FIELD_TEMPLATES };
}

async function napBoCao() {
	const duong = resolve(GOC, "apps/api/src/listings/listings-config.ts");
	const mod = await import(duong);
	console.log(`nap bang bo cao: ${duong}`);
	if (!mod.LISTING) tuChoi(`module ${duong} khong xuat LISTING`);
	return { duong, listing: mod.LISTING };
}

async function napSinhKhoa() {
	const duong = resolve(GOC, "packages/db/src/fields-shape.ts");
	const mod = await import(duong);
	console.log(`nap ham sinh khoa: ${duong}`);
	if (typeof mod.fieldKeyFromLabel !== "function")
		tuChoi(`module ${duong} khong xuat fieldKeyFromLabel`);
	return { duong, sinhKhoa: mod.fieldKeyFromLabel };
}

function cungGoc(a, b) {
	if (!a.startsWith(`${GOC}/`) || !b.startsWith(`${GOC}/`))
		tuChoi(
			`hai module khong cung mot goc cay. goc dang dung: ${GOC}. module mot: ${a}. module hai: ${b}. ` +
				"Do hai cay tron nhau thi moi so do deu vo nghia.",
		);
}

function det(list) {
	return list.flatMap((t) => [t.label, ...(t.options ?? [])]);
}

async function nhomCongTy() {
	const { bo } = await napGoiY();
	const cong_ty = bo.COMPANY ?? [];

	for (const chu of det(cong_ty)) {
		for (const cu of BO_CU) {
			doi(
				!chu.includes(cu),
				`nhom Cong ty con dau vet bo cu: chuoi ${JSON.stringify(cu)} nam trong ${JSON.stringify(chu)}`,
			);
		}
	}

	for (const t of cong_ty) {
		doi(
			CO_DAU.test(t.label),
			`nhan Cong ty ${JSON.stringify(t.label)} khong mang ky tu co dau tieng Viet`,
		);
	}

	doi(
		cong_ty.length === SO_CONG_TY,
		`nhom Cong ty co ${cong_ty.length} goi y, cho dung ${SO_CONG_TY}`,
	);

	ketLuan("nhom-cong-ty");
}

async function baThucThe() {
	const { bo } = await napGoiY();

	doi(
		Object.keys(bo).length === NHOM.length,
		`bo goi y co ${Object.keys(bo).length} nhom, cho dung ${NHOM.length}`,
	);

	for (const ten of NHOM) {
		const list = bo[ten];
		if (!Array.isArray(list)) {
			doi(false, `nhom ${ten} khong co trong bo goi y`);
			continue;
		}

		doi(list.length >= 4, `nhom ${ten} chi co ${list.length} goi y, cho it nhat 4`);

		for (const t of list) {
			doi(
				typeof t.label === "string" && t.label.trim().length > 0,
				`nhom ${ten} co mot goi y khong co nhan`,
			);
			doi(
				CO_DAU.test(t.label ?? ""),
				`nhan ${JSON.stringify(t.label)} cua nhom ${ten} khong mang dau tieng Viet`,
			);
			doi(
				["SELECT", "USER", "NUMBER"].includes(t.type),
				`goi y ${JSON.stringify(t.label)} mang kieu ${JSON.stringify(t.type)}, ngoai ba kieu cho phep`,
			);
			if (t.type === "SELECT") {
				doi(
					(t.options ?? []).length >= 2,
					`goi y ${JSON.stringify(t.label)} kieu SELECT co ${(t.options ?? []).length} lua chon, cho it nhat 2`,
				);
			}
		}
	}

	ketLuan("ba-thuc-the");
}

async function khongTrungBoCao() {
	const goi = await napGoiY();
	const cao = await napBoCao();
	const khoa = await napSinhKhoa();
	cungGoc(goi.duong, cao.duong);
	cungGoc(goi.duong, khoa.duong);

	const khoaBoCao = cao.listing.fields.map((f) => f.key);
	doi(
		khoaBoCao.length === SO_KHOA_BO_CAO,
		`bang bo cao khai ${khoaBoCao.length} khoa, cho dung ${SO_KHOA_BO_CAO}. ` +
			"Bo cao doi so luong thi nguoi phai xem lai bo goi y, khong im lang di qua.",
	);

	const tap = new Set(khoaBoCao);
	for (const [ten, list] of Object.entries(goi.bo)) {
		for (const t of list) {
			const k = khoa.sinhKhoa(t.label);
			doi(
				!tap.has(k),
				`goi y ${JSON.stringify(t.label)} cua nhom ${ten} sinh khoa ${JSON.stringify(k)}, ` +
					"trung dung khoa bo cao da gieo tren Ca nhan",
			);
		}
	}

	ketLuan("khong-trung-bo-cao");
}

function tuDien() {
	const duong = resolve(GOC, "CONTEXT.md");
	const chu = readFileSync(duong, "utf8");
	console.log(`doc tu dien: ${duong}`);

	const dau = chu.indexOf("**Trường**");
	if (dau < 0) {
		doi(false, 'tu dien khong co muc nao mo dau bang "**Trường**"');
		ketLuan("tu-dien");
		return;
	}

	const sau = chu.indexOf("\n\n**", dau);
	const muc = chu.slice(dau, sau < 0 ? chu.length : sau);

	doi(
		muc.includes("_Avoid_"),
		'muc "**Trường**" thieu dong _Avoid_ — moi muc tu dien phai noi ra cac tu can tranh',
	);
	doi(
		muc.includes("Vì sao"),
		'muc "**Trường**" thieu dong "Vì sao" — moi muc tu dien phai noi ly do',
	);
	doi(
		muc.split("\n")[0].trim().length > "**Trường**:".length,
		'muc "**Trường**" khong co nghia nao sau dau hai cham',
	);

	ketLuan("tu-dien");
}

async function bangMuoiLam() {
	const { bo } = await napGoiY();

	const phang = [];
	for (const ten of NHOM) {
		for (const t of bo[ten] ?? []) phang.push([ten, t]);
	}

	doi(
		phang.length === BANG.length,
		`bo goi y co ${phang.length} goi y, bang nguoi ky chot co ${BANG.length}`,
	);

	for (const [ten, nhan, kieu, lua] of BANG) {
		const khop = (bo[ten] ?? []).filter((t) => t.label === nhan);

		if (khop.length !== 1) {
			doi(
				false,
				`bang cho dung mot goi y ${JSON.stringify(nhan)} o nhom ${ten}, bo goi y co ${khop.length}`,
			);
			continue;
		}

		const t = khop[0];
		doi(
			t.type === kieu,
			`goi y ${JSON.stringify(nhan)} mang kieu ${JSON.stringify(t.type)}, bang chot kieu ${JSON.stringify(kieu)}`,
		);

		if (lua === null) {
			doi(
				t.options === undefined,
				`goi y ${JSON.stringify(nhan)} khong duoc co lua chon, bang chot no khong phai kieu danh sach`,
			);
			continue;
		}

		const co = [...(t.options ?? [])];
		doi(
			co.length === lua.length,
			`goi y ${JSON.stringify(nhan)} co ${co.length} lua chon, bang chot ${lua.length}`,
		);
		for (const x of lua) {
			doi(
				co.includes(x),
				`goi y ${JSON.stringify(nhan)} thieu lua chon ${JSON.stringify(x)} ma bang da chot`,
			);
		}
		for (const x of co) {
			doi(
				lua.includes(x),
				`goi y ${JSON.stringify(nhan)} co lua chon ${JSON.stringify(x)} ngoai bang nguoi ky chot`,
			);
		}
		doi(
			co.join("|") === lua.join("|"),
			`goi y ${JSON.stringify(nhan)} co lua chon dung tap nhung SAI THU TU: ${co.join(" · ")} thay vi ${lua.join(" · ")}`,
		);
	}

	const trongBang = new Set(BANG.map(([ten, nhan]) => `${ten}::${nhan}`));
	for (const [ten, t] of phang) {
		doi(
			trongBang.has(`${ten}::${t.label}`),
			`bo goi y co ${JSON.stringify(t.label)} o nhom ${ten}, nam ngoai bang nguoi ky chot`,
		);
	}

	ketLuan("bang-muoi-lam");
}

const CHE_DO = {
	"nhom-cong-ty": nhomCongTy,
	"ba-thuc-the": baThucThe,
	"khong-trung-bo-cao": khongTrungBoCao,
	"tu-dien": tuDien,
	"bang-muoi-lam": bangMuoiLam,
};

const che = process.argv[2];
if (!CHE_DO[che])
	tuChoi(
		`che do ${JSON.stringify(che)} khong co. Cac che do: ${Object.keys(CHE_DO).join(" · ")}`,
	);

await CHE_DO[che]();
