"use client";

import Edit from "@carbon/icons-react/es/Edit";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import { EntityLogo } from "@crm/ui/components/entity-logo";
import { Icon } from "@crm/ui/components/icon";
import Link from "next/link";
import { useState } from "react";
import {
	DetailSheet,
	DetailSheetBody,
	DetailSheetHeader,
	DetailSheetSection,
	DetailSheetStat,
	DetailSheetStats,
	type DetailSheetTab,
	DetailSheetTabs,
} from "@/components/detail-sheet";
import { BangKrMau } from "./bang-kr";
import { GOP_Y, type GopYMau, MUC_TIEU, STATE } from "./du-lieu";
import { BienNhan, DauKara, DeXuatNeo, DiffTen, NhanKara } from "./kara";

type Ket = "nhan" | "bo-qua";
type Quyet = Partial<Record<string, Ket>>;

const VI_SAO =
	"Kara đọc tên, «vì sao lúc này» và 1 KR của Mục tiêu này lúc 09:12 hôm nay. Kara chỉ đọc dữ liệu OKR.";

function chuBienNhan(g: GopYMau, ket: Ket): string {
	if (ket === "bo-qua") return "Đã bỏ qua góp ý của Kara";
	return g.kind === "rewrite"
		? "Đã đổi tên KR theo Kara"
		: "Đã mở KR mới theo góp ý của Kara";
}

function MotGopY({
	g,
	ket,
	quyet,
}: {
	g: GopYMau;
	ket: Ket | undefined;
	quyet: (k: Ket | undefined) => void;
}) {
	if (ket) {
		return (
			<BienNhan
				chu={chuBienNhan(g, ket)}
				daNhan={ket === "nhan"}
				hoanTac={() => quyet(undefined)}
			/>
		);
	}
	if (g.kind === "rewrite") {
		return (
			<DeXuatNeo
				noiDung={<DiffTen truoc={g.truoc ?? ""} sau={g.sau} />}
				lyDo={g.lyDo}
				nut={[
					{
						id: "doi-ten",
						nhan: "Đổi tên KR",
						kieu: "chinh",
						bam: () => quyet("nhan"),
					},
					{ id: "sua", nhan: "Sửa", kieu: "phu", bam: () => undefined },
					{
						id: "bo-qua",
						nhan: "Bỏ qua",
						kieu: "nhe",
						bam: () => quyet("bo-qua"),
					},
				]}
			/>
		);
	}
	return (
		<DeXuatNeo
			noiDung={g.sau}
			nut={[
				{
					id: "them-kr",
					nhan: "Thêm KR đối trọng",
					kieu: "phu",
					bam: () => quyet("nhan"),
				},
				{
					id: "bo-qua",
					nhan: "Bỏ qua",
					kieu: "nhe",
					bam: () => quyet("bo-qua"),
				},
			]}
		/>
	);
}

function TabKr({
	ketCua,
	quyet,
}: {
	ketCua: Quyet;
	quyet: (id: string, k: Ket | undefined) => void;
}) {
	const conCho = GOP_Y.filter((g) => ketCua[g.id] === undefined).length;
	const capMucTieu = GOP_Y.filter((g) => g.krId === null);
	const tenSau = new Map(
		GOP_Y.filter((g) => g.krId !== null && ketCua[g.id] === "nhan").map((g) => [
			g.krId ?? "",
			g.sau,
		]),
	);
	return (
		<DetailSheetBody>
			<DetailSheetSection>
				<NhanKara
					chu={conCho > 0 ? `Kara · ${conCho} góp ý` : "Kara · đã xem hết"}
					viSao={VI_SAO}
				/>
				{capMucTieu.map((g) => (
					<MotGopY
						key={g.id}
						g={g}
						ket={ketCua[g.id]}
						quyet={(k) => quyet(g.id, k)}
					/>
				))}
			</DetailSheetSection>
			<BangKrMau
				keyResults={MUC_TIEU.kr}
				lePhanTram={MUC_TIEU.lePhanTram}
				tenSau={tenSau}
				dauSau={<DauKara chu="theo Kara" />}
				duoiDong={(kr) => {
					const g = GOP_Y.find((x) => x.krId === kr.id);
					return g ? (
						<MotGopY g={g} ket={ketCua[g.id]} quyet={(k) => quyet(g.id, k)} />
					) : null;
				}}
			/>
		</DetailSheetBody>
	);
}

export function ChiTietMucTieu() {
	const mt = MUC_TIEU;
	const [tab, setTab] = useState("kr");
	const [ketCua, setKetCua] = useState<Quyet>({});
	const quyet = (id: string, k: Ket | undefined) =>
		setKetCua((cu) => ({ ...cu, [id]: k }));
	const tabs: DetailSheetTab[] = [
		{
			value: "kr",
			label: "Kết quả then chốt",
			count: mt.kr.length,
			content: <TabKr ketCua={ketCua} quyet={quyet} />,
		},
		{
			value: "can-chinh",
			label: "Căn chỉnh",
			count: 0,
			content: (
				<DetailSheetBody>
					<DetailSheetSection>
						<p className="text-muted-foreground text-sm">
							Mục tiêu này chưa góp vào Mục tiêu nào.
						</p>
					</DetailSheetSection>
				</DetailSheetBody>
			),
		},
		{
			value: "vet",
			label: "Vết",
			count: 3,
			content: (
				<DetailSheetBody>
					<DetailSheetSection>
						<p className="text-muted-foreground text-sm">
							Mỗi lần nhận góp ý để lại một dòng «theo đề xuất của Kara».
						</p>
					</DetailSheetSection>
				</DetailSheetBody>
			),
		},
	];
	return (
		<DetailSheet open onOpenChange={() => undefined} size="2xl">
			<DetailSheetHeader
				media={<EntityLogo name={mt.ten} size="lg" />}
				title={<span translate="no">{mt.ten}</span>}
				description={
					<>
						<span translate="no">{mt.donVi}</span> · Q4 2026
					</>
				}
				note={
					<>
						<Badge variant="outline">{mt.loai}</Badge>
						<Badge variant="secondary">{mt.trangThai}</Badge>
					</>
				}
				actions={
					<Button asChild size="sm" variant="outline">
						<Link href={`?state=${STATE.bHopSua}`}>
							<Icon icon={Edit} data-icon="inline-start" />
							Sửa
						</Link>
					</Button>
				}
			/>
			<DetailSheetStats>
				<DetailSheetStat label="Tiến độ">
					<span className="tabular-nums">42%</span>
					<span className="text-muted-foreground tabular-nums">
						{" · "}lẽ ra {mt.lePhanTram}%
					</span>
				</DetailSheetStat>
				<DetailSheetStat label="Tình trạng">Chậm</DetailSheetStat>
				<DetailSheetStat label="Phụ trách">
					<span translate="no">{mt.phuTrach}</span>
				</DetailSheetStat>
			</DetailSheetStats>
			<DetailSheetTabs tabs={tabs} value={tab} onValueChange={setTab} />
		</DetailSheet>
	);
}
