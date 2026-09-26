## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **docs/agent.md gives the wrong eve session address and lifetime for Zalo questions (r1)**
  Người dùng thấy gì: Tai lieu noi bo mo ta sai cach he thong nho cuoc tro chuyen Zalo (mot phien moi nguoi moi ngay, khong phai mot cuoc chung mai mai), co the khien nguoi phat trien sau hieu nham va lam sai chuc nang lien quan.
  file: `docs/agent.md`
  severity: medium
  Đề xuất: known-limits

- **Zalo invariant 'Message text is never stored or logged' is now false but was left in place (r1)**
  Người dùng thấy gì: Tai lieu noi tin nhan khong bao gio duoc luu hay ghi log, nhung thuc te ca cau hoi va cau tra loi deu duoc luu lai va mot phan thong tin xuat hien trong log he thong, khien nguoi doc hieu sai ve rieng tu cua tin nhan.
  file: `docs/agent.md`
  severity: medium
  Đề xuất: known-limits

- **Dynamic override file in tools/ adds a tool name that is never called to the telemetry allowlist and transcript verbs (r1)**
  Người dùng thấy gì: Ten cong cu hien thi trong so lieu thong ke va lich su tro chuyen cua bot co the khong dung voi cong cu thuc su da chay, gay kho khan khi tra soat sau nay.
  file: `apps/agent/agent/tools/zalo-chi-doc.ts`
  severity: low
  Đề xuất: known-limits

- **docs/agent.md still says xuLyTinDen treats webhook and manual-reader messages alike (r1)**
  Người dùng thấy gì: Neu tin nhan cua nguoi dung den qua mot duong ky thuat khac (khong phai duong chinh), nguoi do co the van nhan lai cau tra loi cu 'ban da noi' thay vi duoc tro ly AI tra loi cau hoi.
  file: `docs/agent.md`
  severity: low
  Đề xuất: known-limits

- **telemetry.md lists zalo_questions outcomes without `dang-hoi`, which the rollup does send (r1)**
  Người dùng thấy gì: Tài liệu mô tả số liệu Zalo gửi lên có thể thiếu một loại kết quả thực tế (câu đang chờ trả lời khi tới kỳ tổng hợp), khiến người xem báo cáo số liệu dễ hiểu sai bức tranh đầy đủ.
  file: `docs/telemetry.md`
  severity: low
  Đề xuất: known-limits

- **Non-text Zalo messages (sticker, image, file) from a linked member become an empty question sent to eve (r1)**
  Người dùng thấy gì: Neu nguoi dung gui anh, nhan dan hay tep thay vi go chu, he thong co the van coi do la mot cau hoi trong gui cho tro ly AI, lam ton mot luot hoi trong han muc cua nguoi do ma khong co ly do ro rang.
  file: `apps/agent/agent/lib/zalo-nhan.ts`
  severity: medium
  Đề xuất: known-limits

- **Phone-number redaction mangles VND amounts of 1,000 billion (nghìn tỷ) or more (r1)**
  Người dùng thấy gì: Khi tro ly AI nhac toi khoan tien cuc lon (tu nghin ty dong tro len), mot phan con so co the bi che nham thanh '[da an]', lam sai thong tin tai chinh gui cho nguoi dung.
  file: `apps/agent/agent/lib/zalo-loc.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay): E13 chèn tay hàng tu-choi-tran-ngay và dang-ban trong khi eval hứa «không insert tay» (r1)**
  Người dùng thấy gì: Mot phan du lieu dung de chung minh so lieu do luong duoc nhap san bang tay thay vi tao ra tu dung luong van hanh that, nen so lieu bao cao co the khong phan anh dung he thong that.
  file: `apps/agent/test/hoi-crm-qua-zalo-nguong.integration.spec.ts`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

- **Hình dạng 4 (âm tính một mình): cai-lenh kiểm «stage không đổi, activity không đổi» nhưng chỉ gọi bản giả, không có gì trong test gọi được công cụ ghi thật (r1 — vòng 2 không mang sang vì tệp bị nhát sửa r1 chạm; chép lại từ tasks/wyzbgmvl2.output)**
  Người dùng thấy gì: Bo kiem tra tu dong cho tinh nang chan lenh gia mao co the khong thuc su phat hien duoc khi CRM bi doi du lieu ngoai y muon, nen mot loi that o day co nguy co lot qua ma khong ai biet.
  file: `apps/agent/test/hoi-crm-qua-zalo.integration.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): cai-lenh kiểm «không lộ số» mà không kiểm là đã có tin gửi đi (r1 — vòng 2 không mang sang vì tệp bị nhát sửa r1 chạm; chép lại từ tasks/wyzbgmvl2.output)**
  Người dùng thấy gì: Bo kiem tra viec che so dien thoai co the bao dat ngay ca khi tro ly AI khong gui duoc cau tra loi nao, nen khong chac chan so dien thoai thuc su duoc che khi co cau tra loi.
  file: `apps/agent/test/hoi-crm-qua-zalo.integration.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 4 (bất đẳng thức âm, so với sai giá trị gốc): input.requested «đổi địa chỉ phiên» vẫn xanh khi token không đổi (r1 — vòng 2 không mang sang vì tệp bị nhát sửa r1 chạm; chép lại từ tasks/wyzbgmvl2.output)**
  Người dùng thấy gì: Bai kiem tra viec mo phien tro chuyen moi khi het ngan sach co the bao dat du phien cu khong thuc su duoc thay bang phien moi, nen rui ro nguoi dung bi ket trong phien cu chua duoc chung minh la da het.
  file: `apps/agent/test/hoi-crm-qua-zalo.integration.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay): ctx và continuationToken của sự kiện kênh được dựng tay đúng khuôn bên đọc, không lấy từ lời gọi send (r1 — vòng 2 không mang sang vì tệp bị nhát sửa r1 chạm; chép lại từ tasks/wyzbgmvl2.output)**
  Người dùng thấy gì: Nhieu bai kiem tra tu dung san du lieu dung y mong muon thay vi lay tu ket qua that cua he thong, nen neu he thong that thay doi cach dat ten hay dinh dang, cac bai kiem tra nay co the khong phat hien ra loi.
  file: `apps/agent/test/hoi-crm-qua-zalo.integration.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (assert chuỗi có mặt thay cho quan hệ): ô (c) của luat-cu kiểm một câu trả lời soạn sẵn thay vì bước được đánh dấu completedAt (r1 — vòng 2 không mang sang vì tệp bị nhát sửa r1 chạm; chép lại từ tasks/wyzbgmvl2.output)**
  Người dùng thấy gì: Viec danh dau mot buoc nhac viec la da xong khi tra loi qua Zalo chua thuc su duoc kiem chung, nen chua chac tinh nang danh dau hoan thanh nhac viec hoat dong dung.
  file: `apps/agent/test/hoi-crm-qua-zalo.integration.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình, có thể qua rỗng): test «tra loi muon» bọc mọi assert trong `if (cu.loai === "hoi")` và ghim log bằng OR (r1 — vòng 2 không mang sang vì tệp bị nhát sửa r1 chạm; chép lại từ tasks/wyzbgmvl2.output)**
  Người dùng thấy gì: Bai kiem tra viec tu choi cau tra loi den muon co the tu dong bo qua phan kiem tra quan trong nhat tuy theo du lieu ngau nhien, nen mot loi gui nham cau tra loi cu co the khong bi phat hien.
  file: `apps/agent/test/hoi-crm-qua-zalo.integration.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 (đo văn bản nguồn thay vì đầu ra): cổng vai chung được kiểm bằng cách grep channels/eve.ts (r1 — vòng 2 không mang sang vì tệp bị nhát sửa r1 chạm; chép lại từ tasks/wyzbgmvl2.output)**
  Người dùng thấy gì: Mot bai kiem tra chi doc chu trong ma nguon de coi nhu da kiem tra xong viec phan quyen, thay vi thuc su chay thu tinh huong, nen khong chac quyen truy cap duoc kiem soat dung trong moi truong hop.
  file: `apps/agent/test/hoi-crm-qua-zalo.integration.spec.ts`
  severity: low
  Đề xuất: known-limits

