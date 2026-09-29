"use client";

import Add from "@carbon/icons-react/es/Add";
import Locked from "@carbon/icons-react/es/Locked";
import Subtract from "@carbon/icons-react/es/Subtract";
import { Button } from "@crm/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import { ConfirmDialog } from "@crm/ui/components/confirm-dialog";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@crm/ui/components/empty";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
} from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import { Input } from "@crm/ui/components/input";
import { useState } from "react";
import { DO_PHU_DANG_MO, HOI_Y, NHAP_VIET_TRUOC, TRAN } from "./du-lieu";
import { CauHoi, DaiPha, DoPhu, LoiMo } from "./khung";

type HopHoi = "niem-phong" | "bo-qua" | null;

function BanVietTruoc() {
	const [cau, setCau] = useState<{ id: number; chu: string }[]>(
		NHAP_VIET_TRUOC.map((chu, i) => ({ id: i + 1, chu })),
	);
	const [hoi, setHoi] = useState<HopHoi>(null);
	const hopLe =
		cau.length >= TRAN.cauVietTruoc.it &&
		cau.every(
			(c) =>
				c.chu.trim().length >= TRAN.noiDung.it &&
				c.chu.length <= TRAN.cauVietTruoc.kyTu,
		);
	const soMoi = Math.max(0, ...cau.map((c) => c.id)) + 1;

	return (
		<Card data-khoi="ban-viet-truoc">
			<CardHeader>
				<CardTitle>Bản viết trước</CardTitle>
				<CardDescription>
					Không ai đọc được bản này tới khi công bố. Niêm phong rồi mới đọc được
					ý của mọi người.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<FieldGroup>
					{cau.map((c, i) => (
						<Field key={c.id}>
							<FieldLabel htmlFor={`viet-truoc-${c.id}`}>
								Câu {i + 1}
							</FieldLabel>
							<div className="flex items-center gap-2">
								<Input
									id={`viet-truoc-${c.id}`}
									maxLength={TRAN.cauVietTruoc.kyTu}
									onChange={(e) =>
										setCau((cu) =>
											cu.map((x) =>
												x.id === c.id ? { ...x, chu: e.target.value } : x,
											),
										)
									}
									placeholder="Một mục tiêu bạn định đặt cho năm tới"
									translate="no"
									value={c.chu}
								/>
								{cau.length > TRAN.cauVietTruoc.it ? (
									<Button
										aria-label={`Bỏ câu ${i + 1}`}
										onClick={() =>
											setCau((cu) => cu.filter((x) => x.id !== c.id))
										}
										size="icon-sm"
										variant="ghost"
									>
										<Icon icon={Subtract} />
									</Button>
								) : null}
							</div>
							<FieldDescription>
								{c.chu.length}/{TRAN.cauVietTruoc.kyTu} ký tự
							</FieldDescription>
						</Field>
					))}
					<div>
						<Button
							disabled={cau.length >= TRAN.cauVietTruoc.nhieu}
							onClick={() => setCau((cu) => [...cu, { id: soMoi, chu: "" }])}
							size="sm"
							variant="ghost"
						>
							<Icon data-icon="inline-start" icon={Add} />
							Thêm câu
						</Button>
					</div>
					<FieldDescription>
						{TRAN.cauVietTruoc.it}–{TRAN.cauVietTruoc.nhieu} câu. Không sửa được
						sau khi niêm phong.
					</FieldDescription>
					<div className="flex flex-wrap items-center justify-end gap-2">
						<Button onClick={() => setHoi("bo-qua")} variant="link">
							Không viết trước
						</Button>
						<Button disabled={!hopLe} onClick={() => setHoi("niem-phong")}>
							Niêm phong
						</Button>
					</div>
				</FieldGroup>
			</CardContent>
			<ConfirmDialog
				nut="Niêm phong"
				onConfirm={() => setHoi(null)}
				onOpenChange={(mo) => {
					if (!mo) setHoi(null);
				}}
				open={hoi === "niem-phong"}
				pending={false}
				than={`Không sửa được sau khi niêm phong. Không ai đọc được ${cau.length} câu này tới khi bạn công bố; lúc đó mọi người thấy câu nào bạn giữ, bỏ hay thêm.`}
				thoi="Viết tiếp"
				tieuDe={`Niêm phong ${cau.length} câu?`}
				tone="default"
			/>
			<ConfirmDialog
				nut="Không viết trước"
				onConfirm={() => setHoi(null)}
				onOpenChange={(mo) => {
					if (!mo) setHoi(null);
				}}
				open={hoi === "bo-qua"}
				pending={false}
				than="Kết quả công bố sẽ không có phần giữ · thêm · bỏ. Không đổi lại được."
				thoi="Quay lại viết"
				tieuDe="Bỏ qua bản viết trước?"
				tone="default"
			/>
		</Card>
	);
}

function YBiKhoa() {
	return (
		<Card data-khoi="y-bi-khoa">
			<CardHeader>
				<CardTitle>Ý của mọi người</CardTitle>
				<CardDescription>
					{HOI_Y.daGop} người đã góp {HOI_Y.soY} ý.
				</CardDescription>
			</CardHeader>
			<Empty className="border">
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<Icon icon={Locked} />
					</EmptyMedia>
					<EmptyTitle>Niêm phong trước khi đọc ý</EmptyTitle>
					<EmptyDescription>
						Bạn là người chọn. Danh sách mở ra ngay khi bạn niêm phong bản viết
						trước, hoặc chọn «Không viết trước».
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		</Card>
	);
}

export function VietTruocMan() {
	return (
		<div className="flex flex-col gap-4" data-hinh="viet-truoc">
			<DaiPha pha="dang-mo" />
			<Card>
				<CauHoi ghiChu="Bạn là người chọn nên không góp ý. Bạn viết trước, rồi kết luận từng chủ đề sau hạn." />
			</Card>
			<LoiMo />
			<BanVietTruoc />
			<YBiKhoa />
			<DoPhu hang={DO_PHU_DANG_MO} />
		</div>
	);
}
