"use client";

import { Alert, AlertDescription } from "@crm/ui/components/alert";
import { Button } from "@crm/ui/components/button";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
	FieldTitle,
} from "@crm/ui/components/field";
import {
	GiuContext,
	useChanLienKet,
	useGiuGoc,
	useKhaiThayDoi,
} from "@crm/ui/components/giu-thay-doi";
import { Input } from "@crm/ui/components/input";
import { useLocale } from "@crm/ui/components/locale-provider";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@crm/ui/components/select";
import { TrinhSoan } from "@crm/ui/components/trinh-soan";
import {
	chuanNfc,
	LOAI_TRANG,
	type LoaiTrang,
	TAI_LIEU,
} from "@crm/validation/tai-lieu";
import { chuanHoa } from "@crm/validation/tai-lieu-markdown";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
	useCallback,
	useEffect,
	useId,
	useMemo,
	useRef,
	useState,
} from "react";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import {
	PageShellContent,
	PageShellHeader,
	PageShellHeading,
	PageShellTitle,
} from "@/components/page-shell";
import { taiLieuMessages } from "@/lib/messages/tai-lieu";
import { duongDanhSach, duongTrang, TAI_LIEU_MAN } from "@/lib/tai-lieu-man";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";

export type LuaChon = { id: string; ten: string };

export type ManSoanVao =
	| { kieu: "moi"; toiId: string; chuTrang: LuaChon[]; donVi: LuaChon[] }
	| { kieu: "sua"; slug: string; ten: string; banGoc: string };

function laLoai(v: string): v is LoaiTrang {
	return LOAI_TRANG.some((l) => l === v);
}

export function ManSoan({ vao }: { vao: ManSoanVao }) {
	const router = useRouter();
	const dich = useRef<string | null>(null);
	const giu = useGiuGoc({
		open: true,
		onOpenChange: (mo) => {
			if (!mo && dich.current) router.push(dich.current);
		},
		tuNhanThayDoi: false,
	});
	const coThayDoi = giu.coThayDoi;

	useEffect(() => {
		if (!coThayDoi) return;
		const hoi = (e: BeforeUnloadEvent) => e.preventDefault();
		window.addEventListener("beforeunload", hoi);
		return () => window.removeEventListener("beforeunload", hoi);
	}, [coThayDoi]);

	const doiMo = giu.onOpenChange;
	const roi = useCallback(
		(toi: string) => {
			dich.current = toi;
			doiMo(false);
		},
		[doiMo],
	);
	useChanLienKet(coThayDoi, roi);

	return (
		<GiuContext.Provider value={giu.ngucCanh}>
			<FormSoan roi={roi} vao={vao} />
			{giu.hopHoi}
		</GiuContext.Provider>
	);
}

function FormSoan({
	vao,
	roi,
}: {
	vao: ManSoanVao;
	roi: (toi: string) => void;
}) {
	const t = taiLieuMessages(useLocale());
	const m = t.soan;
	const trpc = useTRPC();
	const cache = useCrmCache();
	const router = useRouter();
	const url = useWorkspaceUrl();
	const khai = useKhaiThayDoi();
	const ma = useId();
	const id = {
		ten: `${ma}-ten`,
		loiTen: `${ma}-loi-ten`,
		loai: `${ma}-loai`,
		donVi: `${ma}-don-vi`,
		chuTrang: `${ma}-chu-trang`,
		noiDung: `${ma}-noi-dung`,
		goiY: `${ma}-goi-y`,
	};
	const sua = vao.kieu === "sua";
	const tenGoc = sua ? vao.ten : "";
	const banGoc = sua ? vao.banGoc : "";
	const gocChuan = useMemo(() => chuanHoa(banGoc), [banGoc]);
	const [ten, setTen] = useState(tenGoc);
	const [noiDung, setNoiDung] = useState(banGoc);
	const [loai, setLoai] = useState<LoaiTrang>(LOAI_TRANG[0]);
	const [donVi, setDonVi] = useState<string>(TAI_LIEU_MAN.khongDonVi);
	const [chuTrang, setChuTrang] = useState(vao.kieu === "moi" ? vao.toiId : "");
	const [loiTen, setLoiTen] = useState<string | null>(null);
	const oTen = useRef<HTMLInputElement>(null);
	const noiDungChuan = useMemo(() => chuanHoa(noiDung), [noiDung]);
	const tenSach = chuanNfc(ten).trim();
	const chuaDoi =
		sua && tenSach === chuanNfc(tenGoc).trim() && noiDungChuan === gocChuan;
	const chuaCoNoiDung = noiDungChuan.trim() === "";
	const khoaGui = chuaDoi || chuaCoNoiDung;
	const coThayDoi = sua ? !chuaDoi : tenSach !== "" || noiDung.trim() !== "";

	useEffect(() => {
		khai(coThayDoi);
	}, [khai, coThayDoi]);

	const xong = async (slug: string) => {
		khai(false);
		await cache.taiLieu(slug);
		router.push(url(duongTrang(slug)));
	};
	const tao = useMutation(
		trpc.taiLieu.create.mutationOptions({
			onSuccess: (r) => xong(r.slug),
		}),
	);
	const deXuat = useMutation(
		trpc.taiLieu.propose.mutationOptions({
			onSuccess: (_, v) => xong(v.slug),
		}),
	);
	const hanhDong = sua ? deXuat : tao;
	const dangGui = hanhDong.isPending;
	const loiMay = hanhDong.error;
	const loiGui =
		loiMay && !dangGui
			? dien(m.chuaGui, {
					loi:
						loiMay.data?.httpStatus !== undefined &&
						loiMay.data.httpStatus < 500
							? loiMay.message
							: m.mayChu,
				})
			: null;

	const kiemTen = (): string | null => {
		if (tenSach.length < TAI_LIEU.ten.min) return m.tenTrong;
		if (tenSach.length > TAI_LIEU.ten.max)
			return dien(m.tenDai, { max: TAI_LIEU.ten.max });
		return null;
	};

	const gui = () => {
		if (dangGui || khoaGui) return;
		const loi = kiemTen();
		setLoiTen(loi);
		if (loi) {
			oTen.current?.focus();
			return;
		}
		if (vao.kieu === "sua") {
			deXuat.mutate({ slug: vao.slug, ten: tenSach, noiDung });
			return;
		}
		tao.mutate({
			ten: tenSach,
			loai,
			departmentId: donVi === TAI_LIEU_MAN.khongDonVi ? null : donVi,
			chuTrangId: chuTrang,
			noiDung,
		});
	};

	return (
		<>
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>{sua ? m.tieuDeSua : m.tieuDeMoi}</PageShellTitle>
				</PageShellHeading>
			</PageShellHeader>
			<PageShellContent>
				<div
					className="flex min-w-0 max-w-3xl flex-col gap-5"
					data-soan={vao.kieu}
				>
					<Field data-invalid={loiTen ? true : undefined}>
						<FieldLabel htmlFor={id.ten}>{m.ten}</FieldLabel>
						<Input
							aria-describedby={loiTen ? id.loiTen : undefined}
							aria-invalid={loiTen ? true : undefined}
							autoComplete="off"
							id={id.ten}
							name="ten"
							onChange={(e) => {
								setTen(e.target.value);
								if (loiTen) setLoiTen(null);
							}}
							ref={oTen}
							translate="no"
							value={ten}
						/>
						{loiTen ? <FieldError id={id.loiTen}>{loiTen}</FieldError> : null}
					</Field>
					{vao.kieu === "moi" ? (
						<div className="grid gap-4 sm:grid-cols-3">
							<Field>
								<FieldLabel htmlFor={id.loai}>{m.loaiTrang}</FieldLabel>
								<Select
									onValueChange={(v) => {
										if (laLoai(v)) setLoai(v);
									}}
									value={loai}
								>
									<SelectTrigger id={id.loai}>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{LOAI_TRANG.map((l) => (
											<SelectItem key={l} value={l}>
												{t.loai[l]}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</Field>
							<Field>
								<FieldLabel htmlFor={id.donVi}>{m.donVi}</FieldLabel>
								<Select onValueChange={setDonVi} value={donVi}>
									<SelectTrigger id={id.donVi}>
										<SelectValue placeholder={m.chonDonVi} />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value={TAI_LIEU_MAN.khongDonVi}>
											{m.khongDonVi}
										</SelectItem>
										{vao.donVi.map((d) => (
											<SelectItem key={d.id} translate="no" value={d.id}>
												{d.ten}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</Field>
							<Field>
								<FieldLabel htmlFor={id.chuTrang}>{m.chuTrang}</FieldLabel>
								<Select onValueChange={setChuTrang} value={chuTrang}>
									<SelectTrigger id={id.chuTrang}>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{vao.chuTrang.map((c) =>
											c.id === vao.toiId ? (
												<SelectItem key={c.id} value={c.id}>
													{m.ban}
												</SelectItem>
											) : (
												<SelectItem key={c.id} translate="no" value={c.id}>
													{c.ten}
												</SelectItem>
											),
										)}
									</SelectContent>
								</Select>
							</Field>
						</div>
					) : null}
					<Field>
						<FieldTitle>{m.noiDung}</FieldTitle>
						<FieldDescription id={id.goiY}>{m.goiY}</FieldDescription>
						<TrinhSoan
							aria-describedby={id.goiY}
							giaTri={noiDung}
							goiY={m.goiY}
							id={id.noiDung}
							nhan={m.noiDungNhan}
							nhanNut={{
								tieuDe2: m.nut.tieuDe2,
								tieuDe3: m.nut.tieuDe3,
								dam: m.nut.dam,
								nghieng: m.nut.nghieng,
								danhSachSo: m.nut.danhSachSo,
								danhSachCham: m.nut.danhSachCham,
								bang: m.nut.bang,
								lienKet: m.nut.lienKet,
								hoanTac: m.nut.hoanTac,
								lamLai: m.nut.lamLai,
							}}
							onDoi={setNoiDung}
						/>
					</Field>
					<FieldDescription>{m.sauDuyet}</FieldDescription>
					<div aria-live="polite">
						{loiGui ? (
							<Alert data-loi-gui="" variant="destructive">
								<AlertDescription>{loiGui}</AlertDescription>
							</Alert>
						) : null}
					</div>
					<div className="flex flex-wrap items-center gap-2">
						<Button
							data-gui-duyet=""
							disabled={dangGui || khoaGui}
							onClick={gui}
						>
							{dangGui ? m.dangGui : m.guiDuyet}
						</Button>
						<Button
							disabled={dangGui}
							onClick={() =>
								roi(
									url(
										vao.kieu === "sua" ? duongTrang(vao.slug) : duongDanhSach(),
									),
								)
							}
							variant="outline"
						>
							{m.huy}
						</Button>
						{chuaDoi ? (
							<span className="text-muted-foreground text-xs" data-chua-doi="">
								{m.chuaDoi}
							</span>
						) : chuaCoNoiDung ? (
							<span
								className="text-muted-foreground text-xs"
								data-chua-co-noi-dung=""
							>
								{m.chuaCoNoiDung}
							</span>
						) : null}
					</div>
				</div>
			</PageShellContent>
		</>
	);
}
