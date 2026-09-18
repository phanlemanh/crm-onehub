## Trong hợp đồng

(không có finding trong hợp đồng ở round này — ba phát hiện trong hợp đồng của round 1 (thước E5 dùng regex `[a-z]+` bỏ sót giá trị có gạch/số/hoa; E5 hình dạng 2 không round-trip; E8 hình dạng 1 đo `conHieuLuc` thay vì `decideSignIn`) đã được sửa: E5 nay đọc tập của kho bằng `bun -e` + JSON qua `createRequire` neo vào `packages/auth/package.json`, và ma trận `ma-tran-trang-thai` của E8 gọi thẳng `decideSignIn`.)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Revoke writes the "canceled" literal as a positional array index, and the AC-5 gate cannot catch a reorder**
  Người dùng thấy gì: Neu thu tu noi bo cua cac trang thai loi moi bi doi trong mot lan sua sau nay, nguoi tung bi thu hoi quyen co the vo tinh duoc cho dang nhap tro lai ma khong ai nhan ra ngay.
  file: `apps/api/src/workspace/workspace.service.ts`
  severity: high
  Đề xuất: known-limits

- **The API output enum re-declares the invitation vocabulary by hand instead of deriving it**
  Người dùng thấy gì: Neu sau nay he thong loi moi co them mot trang thai moi, man quan tri co the tam thoi khong hien dung trang thai do cho toi khi duoc cap nhat thu cong.
  file: `apps/api/src/workspace/workspace.contracts.ts`
  severity: medium
  Đề xuất: known-limits

- **AC-6 names the admin screen but no eval measures the admin screen**
  Người dùng thấy gì: Khong co phep kiem tu dong nao theo doi truc tiep man quan tri thanh vien, nen neu ai do sau nay sua lai cach loc danh sach, loi moi da huy hoac bi tu choi co the lai hien nham nhu dang cho ma khong bi phat hien.
  file: `_acceptance/loi-moi-da-huy-van-cho-vao/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **E4's `expected` claims a refuse-to-measure guard that the `du-lieu-cu` block does not contain**
  Người dùng thấy gì: Tai lieu mo ta phep kiem co ghi rang co mot buoc kiem tra chan du lieu cu, nhung buoc do thuc ra khong chay o dung cho duoc ghi — nen tai lieu dang hua nhieu hon thuc te do duoc.
  file: `_acceptance/loi-moi-da-huy-van-cho-vao/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **The same file mixes the vocabulary constant on writes with raw string literals on reads**
  Người dùng thấy gì: Mot phan ma van dung chuoi trang thai viet tay o cho khac thay vi dung chung mot nguon, nen neu danh sach trang thai hop le thay doi sau nay, mot so cho co the khong duoc cap nhat theo va gay lech hanh vi giua cac phan cua he thong.
  file: `apps/api/src/workspace/workspace.service.ts`
  severity: low
  Đề xuất: known-limits

- **The AC-5 gate parses better-auth's type by grepping compiled output, the technique its own eval text rejects**
  Người dùng thấy gì: Cach do de xac nhan danh sach trang thai khop voi goi ngoai dung ky thuat co the doc nham du lieu neu goi do thay doi cau truc ben trong, khien phep kiem co the bao an toan nham hoac bao loi nham trong tuong lai.
  file: `_acceptance/loi-moi-da-huy-van-cho-vao/rang/tu-vung-goi.mjs`
  severity: low
  Đề xuất: known-limits

- **revokeAllowance/removeMember write the "canceled" status via a positional array index that nothing pins**
  Người dùng thấy gì: Cung nguy co nhu tren: neu thu tu noi bo cua cac trang thai bi doi, nut thu hoi loi moi cua quan tri vien co the ghi sai trang thai va nguoi bi thu hoi co the dang nhap lai duoc ma khong co canh bao nao.
  file: `apps/api/src/workspace/workspace.service.ts`
  severity: high
  Đề xuất: known-limits

- **toStatus() discards the parse error, so an unreadable status reaches the API with nothing logged**
  Người dùng thấy gì: Khi he thong gap mot trang thai loi moi la khong doc duoc, loi do khong duoc ghi lai o phia may chu, nen doi van hanh se khong co cach nao phan biet duoc do la loi du lieu hay chi don gian la loi moi khong con hieu luc.
  file: `apps/api/src/workspace/workspace.service.ts`
  severity: medium
  Đề xuất: known-limits

- **Legacy "cancelled" rows are never migrated although the write side switched to "canceled" — neither branch the Gate 1 figure offered**
  Người dùng thấy gì: Cac loi moi da bi thu hoi tu truoc khi co ban sua nay van mang mot nhan trang thai cu khac voi nhan moi; he thong van tu choi cho ho vao dung nhu mong doi, nhung moi lan ho thu dang nhap se tao ra mot dong nhat ky loi gay nhieu, va chua ai quyet dinh co can don du lieu cu do hay khong.
  file: `apps/api/src/workspace/workspace.service.ts`
  severity: medium
  Đề xuất: known-limits

- **E2, E4 and E7 expected-text claims assertions that the tests they run do not contain**
  Người dùng thấy gì: Tai lieu mo ta mot so phep kiem hua co buoc kiem tra chan du lieu cu, nhung it nhat mot trong so cac phep kiem do khong co buoc kiem tra nhu da ghi — tai lieu dang mo ta nhieu hon thuc te do duoc.
  file: `_acceptance/loi-moi-da-huy-van-cho-vao/evals.yaml`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 (fixture đúng khuôn bên ghi, không round-trip): kỳ vọng dùng ĐÚNG biểu thức mà mã sản phẩm dùng để ghi — assert không thể đỏ**
  Người dùng thấy gì: Mot trong cac phep kiem tu dong so sanh gia tri da luu voi chinh cong thuc ma ma ghi ra, nen neu cong thuc do ghi sai gia tri trong mot lan sua sau nay, phep kiem se khong phat hien ra va nguoi bi thu hoi co the lai dang nhap duoc ma khong co bao dong nao.
  file: `apps/api/test/workspace-thanh-vien.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 2 (fixture lấy theo vị trí, không neo vào chuỗi): ô «canceled» và ô «rejected» của ma trận không được ghim vào trạng thái mà nhãn của chúng khai**
  Người dùng thấy gì: Bang doi chieu trang thai dung trong phep kiem khong thuc su gan co dinh vao chuoi trang thai ma no noi den, nen neu thu tu trang thai bi doi trong mot lan sua sau nay, phep kiem co the dang do nham trang thai ma khong ai biet.
  file: `packages/auth/test/loi-moi-ket-thuc.spec.ts`
  severity: high
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 4/12 lỗi rơi vào file không bộ đo nào phủ (apps/api/src/workspace/workspace.contracts.ts, _acceptance/loi-moi-da-huy-van-cho-vao/evals.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.