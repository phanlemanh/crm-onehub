import subprocess, sys, os

GOC = sys.argv[1]
APP = os.path.join(GOC, "apps/app")
DOM = "TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/sua-giao-dien-tin-hieu.dom.tsx -t "
DS = "apps/app/components/tin-hieu/danh-sach-tin-hieu.tsx"
HOP = "apps/app/components/tin-hieu/hop-gui-tin-hieu.tsx"
NUT = "apps/app/components/tin-hieu/nut-gui-tin-hieu.tsx"
TRANG = "apps/app/app/(app)/[slug]/tin-hieu/danh-sach-tin-hieu-trang.tsx"
TT = "apps/app/lib/tin-hieu/trang-thai.ts"
MSG = "apps/app/lib/messages/tin-hieu.ts"

CA = [
    ("E1", DS, '{ id: "gui", header: m.cot.gui, width: "w-36" },', '{ id: "man", header: m.cot.man, width: "w-32" },\n{ id: "gui", header: m.cot.gui, width: "w-36" },', DOM + "sgt-bang", "bang con cot man rieng, cot ke bi bop"),
    ("E2", NUT, "? dien(m.hop.quaTran, { tran: String(TIN_HIEU.tranMoiNgay) })", "? (gui.error?.message ?? \"\")", DOM + "'sgt-loi: 429-en'", "loi qua tran hien cau may chu"),
    ("E2b", HOP, "<Field>\n\t\t\t\t\t\t\t<FieldLabel htmlFor={idDaXayRa}>", "<Field data-invalid={loi ? true : undefined}>\n\t\t\t\t\t\t\t<FieldLabel htmlFor={idDaXayRa}>", DOM + "'sgt-loi: 500-vi'", "loi gui gan vao mot o"),
    ("E3", DS, 'en: new Intl.DateTimeFormat("en-GB", KHUON_GIO),', 'en: new Intl.DateTimeFormat("vi-VN", KHUON_GIO),', DOM + "'sgt-gio: en'", "gio gui khong theo ngon ngu"),
    ("E4", DS, '<ItemDescription data-muon-lam="">{maVaMuon(d)}</ItemDescription>', '<ItemDescription data-muon-lam="">{dien(m.muonLam, { muonLam: d.muonLam })}</ItemDescription>', DOM + "sgt-ma", "dong dien thoai thieu ma tin hieu"),
    ("E5", TRANG, "requestAnimationFrame(() => dieuTieuDiem(ke));", "", DOM + "'sgt-tieu-diem: o a'", "tieu diem roi ve dau trang sau xoa"),
    ("E5b", TRANG, "\t\t\t\t\t\t\tsetXoaHong(\n", "\t\t\t\t\t\t\tvoid setXoaHong;\n\t\t\t\t\t\t\t(() => null)(\n", DOM + "'xoa hong 409-vi'", "xoa hong khong noi vi sao"),
    ("E6", HOP, "{!coChu && !khoaTran ? (", "{false ? (", DOM + "'sgt-cham: ma tran'", "nut gui khoa khong noi vi sao"),
    ("E6b", DS, 'thaoTac(d, "icon-lg")', 'thaoTac(d, "icon-xs")', DOM + "'sgt-cham: nut'", "nut thao tac dien thoai duoi co cham"),
    ("E7", HOP, "<Dialog coThayDoi={coThayDoi} onOpenChange", "<Dialog onOpenChange", DOM + "'bien nhan / dong'", "bien nhan van hoi bo chu da nhap"),
    ("E8", NUT, "gui.mutate({ muonLam, daXayRa, man });", "gui.mutate({ muonLam, daXayRa, man: tenMan(man, locale) });", DOM + "sgt-ten-man", "gia tri gui len doi khoi duong dan"),
    ("E9", MSG, 'choGom: "Đang xem xét",', 'choGom: "Chờ gom",', DOM + "'sgt-chu: chu'", "chu trang thai dung tu noi bo: gom"),
    ("E9b", DS, "disabled={!d.coTheXoa}", "disabled={false}", DOM + "'sgt-chu: dong'", "dong da lay ve"),
    ("E14", TT, "const cau = cauSauGom(b, nhanCuaHang(b, nhom, m), tenViec, m);", "const cau = b.cau_nguoi_gui ?? b.cau;", "bun test ./test/sua-giao-dien-tin-hieu-cau.spec.ts", "cau sau gom chi co tieng Viet"),
]

chon = sys.argv[2:] or [c[0] for c in CA]
ket = []
for ten, tep, cu, moi, lenh, ghim in CA:
    if ten not in chon:
        continue
    p = os.path.join(GOC, tep)
    goc = open(p).read()
    if cu not in goc:
        ket.append(f"{ten}: KHONG AP DUOC (khong thay chuoi goc)")
        continue
    open(p, "w").write(goc.replace(cu, moi, 1))
    try:
        r = subprocess.run(lenh, shell=True, cwd=APP, capture_output=True, text=True, timeout=300)
        ra = r.stdout + r.stderr
        do = r.returncode != 0
        thay = ghim in ra
        ket.append(f"{ten}: {'DO' if do else 'XANH'} · thong diep ghim {'CO' if thay else 'KHONG'} «{ghim}»")
    finally:
        open(p, "w").write(goc)
for k in ket:
    print(k)
