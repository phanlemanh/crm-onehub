import { LOAI_VIEC_TOM_TAT_TUAN } from "@crm/db/agent-tasks";
import {
	MA_LOAI_DE_XUAT,
	type MaLoaiDeXuat,
	TRO_LY_OKR_KHOA,
} from "@crm/db/okr-tro-ly-danh-muc";

const SECOND_MS = 1_000;
const MINUTE_MS = 60 * SECOND_MS;
const NGHIN_TOKEN = 1_000;
const MO_HINH = "google/gemini-3.8-flash";
const MO_HINH_JUDGE = "zai/glm-5.2-fast";
const THE = ["onehub:tro-ly-okr"] as const;
const MA_CAM_NG = [
	"chep-cap-tren",
	"noi-ve-nguoi",
	"tu-cam",
] as const satisfies readonly MaLoaiDeXuat[];

export const TRO_LY_OKR = {
	model: MO_HINH,
	moHinhZdr: [MO_HINH, MO_HINH_JUDGE],
	judge: {
		model: MO_HINH_JUDGE,
		modelOptions: {
			providerOptions: {
				gateway: { zeroDataRetention: true, tags: [...THE] },
			},
		},
		nguong: 0.7,
	},
	danhGia: {
		tranUsdMacDinh: 2,
		maCamNg: MA_LOAI_DE_XUAT.filter((ma) =>
			(MA_CAM_NG as readonly string[]).includes(ma),
		),
		env: {
			tongKet: "TDX_TONG_KET",
			tranUsd: "TDX_TRAN_USD",
			thuMucThem: "TDX_THU_MUC_THEM",
		},
	},
	cuaSoNguCanh: 1_048_576,
	tranRaMoiLoiGoi: 2 * NGHIN_TOKEN,
	tranRaTomTatMoiLoiGoi: 8 * NGHIN_TOKEN,
	loaiViecTomTat: LOAI_VIEC_TOM_TAT_TUAN,
	limits: {
		maxInputTokensPerSession: 40 * NGHIN_TOKEN,
		maxOutputTokensPerSession: 16 * NGHIN_TOKEN,
		sessionTimeoutMs: 10 * MINUTE_MS,
	},
	tags: THE,
	brief: "Run one Trợ lý OKR task.",
	chiDanGoc:
		'This session runs one Trợ lý OKR task. Call the tool tro_ly_okr exactly once with the message "run". Do not call any other tool and do not do the work yourself. When it returns, reply "done".',
	tinNhanGoc: "run",
	khoa: TRO_LY_OKR_KHOA,
	timViecCon: { soLan: 8, cachMs: 250 },
	khoaKiemLai: "agent-task:okr-kiem-san-sang",
	congCuChan: {
		tuTao: [
			"archive_field",
			"enrich_company",
			"fetch_contact_photo",
			"find_contact_socials",
			"get_contact_work_history",
			"get_linkedin_profile",
			"identify_contact",
			"list_deals",
			"list_fields",
			"list_outstanding_work",
			"manage_fields",
			"read_company_history",
			"read_crm_history",
			"read_deal_history",
			"record_fact",
			"record_job_change",
			"research_company",
			"research_person",
			"resolve_linkedin_profile",
			"schedule_recheck",
			"search_crm",
			"set_chat_title",
			"set_contact_socials",
			"set_field_value",
			"web_fetch",
			"write_brief",
			"write_workspace_profile",
		],
		coSan: [
			"bash",
			"read_file",
			"write_file",
			"glob",
			"grep",
			"web_search",
			"todo",
			"ask_question",
			"load_skill",
		],
		khongTinhLaCongCu: [
			"agent",
			"okr-chi-tro-ly",
			"zalo-chi-doc",
			"tro-ly-okr-ngoai",
		],
		tuChoi: "Not available in an OKR session. Call tro_ly_okr only.",
	},
	ngoaiPhien: {
		moTa: "OKR assistant. Not available in this conversation: it runs only inside background OKR tasks and returns no OKR figures here.",
		lyDo: "tro_ly_okr runs only inside background OKR tasks, so OKR and key-result figures cannot be read in this conversation. Tell the person, in their language, that they can see OKR and key-result progress in OneHub Center under OKR. Do not say you failed or ask them to try again.",
	},
	ketThuc: {
		daNop: "da-nop",
		hetLease: "hong:het-lease",
		turnFailed: "hong:turn-failed",
		khongNop: "hong:khong-nop",
		payloadHong: "hong:payload",
		chuaCoKhoa: "khong-chay:chua-co-khoa-mo-hinh",
		khongXemDuoc: "khong-chay:khong-xem-duoc",
		phongLuuTru: "khong-chay:phong-luu-tru",
	},
} as const;
