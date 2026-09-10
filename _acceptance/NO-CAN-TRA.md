# Nợ cần trả — những việc cổng đã gọi tên nhưng chưa ai mở hồ sơ

> Bảng này do máy dựng từ mục **Ngoài hợp đồng** của mọi `review-findings.md`
> trong `_acceptance/`, lọc lấy các mục chủ kho đã định đoạt **«mở hợp đồng
> mới»** tại Cổng 2. Chúng là lỗi THẬT, đã được nhìn thấy và đã được phê — chỉ
> chưa cái nào thành hồ sơ.
>
> Dựng lần đầu 07/09/2026. Dựng lại bằng cách quét lại các file nguồn; đừng sửa
> tay từng dòng ở đây mà quên sửa nguồn.
>
> Hai bộ từ mức nặng cùng tồn tại (`P1/P2` và `high/medium/low`) vì các vòng
> dùng phiên phản biện khác nhau. Cột **Bậc** gộp lại: `P1`/`high` → nặng ·
> `P2`/`medium` → vừa · `low` → nhẹ.


**18 mục** · nặng 8 · vừa 9 · nhẹ 1 · từ 10 hồ sơ


## Nặng

### Bộ thước màn chỉ nhìn thấy khung nội dung, bỏ qua thanh bên và thanh đầu

**Người dùng thấy gì:** trên màn Tác nhân của đội, mắt người đọc được khoảng hai chục câu tiếng Việt, còn phép đo màn chỉ gom được 5 câu — mọi chữ ở thanh bên và thanh đầu ứng dụng nằm ngoài tầm nó, ở cả ba hồ sơ Việt hoá dùng chung bộ thước. Một câu tiếng Anh sót ở đó đi qua mọi cổng mà không ai bắt.

**Vì sao tách thành hồ sơ riêng:** đo ngày 06/09: gốc gom chữ là phần tử cha của `main`; "OneHub CRM" và câu rỗng của thanh bên đều NGOÀI gốc, chỉ câu rỗng của đội là TRONG. Nới gốc kéo cả vùng còn tiếng Anh của hồ sơ khác vào phép đo của ba hồ sơ, nên không sửa tại chỗ được

hồ sơ gốc `agent-builder-noi-tieng-viet` · mức gốc `P1` · file `_acceptance/man-cai-dat-noi-tieng-viet/rang/man-that-lib.mjs`

### Bốn màn trong bản khai không phủ được các component chỉ hiện sau khi bấm

**Người dùng thấy gì:** mười component — hộp thoại, menu, ngăn kéo, chú giải — chỉ vẽ ra sau khi người bấm, nên phép đo trên màn không bao giờ nhìn tới chúng; nếu một trong số đó mang chữ tiếng Anh của thư viện thì vòng này không thấy.

**Vì sao tách thành hồ sơ riêng:** cần một chân lái từng component ra màn; vòng này khai giới hạn thành bảng đếm được có chiều đỏ, nhưng khai không thay được đo Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

hồ sơ gốc `chu-mac-dinh-thu-vien-ngoai` · mức gốc `P1` · file `_acceptance/chu-mac-dinh-thu-vien-ngoai/rang/gioi-han-bam-moi-hien.json`

### Contract widened to a fourth screen; every browser check still enumerates three

**Người dùng thấy gì:** Màn xin quyền truy cập không nằm trong bất kỳ phép kiểm tra tự động nào, nên lỗi tiếng Việt hoặc lỗi hiển thị ở màn đó có thể lọt qua mà không ai phát hiện.

hồ sơ gốc `cua-vao-noi-tieng-viet` · mức gốc `high` · file `_acceptance/cua-vao-noi-tieng-viet/contract.md`

### signOutAndRedirect swallows the sign-out error, so the new localized message is dead and users see hardcoded English

**Người dùng thấy gì:** Khi một người dùng tiếng Việt bấm đăng xuất ở màn xin quyền truy cập và thao tác đó thất bại, họ có thể thấy một dòng thông báo lỗi bằng tiếng Anh giữa một màn hoàn toàn tiếng Việt.

hồ sơ gốc `cua-vao-noi-tieng-viet` · mức gốc `high` · file `apps/app/lib/sign-out.ts`

### /grant-access is in no runtime eval chapter — its translations and translate="no" marks are unverified

**Người dùng thấy gì:** Các câu tiếng Việt và các đánh dấu 'không dịch' trên màn xin quyền truy cập chưa từng được máy tự kiểm tra, nên lỗi ở màn này có thể không bị phát hiện.

hồ sơ gốc `cua-vao-noi-tieng-viet` · mức gốc `high` · file `_acceptance/cua-vao-noi-tieng-viet/rang/cua-vao.mjs`

### Bản khai input của bộ vẽ ghim tên hồ sơ, nên nó sẽ chết khi hồ sơ ấy được dọn

**Người dùng thấy gì:** không thấy gì hôm nay — nhưng `packages/ui/turbo.json` khai `_acceptance/chan-lai-component-ra-man/**` theo tên. Ngày nào bộ vẽ đọc thêm một hồ sơ khác, hoặc hồ sơ này được dời đi, khoá cache lại nói dối và không chân nào báo. Chân AC-3 chỉ đo hai dòng đã ghim, không đo «đã khai ĐỦ».

**Vì sao tách thành hồ sơ riêng:** cần một chân suy danh sách file bộ vẽ ĐỌC THẬT lúc chạy rồi đối chiếu với bản khai; đó là một phép đo khác hẳn và cần một vòng riêng

hồ sơ gốc `lenh-chung-khong-an-cache-doi` · mức gốc `P1` · file `packages/ui/turbo.json`

### Lỗ re-pin của bộ kit vẫn còn nguyên

**Người dùng thấy gì:** nghi thức re-pin chỉ chạy bốn lệnh chứng chứ không chạy lại phép đo của hồ sơ. Chính nó đã cho một hồ sơ ký hỏng đi thẳng vào nhánh chính hôm qua, và CI xanh suốt.

**Vì sao tách thành hồ sơ riêng:** lỗi của bộ kit đi chip riêng sang `~/dev/acceptance-gate-kit` theo CLAUDE.md, không sửa tại chỗ

hồ sơ gốc `thuoc-cache-het-doi-tuong` · mức gốc `P1` · file `_acceptance/thuoc-cache-het-doi-tuong/decisions.jsonl`

### `dot-bien.mjs` exits without cleanup on the "cay lanh da do" path, leaking a detached dev server on port 3200 and a git worktree

**Người dùng thấy gì:** Khi công cụ đột biến gặp một tình huống lỗi hiếm, nó có thể để lại một máy chủ và một bản sao kho chạy ngầm không dọn dẹp, khiến lượt đo kế tiếp vô tình đọc nhầm bản cũ mà vẫn báo kết quả trông hợp lệ.

hồ sơ gốc `thuoc-cua-lat-3a-co-rang` · mức gốc `high` · file `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/dot-bien.mjs:341`


## Vừa

### Trạng thái tác nhân hiện ra bằng tiếng Anh

**Người dùng thấy gì:** danh sách tác nhân của đội in trạng thái là `draft`, `live`, `paused` — chữ tiếng Anh viết thường, giữa một màn đã tiếng Việt.

**Vì sao tách thành hồ sơ riêng:** nó không phải chuỗi hằng nên không bộ quét nào thấy, và chỉ vẽ ra khi đội đã có tác nhân, tức sau giới hạn route; gộp với đợt hai

hồ sơ gốc `agent-builder-noi-tieng-viet` · mức gốc `P2` · file `apps/app/components/agent-builder/team-agents-index.tsx:49`

### Nhãn trợ năng đến từ mặc định của thư viện ngoài

**Người dùng thấy gì:** vùng tin nhắn có một nhãn tiếng Anh cho trình đọc màn hình mà không file nguồn nào của kho chứa nó, nên không bộ quét tĩnh nào có thể thấy.

**Vì sao tách thành hồ sơ riêng:** vòng này đã kéo nhãn đó về kho chuỗi tại chỗ gọi, nhưng lớp lỗi vẫn còn: mọi mặc định khác của thư viện vẫn vô hình với bộ quét Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

hồ sơ gốc `cua-so-tro-chuyen-noi-tieng-viet` · mức gốc `P2` · file `packages/ui/src/components/message-scroller.tsx`

### Bộ test của gói auth xanh nhờ may, không nhờ thiết kế

**Người dùng thấy gì:** `packages/auth/src/env.ts` chốt `API_URL` đúng một lần lúc nạp module. `test/sso.spec.ts` đặt biến ấy rồi mới nạp — nên nó chỉ đúng khi tình cờ là file ĐẦU TIÊN chạm `src/env`. Vòng này thêm hai thuộc phải với tới hook thật của better-auth, tức phải nạp `src/auth` → `src/env`, và hai câu khẳng định của `sso.spec.ts` đỏ ngay. Đo thêm: bun nạp file theo thứ tự thư mục chứ không theo bảng chữ cái, nên đổi tên file không cứu được. Máy đã vá bằng một `bunfig.toml` riêng cho gói auth ghim sẵn `API_URL` trước khi bất kỳ module nào nạp — không sửa một ký tự nào của `sso.spec.ts`. Cả hai chiều đã đo: bỏ preload thì 2 ca đỏ trở lại; phá `ssoCallbackBase()` thì 2 ca ấy vẫn đỏ, tức chúng còn răng.

**Vì sao tách thành hồ sơ riêng:** cái vá làm bộ test hết phụ thuộc thứ tự, nhưng gốc vẫn là mã sản xuất của hãng đọc môi trường một lần lúc nạp; sửa nó là đổi mã sản xuất T3 ngoài phạm vi vòng này

hồ sơ gốc `hd-theo-danh-sach` · mức gốc `P2` · file `packages/auth/src/env.ts`

### Bản vá `hd` chưa gửi ngược lên hãng

**Người dùng thấy gì:** `CLAUDE.md` nói sửa được ở hãng thì gửi lên hãng. Đây đúng là mã của hãng phá hợp đồng do chính hãng công bố trong `.env.example` và khẳng định trong test của hãng, nhưng vòng này mới chỉ vá ở bản rẽ.

**Vì sao tách thành hồ sơ riêng:** gửi ngược lên hãng là một việc riêng có nhịp riêng, không chặn lộ trình triển khai

hồ sơ gốc `hd-theo-danh-sach` · mức gốc `P2` · file `packages/auth/src/auth.ts`

### `ci.yml` của hãng vẫn không chạy lệnh dựng

**Người dùng thấy gì:** vòng này đưa lệnh dựng vào `pre-push` và vào CI riêng của công ty, nhưng CI của hãng vẫn chỉ chạy bốn lệnh cũ. Ai chạy CI của hãng — kể cả chính hãng — vẫn không thấy lớp lỗi này.

**Vì sao tách thành hồ sơ riêng:** `CLAUDE.md` cấm chạm `ci.yml` của hãng, nên đây là việc gửi ngược lên hãng, có nhịp riêng

hồ sơ gốc `lenh-dung-do-khong-ai-thay` · mức gốc `P2` · file `.github/workflows/ci.yml`

### Kho khai `engines: node >=22` nhưng `eve build` đòi >=24

**Người dùng thấy gì:** một máy cài Node 22 — đúng như kho khai là đủ — sẽ không dựng nổi `apps/agent`. CI của hãng chưa bao giờ thấy vì nó không dựng; vòng này thêm lệnh dựng vào CI riêng nên lộ ra ngay ở lượt chạy đầu.

**Vì sao tách thành hồ sơ riêng:** sửa `engines` là chạm khai báo của hãng, và đây là thứ nên gửi ngược lên hãng chứ không vá riêng; vòng này ghim Node 24 trong job CI để cổng chạy được

hồ sơ gốc `lenh-dung-do-khong-ai-thay` · mức gốc `P2` · file `package.json`

### The single-contact delete dialog lost the email-suppression warning

**Người dùng thấy gì:** Khi xoá một liên hệ, người dùng không còn được cảnh báo rằng email của họ sẽ bị chặn và không tự động ghi nhận lại được.

hồ sơ gốc `nhan-ung-dung-noi-tieng-viet` · mức gốc `medium` · file `apps/app/components/crm/record-sheet/contact-sheet.tsx`

### The two JSON declarations that drive the registry are parsed with no schema

**Người dùng thấy gì:** Nếu một tệp khai báo bên trong bị sai định dạng, công cụ đo có thể dừng đột ngột thay vì báo rõ nguyên nhân, khiến người xem kết quả khó biết đo được hay không.

hồ sơ gốc `thuoc-cua-lat-3a-co-rang` · mức gốc `medium` · file `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/khai-sinh.mjs:26`

### Hình dạng 6 — mặc định cổng 3000/3001 trỏ về checkout chính, không phải cây đang kiểm

**Người dùng thấy gì:** Nếu ai chạy riêng một phép đo mà không qua cấu hình chung, phép đo đó có thể âm thầm kiểm tra nhầm sang bản chạy chính thay vì bản đang xét, mà vẫn in ra kết quả trông hợp lệ.

hồ sơ gốc `thuoc-cua-lat-3a-co-rang` · mức gốc `medium` · file `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/khai-tieng.mjs:10`


## Nhẹ

### CLAUDE.md still documents ports 3000/3001 that the new executors no longer measure

**Người dùng thấy gì:** Tài liệu hướng dẫn chạy thử vẫn ghi hai cổng cũ; ai làm đúng theo hướng dẫn có thể vô tình kiểm tra nhầm phiên bản khác, mà kết quả vẫn trông bình thường.

hồ sơ gốc `thuoc-cua-lat-3a-co-rang` · mức gốc `low` · file `CLAUDE.md:90`


## Chờ Cổng 2 — chưa tính vào 18 mục trên

> Mục dưới đây đã có ở `## Ngoài hợp đồng` của hồ sơ nguồn nhưng chủ kho
> chưa định đoạt tại Cổng 2, nên nó chưa phải một dòng nợ chính thức. Khi
> Cổng 2 của hồ sơ nguồn đóng, quét lại nguồn và chuyển nó lên đúng bậc.

### Cửa sổ cắm vết vẫn mở với giám khảo và với bộ chạy kiểm thử của kho

**Người dùng thấy gì:** Không ảnh hưởng người dùng cuối. Đây là nợ hạ tầng đo lường: nó làm vòng chấm trả kết quả sai, khiến lỗi thật lẫn với báo động giả và mỗi vòng chấm tốn thêm một lượt.

**Vì sao chưa vào bảng chính:** hồ sơ ③b `cai-dat-con-lai-noi-tieng-viet` gọi tên đúng cửa sổ này ở `contract.md:160-169` rồi hoãn sang «đợt sau», nhưng viết trong phần tường thuật vòng chấm chứ không ở mục Ngoài hợp đồng — nên nó chưa từng được quét vào bảng. Vòng ③c-1 trả REJECT hai lần và BLOCKED một lần, cả ba màu đỏ đều do cửa sổ đó, và cả ba đều xanh khi chạy nối tiếp. Nay đã ghi đúng chỗ ở `_acceptance/tong-quan-va-khung-noi-tieng-viet/review-findings.md`.

hồ sơ gốc `tong-quan-va-khung-noi-tieng-viet` · mức gốc `high` · file `_acceptance/man-cai-dat-noi-tieng-viet/rang/khoa-cay.mjs`
