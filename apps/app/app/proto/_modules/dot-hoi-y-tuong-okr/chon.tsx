"use client";

import {
	Alert,
	AlertAction,
	AlertDescription,
	AlertTitle,
} from "@crm/ui/components/alert";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import { ConfirmDialog } from "@crm/ui/components/confirm-dialog";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@crm/ui/components/field";
import { Input } from "@crm/ui/components/input";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@crm/ui/components/item";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@crm/ui/components/select";
import { Textarea } from "@crm/ui/components/textarea";
import { ToggleGroup, ToggleGroupItem } from "@crm/ui/components/toggle-group";
import { useState } from "react";
import {
	BAN_VIET_TRUOC,
	CHU_DE_GOM,
	type ChuDeMau,
	HOI_Y,
	type KetLuan,
	NHAN_KET_LUAN,
	THU_TU_KET_LUAN,
	TRAN,
	Y_CHUA_GOM,
	Y_LA,
	Y_RUT_GON,
} from "./du-lieu";
import { apBoSung, danhGiaCau, NHAN_CAU } from "./khung";

export type HinhChon = "chua-du" | "du";

const MOI = "moi";

function laKetLuan(v: string): v is KetLuan {
	return THU_TU_KET_LUAN.some((k) => k === v);
}

function chuDeBanDau(hinh: HinhChon): ChuDeMau[] {
	const tatCa = [...CHU_DE_GOM, Y_LA];
	return hinh === "chua-du" ? tatCa : tatCa.map(apBoSung);
}

function thieu(chuDe: ChuDeMau[], yChuaGom: number): string[] {
	const chuaKetLuan = chuDe.filter((c) => c.ketLuan === null).length;
	const chuaLyDo = chuDe.filter(
		(c) => c.lyDo.trim().length < TRAN.lyDo.it,
	).length;
	const chuaCau = chuDe.filter(
		(c) => c.ketLuan === "chon" && c.cauMucTieu.trim().length === 0,
	).length;
	const chuaNoi = chuDe.filter(
		(c) => c.ketLuan === "chon" && c.noiBanTruoc === null,
	).length;
	return [
		chuaKetLuan > 0 ? `${chuaKetLuan} chủ đề chưa kết luận` : null,
		chuaLyDo > 0 ? `${chuaLyDo} chủ đề chưa có lý do` : null,
		chuaCau > 0 ? `${chuaCau} chủ đề chọn chưa có câu mục tiêu` : null,
		chuaNoi > 0 ? `${chuaNoi} chủ đề chọn chưa khai nối câu viết trước` : null,
		yChuaGom > 0 ? `${yChuaGom} ý chưa gom` : null,
	].filter((x): x is string => x !== null);
}

function TheChon({
	c,
	onDoi,
}: {
	c: ChuDeMau;
	onDoi: (moi: ChuDeMau) => void;
}) {
	const lyDoThieu = c.lyDo.trim().length < TRAN.lyDo.it;
	const noiThieu = c.ketLuan === "chon" && c.noiBanTruoc === null;
	const idLyDo = `ly-do-${c.id}`;

	return (
		<Card data-chu-de={c.id} data-ket-luan={c.ketLuan ?? "chua"}>
			<CardHeader>
				<CardTitle translate="no">{c.ten}</CardTitle>
				<CardDescription>
					{c.soNguoi} người ở {c.soDonVi} đơn vị · {c.dongY} người cũng nghĩ vậy
				</CardDescription>
				{c.loai === "y-la" ? (
					<CardAction>
						<Badge variant="outline">Ý lạ</Badge>
					</CardAction>
				) : null}
			</CardHeader>
			<CardContent>
				<ItemGroup>
					{c.trich.map((t) => {
						const tacGia = Y_RUT_GON.get(t.yId)?.tacGia;
						return (
							<Item key={t.yId} size="xs" variant="muted">
								<ItemContent>
									<ItemTitle translate="no">«{t.cau}»</ItemTitle>
									{tacGia ? (
										<ItemDescription>
											<span translate="no">{tacGia.ten}</span> ·{" "}
											<span translate="no">{tacGia.donVi}</span>
										</ItemDescription>
									) : null}
								</ItemContent>
							</Item>
						);
					})}
				</ItemGroup>
				<FieldGroup>
					<Field>
						<FieldLabel>Kết luận</FieldLabel>
						<ToggleGroup
							aria-label={`Kết luận cho «${c.ten}»`}
							onValueChange={(v) => {
								if (laKetLuan(v)) onDoi({ ...c, ketLuan: v });
							}}
							size="sm"
							type="single"
							value={c.ketLuan ?? ""}
							variant="outline"
						>
							{THU_TU_KET_LUAN.map((k) => (
								<ToggleGroupItem key={k} value={k}>
									{NHAN_KET_LUAN[k]}
								</ToggleGroupItem>
							))}
						</ToggleGroup>
					</Field>
					<Field data-invalid={lyDoThieu ? true : undefined}>
						<FieldLabel htmlFor={idLyDo}>Lý do</FieldLabel>
						<Textarea
							aria-invalid={lyDoThieu ? true : undefined}
							id={idLyDo}
							maxLength={TRAN.lyDo.nhieu}
							onChange={(e) => onDoi({ ...c, lyDo: e.target.value })}
							placeholder="Bạn tự viết. Người góp đọc nguyên văn."
							translate="no"
							value={c.lyDo}
						/>
						{lyDoThieu ? (
							<FieldError>
								Viết lý do ít nhất {TRAN.lyDo.it} ký tự trước khi công bố.
							</FieldError>
						) : (
							<FieldDescription>
								{c.lyDo.length}/{TRAN.lyDo.nhieu} ký tự. Người góp đọc nguyên
								văn.
							</FieldDescription>
						)}
					</Field>
					{c.ketLuan === "chon" ? (
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2" data-khoi="khi-chon">
							<Field>
								<FieldLabel htmlFor={`cau-${c.id}`}>Câu mục tiêu</FieldLabel>
								<Input
									id={`cau-${c.id}`}
									maxLength={200}
									onChange={(e) => onDoi({ ...c, cauMucTieu: e.target.value })}
									translate="no"
									value={c.cauMucTieu}
								/>
								<FieldDescription>
									Thành bản nháp mục tiêu cấp OneHub khi công bố.
								</FieldDescription>
							</Field>
							<Field data-invalid={noiThieu ? true : undefined}>
								<FieldLabel htmlFor={`noi-${c.id}`}>
									Nối với câu viết trước
								</FieldLabel>
								<Select
									onValueChange={(v) =>
										onDoi({
											...c,
											noiBanTruoc: v === MOI ? MOI : Number(v),
										})
									}
									value={c.noiBanTruoc === null ? "" : String(c.noiBanTruoc)}
								>
									<SelectTrigger
										aria-invalid={noiThieu ? true : undefined}
										id={`noi-${c.id}`}
									>
										<SelectValue placeholder="Chọn câu…" />
									</SelectTrigger>
									<SelectContent>
										{BAN_VIET_TRUOC.map((b) => (
											<SelectItem key={b.so} value={String(b.so)}>
												Câu {b.so}: <span translate="no">{b.cau}</span>
											</SelectItem>
										))}
										<SelectItem value={MOI}>
											Không có trong bản viết trước
										</SelectItem>
									</SelectContent>
								</Select>
								{noiThieu ? (
									<FieldError>
										Khai câu viết trước mà chủ đề này nối tới, hoặc «Không có
										trong bản viết trước».
									</FieldError>
								) : (
									<FieldDescription>
										Kết quả in câu này là giữ nguyên, đổi, bỏ hay thêm.
									</FieldDescription>
								)}
							</Field>
						</div>
					) : null}
				</FieldGroup>
			</CardContent>
		</Card>
	);
}

function BanVietTruocCuaBan({ chuDe }: { chuDe: ChuDeMau[] }) {
	return (
		<Card data-khoi="ban-viet-truoc-cua-ban">
			<CardHeader>
				<CardTitle>Bản viết trước của bạn</CardTitle>
				<CardDescription>
					Niêm phong lúc {HOI_Y.niemPhongLuc}. Chỉ bạn đọc được tới khi công bố.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<ItemGroup>
					{BAN_VIET_TRUOC.map((b) => {
						const { nhan, noi } = danhGiaCau(b.so, b.cau, chuDe);
						return (
							<Item data-cau={b.so} key={b.so} size="xs">
								<ItemContent>
									<ItemTitle>
										{b.so}. <span translate="no">{b.cau}</span>
									</ItemTitle>
									<ItemDescription>
										{noi ? (
											<>
												{NHAN_CAU[nhan]} — nối với «
												<span translate="no">{noi.ten}</span>»
											</>
										) : (
											"Chưa chủ đề chọn nào nối tới — sẽ là «Bỏ»"
										)}
									</ItemDescription>
								</ItemContent>
							</Item>
						);
					})}
				</ItemGroup>
			</CardContent>
		</Card>
	);
}

export function ChonMan({ hinh }: { hinh: HinhChon }) {
	const [chuDe, setChuDe] = useState<ChuDeMau[]>(() => chuDeBanDau(hinh));
	const [hoi, setHoi] = useState(false);
	const yChuaGom = hinh === "du" ? 0 : 1;
	const conThieu = thieu(chuDe, yChuaGom);
	const soChon = chuDe.filter((c) => c.ketLuan === "chon").length;
	const yLe = Y_CHUA_GOM[Y_CHUA_GOM.length - 1];
	const doi = (moi: ChuDeMau) =>
		setChuDe((cu) => cu.map((c) => (c.id === moi.id ? moi : c)));

	return (
		<div className="flex flex-col gap-6" data-hinh-chon={hinh}>
			<Card>
				<CardHeader>
					<CardTitle>Kết luận từng chủ đề</CardTitle>
					<CardDescription>
						Mỗi chủ đề cần một kết luận và lý do bạn tự viết. Máy chỉ đính bằng
						chứng, không điền sẵn lý do.
					</CardDescription>
				</CardHeader>
			</Card>
			{yChuaGom > 0 && yLe ? (
				<Alert data-khoi="con-y-chua-gom">
					<AlertTitle>Còn {yChuaGom} ý chưa gom</AlertTitle>
					<AlertDescription>
						«<span translate="no">{yLe.noiDung}</span>» —{" "}
						<span translate="no">{yLe.tacGia.ten}</span>. Đưa vào một chủ đề
						hoặc để thành ý lạ.
					</AlertDescription>
					<AlertAction>
						<Button size="sm" variant="outline">
							Gom
						</Button>
					</AlertAction>
				</Alert>
			) : null}
			<div className="grid gap-6 lg:grid-cols-3">
				<div className="flex min-w-0 flex-col gap-6 lg:col-span-2">
					{chuDe.map((c) => (
						<TheChon c={c} key={c.id} onDoi={doi} />
					))}
				</div>
				<div className="flex min-w-0 flex-col gap-6">
					<BanVietTruocCuaBan chuDe={chuDe} />
				</div>
			</div>
			<div className="sticky bottom-4 z-10" data-khoi="thanh-cong-bo">
				<Alert>
					<AlertTitle>
						{conThieu.length === 0
							? `Sẵn sàng — ${soChon} mục tiêu nháp sẽ được tạo ở cấp OneHub`
							: "Chưa công bố được"}
					</AlertTitle>
					<AlertDescription>
						{conThieu.length === 0
							? "Người góp sẽ thấy kết luận, lý do và bản viết trước của bạn."
							: conThieu.join(" · ")}
					</AlertDescription>
					<AlertAction>
						<Button
							disabled={conThieu.length > 0}
							onClick={() => setHoi(true)}
							size="sm"
						>
							Công bố
						</Button>
					</AlertAction>
				</Alert>
			</div>
			<ConfirmDialog
				nut="Công bố"
				onConfirm={() => setHoi(false)}
				onOpenChange={setHoi}
				open={hoi}
				pending={false}
				than={`${soChon} mục tiêu nháp được tạo ở cấp OneHub, bạn là người phụ trách. Mọi người đã góp sẽ thấy ý mình đi đâu, lý do của bạn, và bản viết trước — câu nào giữ, bỏ, thêm. Không rút lại được.`}
				thoi="Chưa"
				tieuDe={`Công bố kết luận cho ${HOI_Y.chuKy}?`}
				tone="default"
			/>
		</div>
	);
}
