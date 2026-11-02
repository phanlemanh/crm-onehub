"use client";

import { useLocale } from "@crm/ui/components/locale-provider";
import { useQuery } from "@tanstack/react-query";
import {
	HienThiTruong,
	type MoTaTruong,
	OTruongPhieu,
} from "@/components/crm/fields/kieu-truong";
import type { Owner } from "@/components/crm/owner-cell";
import {
	DetailSheetProperties,
	DetailSheetProperty,
	DetailSheetSection,
} from "@/components/detail-sheet";
import { okrMessages } from "@/lib/messages/okr";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import { nhanTruongOkr, useLuuTruongOkr } from "./luu-truong-okr";
import { suaTaiChoKr, suaTaiChoMucTieu } from "./quyen-muc-tieu";
import { truongKr, truongMucTieu } from "./truong-okr";

type ChiTiet = RouterOutputs["okr"]["objective"];
type KrCuaMt = ChiTiet["keyResults"][number];

const coAnh = (n: { id: string; name: string; email: string }): Owner => ({
	...n,
	image: null,
});

function DongChiDoc({ moTa }: { moTa: MoTaTruong }) {
	return (
		<DetailSheetProperty label={moTa.nhan} wide={moTa.kieu === "LONG_TEXT"}>
			<span className="wrap-anywhere" data-truong={moTa.khoa} translate="no">
				<HienThiTruong
					giaTri={moTa.giaTri}
					kieu={moTa.kieu}
					nguoi={moTa.nguoi}
					nguoiDung={moTa.nguoiDung}
				/>
			</span>
		</DetailSheetProperty>
	);
}

function CacTruong({
	truong,
	suaDuoc,
}: {
	truong: MoTaTruong[];
	suaDuoc: (moTa: MoTaTruong) => boolean;
}) {
	const chiDoc = truong.filter((t) => !suaDuoc(t));
	return (
		<>
			{truong.filter(suaDuoc).map((t) => (
				<OTruongPhieu key={t.khoa} moTa={t} />
			))}
			{chiDoc.length > 0 ? (
				<DetailSheetProperties columns={1}>
					{chiDoc.map((t) => (
						<DongChiDoc key={t.khoa} moTa={t} />
					))}
				</DetailSheetProperties>
			) : null}
		</>
	);
}

export function KhuChiTietMucTieu({ mt }: { mt: ChiTiet }) {
	const locale = useLocale();
	const nhan = nhanTruongOkr(locale);
	const tieuDe = okrMessages(locale).sheet.khuChiTiet;
	const trpc = useTRPC();
	const suaDuoc = suaTaiChoMucTieu(mt);
	const nguoiDung = useQuery({
		...trpc.users.list.queryOptions(),
		enabled: suaDuoc,
	});
	const { luu, dangLuu } = useLuuTruongOkr({
		loai: "muc-tieu",
		id: mt.id,
		objectiveId: mt.id,
		giaTriCu: { title: mt.title, whyNow: mt.whyNow, ownerUserId: mt.owner.id },
	});
	const truong = truongMucTieu(
		{ title: mt.title, whyNow: mt.whyNow, owner: coAnh(mt.owner) },
		{ nhan, nguoiDung: nguoiDung.data, luu, dangLuu },
	);
	return (
		<div data-khu="chi-tiet">
			<DetailSheetSection title={tieuDe}>
				<CacTruong suaDuoc={() => suaDuoc} truong={truong} />
			</DetailSheetSection>
		</div>
	);
}

export function TruongTaiChoKr({
	mt,
	kr,
	nguoiDung,
}: {
	mt: ChiTiet;
	kr: KrCuaMt;
	nguoiDung: Owner[] | undefined;
}) {
	const nhan = nhanTruongOkr(useLocale());
	const quyen = suaTaiChoKr(mt, kr);
	const { luu, dangLuu } = useLuuTruongOkr({
		loai: "kr",
		id: kr.id,
		objectiveId: mt.id,
		giaTriCu: { title: kr.title, ownerUserId: kr.owner.id },
	});
	const truong = truongKr(
		{ title: kr.title, owner: coAnh(kr.owner) },
		{ nhan, nguoiDung, luu, dangLuu, suaNguoi: true },
	);
	return (
		<CacTruong
			suaDuoc={(t) => (t.kieu === "USER" ? quyen.nguoi : quyen.ten)}
			truong={truong}
		/>
	);
}
