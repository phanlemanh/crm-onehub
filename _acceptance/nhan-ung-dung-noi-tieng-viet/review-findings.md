## Trong hợp đồng

- **Stringly-typed message key smuggled through the `label` field, resolved by cast with a silent fallback**
  file: `apps/app/lib/social-links.ts:52`
  severity: high
  AC: AC-2
  `COMPANY_LINKS` stores message-key sentinels in the field typed as a display label:

      { key: "pricingUrl", label: "facts.pricing", icon: Money },
      { key: "careersUrl", label: "facts.careers", icon: UserMultiple },

  and `companySocialLinks` resolves them at runtime with an assertion plus a fallback:

      const label = { "facts.pricing": m.pricing, "facts.careers": m.careers };
      return present(company, COMPANY_LINKS).map((link) => ({
        ...link,
        label: label[link.label as keyof typeof label] ?? link.label,
      }));

  Nothing is checked. `label` is `string`, so the `as keyof typeof label` cast makes the lookup compile for any value, and `?? link.label` swallows a miss — a renamed sentinel or a typo prints the literal text `facts.pricing` into the UI, in both languages, with no compile error and no test failure. This is the shape AGENTS.md and CONTRIBUTING.md rule out: a magic string standing in for a contract, an `as` cast standing in for a parser.

  The same change already establishes the correct pattern four times over — `khoa` as a separate field typed `keyof ReturnType<typeof crmMessages>[...]` in apps/app/lib/activity-presentation.ts:17, apps/app/lib/enrichment-status.ts:9, apps/app/lib/activity-recency.ts:5 and apps/app/components/crm/closing-window.ts:5. social-links.ts is the one module that did not follow it.

  Secondary: `contactSocialLinks` (line 60) takes no locale at all, so the contact-side labels stay unlocalised while the company side is localised.

- **Hình 1 — đo tiền đề dữ liệu thay vì đầu ra hiển thị (E11 không thể đỏ theo chiều đã khai)**
  file: `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/du-lieu-bien.mjs:68`
  severity: high
  AC: AC-11
  E11 hứa ba việc: (a) tự DỰNG ba trạng thái còn thiếu và "PHAI bao so hang no vua tao — bao 0 la chan chua cham gi"; (b) đo "chu van tieng Viet va khong o nao vo bo cuc"; (c) chiều đỏ: "tra chu thoi-gian-tuong-doi (just now / ago) ve tieng Anh thi do; day la chan DUY NHAT cham duoc chung".

  Mã thực tế chỉ gọi `companies.list` qua tRPC (dòng 45-50) rồi ĐẾM hàng có sẵn theo ba bộ lọc (dòng 55-67), và exit 1 khi một bộ lọc đếm được 0 (dòng 71, 79). Không có `writeFile`, không có mutation tRPC nào — nó không tạo hàng nào, nên "số hàng vừa tạo" không tồn tại. Không có puppeteer, không mở trang, không đọc DOM — nó không nhìn thấy một chữ nào trên màn hình.

  Hệ quả cụ thể: trả `crm.time.ago` / `crm.time.minutes` về tiếng Anh thì `du-lieu-bien.mjs` vẫn exit 0, vì đầu ra duy nhất nó đọc là `rows` của API. Chiều đỏ đã khai ở E11 là bất khả thi với chặn này. Nó đo tiền đề (cơ sở dữ liệu thử có đủ trạng thái chưa), không đo đầu ra (màn hình vẽ ra chữ gì).

- **Hình 5 — tuyên quét đủ bảy giá trị nhưng chỉ assert trên giá trị tình cờ vẽ ra**
  file: `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/khai-tieng.mjs:151`
  severity: medium
  AC: AC-14
  E16 khai một ma trận toàn phần: "GOI TEN DU BAY gia tri giai doan... Voi tung gia tri: khang dinh chu tren man KHONG bi dich, VA phan tu chua no khai lang='en'... them mot giai doan thu tam ma khong ai boc thi chan nay do".

  Mã có kiểm số phần tử ở đầu vào (dòng 145-148: `GIAI_DOAN.length !== 7` thì cụt), nhưng số KHẲNG ĐỊNH thì không bằng 7. Với mỗi giá trị không tìm thấy trên trang, dòng 151-154 in "khong hien" rồi `continue`; `hong` chỉ cộng từ những chỗ CÓ hiện mà thiếu `lang="en"` (dòng 157-158), và mã thoát ở dòng 163 chỉ đọc `hong`. Một giai đoạn thứ tám không ai bọc, nếu chưa có thoả thuận nào ở giai đoạn đó, sẽ đi qua im lặng — đúng lớp lỗi E16 nói mình chặn.

  Nhánh mặc định (E7, dòng 171) còn nhẹ hơn: `if (cho.length === 0) continue;` — không in, không đếm, không đối chứng dương nào. Nếu cột `Ngành` bị ẩn hoặc không giá trị nào vẽ ra thì `hong = 0` và E7 xanh mà chưa đo gì.

- **Hình 5 — ma trận E10 khai 3 màn × 4 bề rộng × 2 thứ tiếng, chỉ 12/24 ô có khẳng định**
  file: `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/ban-ve.mjs:1087`
  severity: medium
  AC: AC-10
  E10 khai: "Do be rong o chua chu va be rong chu that cua moi tieu de cot, o 768/1024/1280/1440px, CA HAI THU TIENG. O >=1024px: 0 tieu de bi cat. O 768px: moi cho cat deu co dau ba cham VA title VA chu day du trong cay tro nang."

  Bản tiếng Anh có được vẽ (`en` ở dòng 1066) nhưng chỉ được IN ra (dòng 1078); `catTran` và `catCoBaCham` chỉ cộng trong vòng lặp `vi.value` (dòng 1072-1077), và ngưỡng ở dòng 1087 chỉ đọc hai biến đó. Nửa tiếng Anh của ma trận không có khẳng định nào — `be-rong.sh` chạy 12 ô (3 màn × 4 bề rộng), không phải 24.

  Ở 768px còn hụt thêm hai điều kiện đã hứa: `nguong = catTran` bỏ qua cả `h.title` lẫn chữ đầy đủ trong cây trợ năng. `h.title` được tính (dòng 380-383) và in ra (`title=co/khong`) nhưng không bao giờ làm chặn đỏ; "chu day du trong cay tro nang" không được đọc ở đâu cả. File bằng chứng `E10-chu-hien-ra.txt` (dòng 1079-1086) cũng chỉ ghi bảng tiếng Việt — mà đó lại là đầu vào bắt buộc của E14 cho câu hỏi "cặp nhãn nào dễ lẫn khi bị cắt".

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Hardcoded "en" locale literal where the reader's locale is already in scope**
  Người dùng thấy gì: Trên màn tổng quan doanh số, một câu mô tả trộn tiếng Việt và tiếng Anh — số tiền đã dịch nhưng số lượng thoả thuận vẫn hiện chữ Anh.
  file: `apps/app/app/(app)/[slug]/sales-dashboard.tsx`
  severity: high
  Đề xuất: known-limits

- **Compile-time exhaustive lookup maps replaced by if/if/return chains**
  Người dùng thấy gì: Nếu sau này có thêm một loại bản ghi mới, nhãn hiển thị của nó có thể tự động sai mà không ai được cảnh báo.
  file: `apps/app/components/crm/fields/fields-copy.ts`
  severity: medium
  Đề xuất: known-limits

- **Dead hook call left behind, silenced with an underscore prefix**
  Người dùng thấy gì: Một đoạn tính toán thừa khiến khung hồ sơ làm việc nhiều hơn cần thiết, nhưng người dùng không thấy chữ nào sai.
  file: `apps/app/components/detail-sheet.tsx`
  severity: medium
  Đề xuất: wont-fix

- **Five message modules, two different fallback behaviours for the same closed union**
  Người dùng thấy gì: Một đoạn mã dự phòng thừa tồn tại trong kho chữ nhưng không ảnh hưởng gì tới chữ người dùng nhìn thấy.
  file: `apps/app/lib/messages/companies.ts`
  severity: low
  Đề xuất: wont-fix

- **The dead-key guard cannot fail for realistic keys — ~18 declared keys have no reader and it stays green**
  Người dùng thấy gì: Bài kiểm không thật sự chứng minh được mọi nhãn dịch có nơi sử dụng, nên nhãn thừa có thể tồn đọng âm thầm trong kho chữ.
  file: `apps/app/test/messages-guard.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **The single-contact delete dialog lost the email-suppression warning**
  Người dùng thấy gì: Khi xoá một liên hệ, người dùng không còn được cảnh báo rằng email của họ sẽ bị chặn và không tự động ghi nhận lại được.
  file: `apps/app/components/crm/record-sheet/contact-sheet.tsx`
  severity: medium
  Đề xuất: new-contract

- **The mutation sweep rewrites tracked source files in place and only restores on a clean exit**
  Người dùng thấy gì: Nếu công cụ đo bị ngắt giữa chừng, mã nguồn thật có thể bị bỏ lại ở trạng thái tiếng Anh cho tới khi ai đó phát hiện và khôi phục.
  file: `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/dot-bien.mjs`
  severity: medium
  Đề xuất: known-limits

- **formatCount is pinned to "en" beside locale-aware money in the same component**
  Người dùng thấy gì: Trên màn tổng quan, số đếm hoạt động hiện tiếng Anh cạnh số tiền đã dịch sang tiếng Việt.
  file: `apps/app/app/(app)/[slug]/dashboard-summary.tsx`
  severity: low
  Đề xuất: known-limits

- **Two message lookups are computed, assigned to `_m`, and never used**
  Người dùng thấy gì: Một đoạn tính toán thừa làm hai khung màn hình làm việc nhiều hơn cần thiết, không ảnh hưởng chữ người dùng thấy.
  file: `apps/app/components/detail-sheet.tsx`
  severity: low
  Đề xuất: wont-fix

- **Hình 3 — assert "chuỗi có mặt" thay cho quan hệ khoá↔chỗ gọi (chặn khoá chết vô hiệu)**
  Người dùng thấy gì: Bài kiểm gần như luôn xanh cho dù một nhãn dịch không còn nơi nào dùng tới, nên rác trong kho chữ khó bị phát hiện.
  file: `apps/app/test/messages-guard.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Hình 4 — khẳng định âm-tính-một-mình: đối chứng dương được tính nhưng không chặn**
  Người dùng thấy gì: Một số câu có thể chưa thật sự được kiểm chứng dịch đúng, vì phép đo coi 'không thấy trên màn' cũng tính là 'đã dịch xong'.
  file: `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/no-vong-1.mjs`
  severity: high
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

(không có)

⚠ Cụm ngoài vùng phủ: 3/15 lỗi rơi vào file không bộ đo nào phủ (apps/app/lib/social-links.ts, apps/app/test/messages-guard.spec.ts) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
