# Review findings: lich-su-moi-lan-cap-nhat (round 1)

## Trong hợp đồng

- **Hình dạng 1 (đo hàm phụ thay vì đầu ra): AC-2 hứa `chuoi` của okr.lichSuKr nhưng chỉ hàm chuoiMoiLan được đo, với kyVong giả**
  AC: AC-2
  file: `apps/api/test/lich-su-moi-lan-cap-nhat.spec.ts:209`
  severity: medium
  source: measurement
  detail: AC-2 viết «When gọi `okr.lichSuKr`, Then `chuoi` có một điểm cho mỗi lần … `kyVong` của tuần chứa nó … xếp theo thời gian». Nhưng E1 (lechLan, dòng 209-240) parse lichSuKrOutput mà chỉ so các trường của `lan`, không đọc `ls.chuoi`. E2 (dòng 428-467) gọi thẳng `chuoiMoiLan` với `kyVongThu` tự đặt trong bài (dòng 298, 307), không phải `kyVongTuan` thật dựng từ kyVongTheoNgay và publishedAt. Đầu vào của nó còn đã xếp sẵn theo giờ (ca ba-lan-mot-tuan, dòng 346-348). Phần nối dây trong `OkrXemService.lichSuKr` vì thế không được bài máy nào đo: chuyển `lan` đã sắp hay `so.lan` chưa sắp, `tuanKy` và `homNay` thật, `kyVongTuan` thật. Một lỗi như truyền `so.lan` chưa sắp (làm sai thứ tự trong tuần) hay truyền sai hàm kỳ vọng vẫn qua cả E1 lẫn E2. E5 cũng chỉ mồi chuoi bằng chính chuoiMoiLan, còn E10 chỉ đếm chấm.

- **Hình dạng 5 (tuyên quét mọi trường của dòng nhưng ma trận thiếu cột): mức tự tin không được assert ở lsml-danh-sach và ô KR mốc của lsml-trang-thai**
  AC: AC-4
  file: `apps/app/test/lich-su-moi-lan-cap-nhat.dom.tsx:342`
  severity: medium
  source: measurement
  detail: E4 hứa mỗi dòng có «giá trị theo đơn vị KR, mức tự tin và ghi chú của chính lần đó». AC-4 cũng liệt kê mức tự tin. Vòng lặp chín dòng (dòng 342-365) kiểm data-lan-cap-nhat, nhãn [data-luc-lan], [data-gia-tri-lan], ghi chú và [data-hang-cam-xuc], nhưng không có assert nào cho mức tự tin. Lich-su-kr.tsx dựng mức tự tin bằng `ConfidenceIndicator level={p.tuTin}`. Mẫu đã đặt L3 `tuTin: "thap"` và L6 `tuTin: "cao"` (dòng 128, 144) mà không kiểm lần nào. Ô KR mốc của E7 (dòng 604-613) hứa «dòng có mức tự tin và ghi chú» nhưng chỉ kiểm chữ «xong roi». Dòng hiện sai mức tự tin, hay hiện mức của lần khác, vẫn xanh.

- **Hình dạng 5 (danh sách hứa có mục bị bỏ sót): «đường kỳ vọng có mặt» ở lsml-bieu-do không có assert**
  AC: AC-5
  file: `apps/app/test/lich-su-moi-lan-cap-nhat.dom.tsx:410`
  severity: low
  source: measurement
  detail: E5 hứa «đường kỳ vọng và vạch đích có mặt», và AC-5 viết «đường kỳ vọng và vạch đích còn như trước». Dòng 410-415 chỉ kiểm vạch đích (`[data-muc="dich"]` hoặc `.recharts-reference-line`). Không assert nào đọc đường `dataKey="expected"`: không đếm đường thứ hai, không đọc cột «Lẽ ra» của bảng sr-only. Mất đường kỳ vọng (chẳng hạn chuoi mất kyVong) vẫn cho lsml-bieu-do 6/6.

- **Hình dạng 5 (ma trận lấy từ đầu ra, không viết trước): lsml-dien-bien-giu không kiểm «số điểm = số tuần của kỳ»**
  AC: AC-9
  file: `apps/api/test/lich-su-moi-lan-cap-nhat.spec.ts:614`
  severity: medium
  source: measurement
  detail: E9 hứa «số điểm = số tuần của kỳ». Bài lặp `for (const p of d.diem)` (dòng 614), tức lặp trên chính đầu ra của okr.dienBien, và chỉ so từng điểm đang có với SQL. Kiểm đếm duy nhất (dòng 636-642) so số điểm CÓ checkInId với số tuần có lần. Không assert nào so `d.diem.length` với số tuần của kỳ (một danh sách tuần viết trước hay đếm độc lập). Nếu dienBien bỏ các tuần không có lần (đúng thứ mà bốn nơi đọc theo tuần dựa vào), mọi assert vẫn đạt. Vế «giữ đúng như trước» của AC-9 vì thế không được đo trọn.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
