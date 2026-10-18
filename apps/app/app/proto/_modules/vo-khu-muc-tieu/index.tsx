"use client";

import { STATE, type StateVo } from "./du-lieu";
import { KhungKhu, type NoiDen } from "./khung";
import {
	ManCapNhat,
	ManCuaToi,
	ManLayYKien,
	ManMoiKr,
	ManSucKhoe,
	ManTatCaDonVi,
	ManTrangDonVi,
} from "./man";
import { NganKr, NganMucTieu } from "./ngan";
import { KhungToanVung } from "./so-do";

function Man({ state }: { state: string }) {
	switch (state) {
		case STATE.donVi:
			return <ManTatCaDonVi />;
		case STATE.trangDonVi:
			return <ManTrangDonVi the="okr" />;
		case STATE.hopTuan:
			return <ManTrangDonVi the="hop-tuan" />;
		case STATE.viec:
			return <ManTrangDonVi the="viec" />;
		case STATE.soDoDonVi:
			return <ManTrangDonVi the="so-do" />;
		case STATE.nganMucTieu:
			return (
				<>
					<ManTrangDonVi the="okr" />
					<NganMucTieu />
				</>
			);
		case STATE.nganKr:
			return (
				<>
					<ManTrangDonVi the="okr" />
					<NganKr />
				</>
			);
		case STATE.sucKhoe:
			return <ManSucKhoe />;
		case STATE.moiKr:
			return <ManMoiKr />;
		case STATE.soDo:
			return <KhungToanVung toanMan={false} />;
		case STATE.toanMan:
			return <KhungToanVung toanMan />;
		case STATE.capNhat:
			return <ManCapNhat />;
		case STATE.layYKien:
			return <ManLayYKien />;
		default:
			return <ManCuaToi />;
	}
}

const NOI_CUA = {
	[STATE.cuaToi]: "cua-toi",
	[STATE.donVi]: "tat-ca-don-vi",
	[STATE.trangDonVi]: "don-vi:cskh",
	[STATE.hopTuan]: "don-vi:cskh",
	[STATE.viec]: "don-vi:cskh",
	[STATE.soDoDonVi]: "don-vi:cskh",
	[STATE.nganMucTieu]: "don-vi:cskh",
	[STATE.nganKr]: "don-vi:cskh",
	[STATE.sucKhoe]: "suc-khoe",
	[STATE.moiKr]: "moi-kr",
	[STATE.soDo]: "so-do",
	[STATE.toanMan]: "so-do",
	[STATE.capNhat]: "cap-nhat",
	[STATE.layYKien]: "lay-y-kien",
} satisfies Record<StateVo, NoiDen>;

const CAC_STATE: readonly string[] = Object.values(STATE);

function laState(s: string): s is StateVo {
	return CAC_STATE.includes(s);
}

export function VoKhuMucTieuMau({ state }: { state: string }) {
	return (
		<KhungKhu
			anThanhBen={state === STATE.toanMan}
			dangO={laState(state) ? NOI_CUA[state] : "cua-toi"}
			key={state}
		>
			<Man state={state} />
		</KhungKhu>
	);
}
